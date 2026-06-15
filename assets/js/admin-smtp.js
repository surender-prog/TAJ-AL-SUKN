/* Taj Al Sukun — Email (SMTP) settings controller (admin.html → #sg-smtp)
   ============================================================
   Reads & writes the secured `email_settings` table (RLS: authenticated
   only — the public site can never read SMTP credentials). The password
   is never pulled back to the browser; it's only sent when the admin
   types a new one. "Send test" calls the send-email Edge Function. */
(function () {
  'use strict';
  const sb = () => (window.TajAdmin && window.TajAdmin.client && window.TajAdmin.client()) || window.__tajSb || (window.TajData && window.TajData._sb) || null;

  const $ = id => document.getElementById(id);
  const F = {
    enabled:   () => $('smtp-enabled'),
    fromName:  () => $('smtp-from-name'),
    fromEmail: () => $('smtp-from-email'),
    replyTo:   () => $('smtp-reply-to'),
    adminEmail:() => $('smtp-admin-email'),
    host:      () => $('smtp-host'),
    port:      () => $('smtp-port'),
    security:  () => $('smtp-security'),
    username:  () => $('smtp-username'),
    password:  () => $('smtp-password'),
    sBooking:  () => $('smtp-send-booking'),
    sMember:   () => $('smtp-send-membership'),
    sInvoice:  () => $('smtp-send-invoice'),
    sAlert:    () => $('smtp-send-admin-alert'),
  };

  function flash(msg, ok) {
    const el = $('smtp-flash');
    if (!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#2a8a4a' : '#c0392b';
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 4000);
  }

  async function load() {
    const c = sb();
    if (!c) return;
    try {
      const { data, error } = await c.from('email_settings')
        .select('enabled,host,port,security,username,from_name,from_email,reply_to,admin_alert_email,send_booking,send_membership,send_invoice,send_admin_alert')
        .eq('id', 1).maybeSingle();
      if (error) { console.warn('[smtp] load', error.message); return; }
      const d = data || {};
      if (F.enabled())   F.enabled().checked   = !!d.enabled;
      if (F.fromName())  F.fromName().value     = d.from_name || '';
      if (F.fromEmail()) F.fromEmail().value    = d.from_email || '';
      if (F.replyTo())   F.replyTo().value      = d.reply_to || '';
      if (F.adminEmail())F.adminEmail().value   = d.admin_alert_email || '';
      if (F.host())      F.host().value         = d.host || '';
      if (F.port())      F.port().value         = (d.port != null ? d.port : 587);
      if (F.security())  F.security().value      = d.security || 'tls';
      if (F.username())  F.username().value      = d.username || '';
      if (F.sBooking())  F.sBooking().checked    = d.send_booking !== false;
      if (F.sMember())   F.sMember().checked      = d.send_membership !== false;
      if (F.sInvoice())  F.sInvoice().checked     = d.send_invoice !== false;
      if (F.sAlert())    F.sAlert().checked       = d.send_admin_alert !== false;
    } catch (e) { console.warn('[smtp] load failed', e); }
  }

  async function save() {
    const c = sb();
    if (!c) { flash('Not connected.', false); return; }
    const btn = $('smtp-save');
    const old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…'; }
    const obj = {
      enabled:           !!F.enabled().checked,
      from_name:         F.fromName().value.trim(),
      from_email:        F.fromEmail().value.trim(),
      reply_to:          F.replyTo().value.trim() || null,
      admin_alert_email: F.adminEmail().value.trim() || null,
      host:              F.host().value.trim(),
      port:              parseInt(F.port().value, 10) || 587,
      security:          F.security().value,
      username:          F.username().value.trim(),
      send_booking:      !!F.sBooking().checked,
      send_membership:   !!F.sMember().checked,
      send_invoice:      !!F.sInvoice().checked,
      send_admin_alert:  !!F.sAlert().checked,
      updated_at:        new Date().toISOString(),
    };
    // Only overwrite the password when a new one is typed.
    const pw = F.password().value;
    if (pw) obj.password = pw;
    try {
      const { error } = await c.from('email_settings').update(obj).eq('id', 1);
      if (error) throw error;
      F.password().value = '';
      flash('SMTP settings saved.', true);
    } catch (e) {
      flash('Save failed: ' + (e.message || e), false);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
    }
  }

  async function sendTest() {
    const c = sb();
    const to = ($('smtp-test-to').value || '').trim();
    if (!to) { flash('Enter an address to test.', false); return; }
    const btn = $('smtp-test');
    const old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…'; }
    flash('Sending test… (save first if you just changed settings)', true);
    try {
      const { data, error } = await c.functions.invoke('send-email', { body: { type: 'test', to } });
      if (error) throw error;
      if (data && data.ok) flash('Test email sent to ' + to + ' ✓', true);
      else flash('Could not send: ' + ((data && data.error) || 'unknown error'), false);
    } catch (e) {
      flash('Could not send: ' + (e.message || e), false);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
    }
  }

  function init() {
    if (!$('sg-smtp')) return;
    $('smtp-save') && $('smtp-save').addEventListener('click', save);
    $('smtp-test') && $('smtp-test').addEventListener('click', sendTest);
    // Load once the admin client is ready (auth session may resolve async).
    let tries = 0;
    (function waitReady() {
      if (sb()) { load(); return; }
      if (tries++ < 40) setTimeout(waitReady, 200);
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
