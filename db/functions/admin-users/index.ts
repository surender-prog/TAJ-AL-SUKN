// Supabase Edge Function: admin-users
// ============================================================================
// Owner-only user management for the admin panel. The service-role key stays
// server-side; every action verifies the CALLER is an authenticated, ACTIVE
// OWNER (looked up in the `admins` table by the JWT's email) before touching
// Supabase Auth. Actions:
//   create        → create the Auth login + the admins profile row (atomic)
//   set_password  → set a user's password; creates their login if they have a
//                   profile but no Auth login yet (legacy/manually-added rows)
//   delete        → delete the Auth login + the admins profile row
// Self password changes do NOT use this function — the signed-in user updates
// their own password client-side via supabase.auth.updateUser({ password }).
//
// Deploy:  supabase functions deploy admin-users   (verify_jwt = true)
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
const log = (...a: unknown[]) => console.log("[admin-users]", ...a);

const ROLES = ["owner", "manager", "receptionist"];
const isEmail = (s: string) => /.+@.+\..+/.test(s);

// Insert an admins row, dropping any column the schema doesn't have yet (so it
// still works before migration 008 adds user_id/phone/title/notes).
async function insertAdminResilient(admin: any, row: Record<string, unknown>) {
  const ext = ["user_id", "phone", "title", "notes"];
  const payload: Record<string, unknown> = { ...row };
  for (let i = 0; i < 6; i++) {
    const { error } = await admin.from("admins").insert(payload);
    if (!error) return null;
    const m = (error.message || "").toLowerCase();
    const bad = ext.find((k) => (k in payload) && (m.includes("'" + k + "'") || m.includes('"' + k + '"') || m.includes(k + " column") || (m.includes(k) && (m.includes("does not exist") || m.includes("schema cache")))));
    if (bad) { delete payload[bad]; continue; }
    return error;
  }
  return { message: "insert failed" };
}

