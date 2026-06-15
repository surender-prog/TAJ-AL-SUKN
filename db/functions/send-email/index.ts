// Supabase Edge Function: send-email
// Sends transactional emails through the SMTP account configured in admin
// (email_settings table, read with the service-role key so credentials stay
// server-side). Record-based types (booking/membership) build the recipient &
// body from the DB, so the public/anon site can only trigger predefined emails;
// admin-only types (test, invoice) require a signed-in admin token.
// Deploy: supabase functions deploy send-email   (verify_jwt = true)
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const money = (n: unknown) => {
  const v = Number(n);
  return (isFinite(v) ? v : 0).toFixed(3) + " BHD";
};

function wrap(cfg: any, heading: string, bodyHtml: string) {
  const brand = esc(cfg.from_name || "Taj Al Sukun Spa");
  return `<!doctype html><html><body style="margin:0;background:#F5EDE0;font-family:Helvetica,Arial,sans-serif;color:#2D1F14;">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px;">
    <div style="text-align:center;padding:18px 0 8px;">
      <div style="font-family:Georgia,serif;font-size:24px;color:#3D2417;letter-spacing:.5px;">${brand}</div>
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B07849;margin-top:4px;">Spa &amp; Wellness</div>
    </div>
    <div style="background:#fff;border:1px solid rgba(176,120,73,.2);border-radius:16px;padding:30px 28px;">
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:22px;color:#3D2417;margin:0 0 16px;">${heading}</h1>
      ${bodyHtml}
    </div>
    <p style="text-align:center;font-size:11px;color:#8A7363;margin-top:18px;line-height:1.6;">
      ${brand} · Al Fateh, Manama · Kingdom of Bahrain<br>This is an automated message regarding your activity with us.
    </p>
  </div></body></html>`;
}
const row = (label: string, val: string) =>
  `<tr><td style="padding:7px 0;color:#8A7363;font-size:13px;">${esc(label)}</td><td style="padding:7px 0;text-align:right;font-weight:600;color:#2D1F14;font-size:13px;">${esc(val)}</td></tr>`;
const table = (rows: string) =>
  `<table style="width:100%;border-collapse:collapse;margin:6px 0 4px;">${rows}</table>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    const type = String(body.type || "");

    // Is the caller a signed-in admin (real user token) vs the public anon key?
    let isAdmin = false;
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (token) {
      try { const { data } = await admin.auth.getUser(token); if (data?.user) isAdmin = true; } catch (_) { /* anon */ }
    }

    const { data: cfg } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
    if (!cfg) return json({ ok: false, error: "Email is not configured yet." });
    if (!cfg.enabled) return json({ ok: false, error: "Email sending is turned off in admin." });
    if (!cfg.host || !cfg.from_email) return json({ ok: false, error: "SMTP host / sender not set." });

    let to = "", subject = "", html = "";

    if (type === "test") {
      if (!isAdmin) return json({ ok: false, error: "Test emails require an admin session." }, 403);
      to = String(body.to || cfg.admin_alert_email || cfg.from_email);
      subject = "Test email — Taj Al Sukun";
      html = wrap(cfg, "SMTP is working ✨", `<p style="font-size:14px;line-height:1.6;color:#5A4636;">If you're reading this, your transactional email settings are configured correctly.</p>`);
    } else if (type === "invoice" || (isAdmin && body.html)) {
      if (!isAdmin) return json({ ok: false, error: "Not allowed." }, 403);
      if (cfg.send_invoice === false && type === "invoice") return json({ ok: false, error: "Invoice emails are turned off." });
      to = String(body.to || "");
      subject = String(body.subject || "Your Taj Al Sukun invoice");
      html = body.html ? String(body.html) : wrap(cfg, subject, "<p>Please find your invoice attached.</p>");
    } else if (type === "booking_confirmation" || type === "new_booking_alert") {
      const { data: bk } = await admin.from("bookings").select("*").eq("id", body.bookingId).maybeSingle();
      if (!bk) return json({ ok: false, error: "Booking not found." });
      const details = table(
        row("Service", bk.service || "—") + row("Date", bk.date || "—") +
        row("Time", bk.time || "—") + (bk.therapist ? row("Therapist", bk.therapist) : "") +
        row("Total", money(bk.total ?? bk.price)),
      );
      if (type === "booking_confirmation") {
        if (cfg.send_booking === false) return json({ ok: false, error: "Booking emails are off." });
        to = bk.email || "";
        subject = "Your booking is confirmed — Taj Al Sukun";
        html = wrap(cfg, `Thank you, ${esc((bk.name || "").split(" ")[0] || "guest")} 🤎`,
          `<p style="font-size:14px;line-height:1.6;color:#5A4636;">Your reservation is confirmed. We look forward to welcoming you.</p>${details}`);
      } else {
        if (cfg.send_admin_alert === false) return json({ ok: false, error: "Admin alerts are off." });
        to = cfg.admin_alert_email || "";
        subject = `New booking: ${bk.name || ""} — ${bk.service || ""}`;
        html = wrap(cfg, "New booking received",
          `${table(row("Guest", bk.name || "—") + row("Phone", bk.phone || "—") + (bk.email ? row("Email", bk.email) : ""))}${details}`);
      }
    } else if (type === "membership_welcome" || type === "membership_activated") {
      if (cfg.send_membership === false) return json({ ok: false, error: "Membership emails are off." });
      const { data: m } = await admin.from("members").select("*").eq("id", body.memberId).maybeSingle();
      if (!m) return json({ ok: false, error: "Member not found." });
      to = m.email || "";
      const first = esc((m.name || "").split(" ")[0] || "there");
      if (type === "membership_welcome") {
        subject = "Welcome to Taj Al Sukun membership";
        html = wrap(cfg, `Welcome, ${first}!`,
          `<p style="font-size:14px;line-height:1.6;color:#5A4636;">Thank you for joining the <b>${esc(m.tier || "")}</b> membership. Your enrollment is received and is pending payment confirmation — our team will activate it shortly.</p>`);
      } else {
        subject = "Your membership is now active ✨";
        html = wrap(cfg, `You're all set, ${first}!`,
          `<p style="font-size:14px;line-height:1.6;color:#5A4636;">Your <b>${esc(m.tier || "")}</b> membership is now active${m.end_date ? ` through <b>${esc(m.end_date)}</b>` : ""}. Enjoy your member benefits on every visit.</p>`);
      }
    } else {
      return json({ ok: false, error: "Unknown email type." });
    }

    if (!to || !/.+@.+\..+/.test(to)) return json({ ok: false, error: "No valid recipient address." });

    const port = Number(cfg.port) || 587;
    const client = new SMTPClient({
      connection: {
        hostname: cfg.host,
        port,
        tls: cfg.security === "ssl",          // implicit TLS (465); STARTTLS upgrades on 587
        auth: cfg.username ? { username: cfg.username, password: cfg.password || "" } : undefined,
      },
    });
    await client.send({
      from: `${cfg.from_name || "Taj Al Sukun"} <${cfg.from_email}>`,
      to,
      replyTo: cfg.reply_to || undefined,
      subject,
      html,
    });
    await client.close();
    return json({ ok: true, to, type });
  } catch (e) {
    return json({ ok: false, error: String((e as any)?.message || e) });
  }
});
