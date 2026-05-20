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

  async function guard() {
    if (!SUPA) {
      // Demo mode: keep the sessionStorage gate.
      if (sessionStorage.getItem('taj-admin-auth') !== '1') location.replace('admin-login.html');
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
    }
  }

  window.TajAdmin = { signIn, signOut, guard, session, client, isSupabase: SUPA };

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
