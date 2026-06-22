/* Taj Al Sukun — Admin authentication (Supabase Auth)
   ============================================================
   Replaces the demo sessionStorage gate with a real Supabase
   session when the project is configured. Falls back to the
   legacy demo credentials only when Supabase is NOT configured
   (local/offline demo), so nothing breaks in either mode.

   Public API:
     TajAdmin.signIn(email, password)  -> { ok, error? }
     TajAdmin.signOut()                -> redirects to login
     TajAdmin.guard()                  -> redirect to login if no session
     TajAdmin.client()                 -> shared Supabase client (or null)
     TajAdmin.isSupabase               -> boolean
*/
(function () {
  'use strict';

  const cfg  = window.TAJ_SUPABASE || {};
  const SUPA = !!(cfg.ENABLED && window.supabase);

  // One shared client for the whole admin origin (avoids multiple-GoTrue warnings
  // and guarantees the auth session is reused by every page + the data layer).
  function client() {
    if (!SUPA) return null;
    if (window.__tajSb) return window.__tajSb;
    window.__tajSb = window.supabase.createClient(cfg.URL, cfg.ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return window.__tajSb;
  }

  const DEMO_EMAIL = 'admin@tasukunspa.com';
  const DEMO_PASS  = 'taj-admin';

  async function signIn(email, password) {
    email = (email || '').trim();
    if (!SUPA) {
      // Offline / unconfigured: accept the legacy demo credentials only.
      if (email === DEMO_EMAIL && password === DEMO_PASS) {
        sessionStorage.setItem('taj-admin-auth', '1');
        return { ok: true, demo: true };
      }
      return { ok: false, error: 'Supabase is not configured. Use the demo credentials shown below.' };
    }
    try {
      const { data, error } = await client().auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      if (!data || !data.session) return { ok: false, error: 'No session returned. Please try again.' };
      sessionStorage.setItem('taj-admin-auth', '1');
      return { ok: true, session: data.session, user: data.user };
    } catch (e) {
      return { ok: false, error: e.message || 'Sign-in failed.' };
    }
  }

  async function signOut() {
    sessionStorage.removeItem('taj-admin-auth');
    if (SUPA) { try { await client().auth.signOut(); } catch (_) {} }
    location.href = 'admin-login.html';
  }

  // Returns the live session (or null). Used by the guard + by code that
  // wants to show the signed-in admin's email.
  async function session() {
    if (!SUPA) return sessionStorage.getItem('taj-admin-auth') === '1' ? { demo: true } : null;
    try {
      const { data } = await client().auth.getSession();
      return data ? data.session : null;
    } catch (_) { return null; }
  }

  function initials(s) {
    return (String(s || 'A').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || 'A').toUpperCase();
  }

  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
  }

  // Reusable new-password modal. opts.onSubmit(password) -> { ok, error? }.
  // Used for "change my own password" here and password resets in admin-users.js.
  function passwordModal(opts) {
    const o = opts || {};
    const ov = document.createElement('div');
    ov.className = 'au-modal-ov';
    ov.style.cssText = 'position:fixed; inset:0; background:rgba(36,19,8,.55); display:flex; align-items:center; justify-content:center; z-index:100000; padding:20px;';
    ov.innerHTML =
      '<div style="background:#fff; border-radius:18px; max-width:420px; width:100%; padding:28px 26px; box-shadow:0 30px 80px rgba(0,0,0,.3);">' +
        '<h3 style="font-family:var(--f-display); font-weight:500; color:var(--c-deep); margin-bottom:6px;">' + (o.title || 'Change Password') + '</h3>' +
        '<p style="color:var(--c-text-soft); font-size:0.86rem; margin-bottom:18px;">' + (o.subtitle || '') + '</p>' +
        '<div class="field" style="margin-bottom:14px;"><label>New password</label><input type="password" id="pw-new" autocomplete="new-password" placeholder="At least 8 characters"></div>' +
        '<div class="field" style="margin-bottom:8px;"><label>Confirm password</label><input type="password" id="pw-confirm" autocomplete="new-password" placeholder="Re-enter password"></div>' +
        '<p id="pw-err" style="color:#c0392b; font-size:0.82rem; min-height:18px; margin:6px 0;"></p>' +
        '<div style="display:flex; gap:12px; justify-content:flex-end; margin-top:8px;">' +
          '<button class="btn btn--outline" id="pw-cancel" style="padding:11px 20px;">Cancel</button>' +
          '<button class="btn btn--primary" id="pw-save" style="padding:11px 22px;"><i class="fas fa-key"></i> ' + (o.cta || 'Update Password') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    const close = () => ov.remove();
    const err = ov.querySelector('#pw-err');
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('#pw-cancel').addEventListener('click', close);
    ov.querySelector('#pw-save').addEventListener('click', async () => {
      const pw = ov.querySelector('#pw-new').value;
      const cf = ov.querySelector('#pw-confirm').value;
      if (pw.length < 8) { err.textContent = 'Password must be at least 8 characters.'; return; }
      if (pw !== cf) { err.textContent = 'Passwords do not match.'; return; }
      const btn = ov.querySelector('#pw-save'); const old = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
      try {
        const res = await o.onSubmit(pw);
        if (res && res.ok === false) { err.textContent = res.error || 'Failed.'; btn.disabled = false; btn.innerHTML = old; return; }
        close();
        toast(o.doneMsg || 'Password updated.');
      } catch (e) {
        err.textContent = (e && e.message) || 'Failed.'; btn.disabled = false; btn.innerHTML = old;
      }
    });
    setTimeout(() => { const f = ov.querySelector('#pw-new'); if (f) f.focus(); }, 30);
  }

  // "Change my password" for the signed-in user (any role) via Supabase Auth.
  function changeOwnPassword() {
    if (!SUPA) { alert('Password changes require the live Supabase login (not available in demo mode).'); return; }
    passwordModal({
      title: 'Change my password',
      subtitle: 'Update the password for ' + (window.TAJ_ADMIN_EMAIL || 'your account') + '.',
      doneMsg: 'Your password has been updated.',
      onSubmit: async (pw) => {
        try { const { error } = await client().auth.updateUser({ password: pw }); return error ? { ok: false, error: error.message } : { ok: true }; }
        catch (e) { return { ok: false, error: (e && e.message) || 'Update failed.' }; }
      }
    });
  }

  // Add the "change my password" key control to the sidebar user card (live auth
  // only — demo has no real password). Available to every role on every page.
  function injectPwButton(card) {
    if (!SUPA || !card) return;
    const logout = card.querySelector('#admin-logout');
    if (!logout || card.querySelector('#admin-change-pw')) return;
    const a = document.createElement('a');
    a.id = 'admin-change-pw';
    a.href = '#';
    a.title = 'Change my password';
    a.style.cssText = 'margin-left:0;';   // sit beside logout (CSS gives the row's auto-margin)
    a.innerHTML = '<i class="fas fa-key"></i>';
    a.addEventListener('click', e => { e.preventDefault(); changeOwnPassword(); });
    logout.parentNode.insertBefore(a, logout);
  }
  // Fill the sidebar user card (.admin-side__user) with the signed-in admin's
  // real name (from the `admins` profile), email, and initials.
  async function populateUserCard() {
    const card = document.querySelector('.admin-side__user');
    if (!card) return;
    const avEl = card.querySelector('.av');
    const nameEl = card.querySelector('strong');
    const emailEl = card.querySelector('small');
    let email = (window.TAJ_ADMIN_EMAIL || '').trim();
    let name = '';
    if (SUPA && email) {
      try {
        const { data } = await client().from('admins').select('name,role').ilike('email', email).limit(1);
        if (data && data[0] && data[0].name) name = data[0].name;
      } catch (_) {}
    }
    if (!email) email = 'admin@tasukunspa.com';
    if (!name) name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (avEl) avEl.textContent = initials(name);
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    injectPwButton(card);
  }

  async function guard() {
    if (!SUPA) {
      // Demo mode: keep the sessionStorage gate.
      if (sessionStorage.getItem('taj-admin-auth') !== '1') { location.replace('admin-login.html'); return; }
      populateUserCard();
      return;
    }
    const s = await session();
    if (!s) {
      sessionStorage.removeItem('taj-admin-auth');
      location.replace('admin-login.html');
    } else {
      // Keep the legacy marker in sync for the inline gates in admin-*.js
      sessionStorage.setItem('taj-admin-auth', '1');
      window.TAJ_ADMIN_EMAIL = s.user && s.user.email;
      populateUserCard();
    }
  }

  window.TajAdmin = { signIn, signOut, guard, session, client, isSupabase: SUPA, refreshUserCard: populateUserCard, changePassword: changeOwnPassword, passwordModal, toast };

  // Auto-guard every admin page except the login page itself.
  const onLogin = /admin-login\.html(?:$|[?#])/.test(location.pathname + location.search + location.hash)
               || /admin-login\.html$/.test(location.pathname);
  if (!onLogin) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', guard);
    } else {
      guard();
    }
  }
})();