// Resolve a Supabase Auth user id by email (paginate; admin API has no direct
// get-by-email). Used for legacy admins rows that have no stored user_id.
async function findAuthIdByEmail(admin: any, email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data || !data.users || !data.users.length) return null;
    const hit = data.users.find((u: any) => (u.email || "").toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1) Authenticate the caller from their JWT.
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: false, error: "Sign in required." }, 401);
    const { data: who, error: whoErr } = await admin.auth.getUser(token);
    if (whoErr || !who?.user?.email) return json({ ok: false, error: "Invalid session." }, 401);
    const callerEmail = who.user.email.toLowerCase();

    // 2) Authorise: caller must be an ACTIVE OWNER in the admins table.
    const { data: me } = await admin
      .from("admins").select("id,role,status").ilike("email", callerEmail).limit(1).maybeSingle();
    if (!me || me.role !== "owner" || (me.status && me.status !== "active")) {
      return json({ ok: false, error: "Only an active Owner can manage users." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    // ---- create: provision Auth login + admins profile (atomic) ------------
    if (action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      const role = ROLES.includes(body.role) ? body.role : "receptionist";
      const status = body.status === "disabled" ? "disabled" : "active";
      if (!isEmail(email)) return json({ ok: false, error: "Enter a valid email." }, 400);
      if (password.length < 8) return json({ ok: false, error: "Password must be at least 8 characters." }, 400);
      if (!name) return json({ ok: false, error: "Name is required." }, 400);

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (cErr || !created?.user) {
        const m = String(cErr?.message || "Could not create the login.");
        return json({ ok: false, error: /already.*registered|exists/i.test(m) ? "A login with that email already exists." : m }, 400);
      }
      const uid = created.user.id;
      const id = "ADM-" + Date.now().toString().slice(-6);
      const row: Record<string, unknown> = {
        id, user_id: uid, name, email, role, status,
        phone: body.phone ? String(body.phone) : null,
        title: body.title ? String(body.title) : null,
        notes: body.notes ? String(body.notes) : null,
      };
      const insErr = await insertAdminResilient(admin, row);
      if (insErr) {
        // Roll back the orphaned Auth user so create stays atomic.
        try { await admin.auth.admin.deleteUser(uid); } catch (_) { /* ignore */ }
        return json({ ok: false, error: "Profile save failed: " + insErr.message }, 400);
      }
      log("created", { email, role, by: callerEmail });
      return json({ ok: true, id, user_id: uid });
    }

    // ---- set_password: set a user's password; create the login if they have
    //      a profile but no Auth login yet (legacy/manually-added admins). -----
    if (action === "set_password") {
      const password = String(body.password || "");
      if (password.length < 8) return json({ ok: false, error: "Password must be at least 8 characters." }, 400);
      let uid = body.user_id ? String(body.user_id) : "";
      const email = String(body.email || "").trim().toLowerCase();
      if (!uid && email) uid = (await findAuthIdByEmail(admin, email)) || "";
      let createdLogin = false;
      if (uid) {
        const { error: upErr } = await admin.auth.admin.updateUserById(uid, { password });
        if (upErr) return json({ ok: false, error: upErr.message }, 400);
      } else {
        // No login yet → provision one for this email so they can sign in.
        if (!isEmail(email)) return json({ ok: false, error: "This user has no login and no valid email to create one." }, 400);
        const { data: created, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (cErr || !created?.user) {
          const m = String(cErr?.message || "Could not create the login.");
          return json({ ok: false, error: /already.*registered|exists/i.test(m) ? "A login with that email already exists but couldn't be matched — try again." : m }, 400);
        }
        uid = created.user.id;
        createdLogin = true;
      }
      // Link the Auth uid back onto the profile row for next time (best-effort).
      if (email && uid) { try { await admin.from("admins").update({ user_id: uid }).ilike("email", email); } catch (_) { /* ignore */ } }
      log(createdLogin ? "login created + password set" : "password set", { email: email || uid, by: callerEmail });
      return json({ ok: true, created: createdLogin });
    }

    // ---- delete: remove the Auth login + the admins profile ----------------
    if (action === "delete") {
      const adminId = body.admin_id != null ? String(body.admin_id) : "";
      const email = String(body.email || "").trim().toLowerCase();
      if (!adminId && !email) return json({ ok: false, error: "Missing user reference." }, 400);
      if (email && email === callerEmail) return json({ ok: false, error: "You can't delete your own account." }, 400);

      // Resolve the target row by id (preferred) or email — no string-built filters.
      let target: any = null;
      if (adminId) {
        const { data } = await admin.from("admins").select("id,role,user_id,email").eq("id", adminId).maybeSingle();
        target = data;
      }
      if (!target && email) {
        const { data } = await admin.from("admins").select("id,role,user_id,email").ilike("email", email).maybeSingle();
        target = data;
      }
      // Guard the last owner.
      const { data: owners } = await admin.from("admins").select("id").eq("role", "owner").neq("status", "disabled");
      if (target && target.role === "owner" && (owners?.length || 0) <= 1) {
        return json({ ok: false, error: "You can't remove the last Owner." }, 400);
      }

      let uid = (target && target.user_id) ? String(target.user_id) : (body.user_id ? String(body.user_id) : "");
      if (!uid && email) uid = (await findAuthIdByEmail(admin, email)) || "";
      if (uid) { try { await admin.auth.admin.deleteUser(uid); } catch (e) { log("auth delete warn", String((e as any)?.message || e)); } }
      if (target?.id) { await admin.from("admins").delete().eq("id", target.id); }
      else if (adminId) { await admin.from("admins").delete().eq("id", adminId); }
      log("deleted", { email: email || adminId, by: callerEmail });
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unknown action." }, 400);
  } catch (e) {
    log("fatal", String((e as any)?.message || e));
    return json({ ok: false, error: String((e as any)?.message || e) }, 500);
  }
});
