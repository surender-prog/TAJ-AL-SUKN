/* Taj Al Sukun — Admin Users + role-based menu access (admin.html)
   ============================================================
   • Lists / creates / edits / removes rows in the `admins` table
     (via the authenticated admin client — RLS: authenticated only).
   • The signed-in user's role (looked up by email) gates which admin
     sections they can see:
       owner        → everything (incl. Admin Users)
       manager      → everything EXCEPT Admin Users
       receptionist → Overview, Bookings, Members, Calendar only
   Logins themselves are created in Supabase; this maps email → role. */
(function () {
  'use strict';

  const sb = () => (window.TajAdmin && window.TajAdmin.client && window.TajAdmin.client()) || window.__tajSb || (window.TajData && window.TajData._sb) || null;

  const ROLES = ['owner', 'manager', 'receptionist'];
  const ROLE_LABEL = { owner: 'Owner', manager: 'Manager', receptionist: 'Receptionist' };
  const ROLE_BADGE = { owner: 'gold', manager: 'silver', receptionist: 'platinum' };

  // Which sidebar tabs each role may open.
  const ACCESS = {
    owner:        ['overview', 'bookings', 'members', 'calendar', 'reports', 'website', 'settings'],
    manager:      ['overview', 'bookings', 'members', 'calendar', 'reports', 'website', 'settings'],
    receptionist: ['overview', 'bookings', 'members', 'calendar'],
  };
  // Only these roles can see/manage the Admin Users sub-section of Settings.
  const CAN_MANAGE_USERS = { owner: true, manager: false, receptionist: false };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const initials = n => (String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || '?').toUpperCase();
  const nameFromEmail = e => (String(e || '').split('@')[0] || 'User').replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  let CURRENT_EMAIL = null;
  let CURRENT_ROLE = 'owner';   // safe default so the primary admin is never locked out
  let ADMINS = [];

  async function currentEmail() {
    if (CURRENT_EMAIL) return CURRENT_EMAIL;
    try {
      if (window.TajAdmin && TajAdmin.session) {
        const s = await TajAdmin.session();
        if (s && s.user && s.user.email) { CURRENT_EMAIL = s.user.email.toLowerCase(); return CURRENT_EMAIL; }
      }
    } catch (_) {}
    if (window.TAJ_ADMIN_EMAIL) { CURRENT_EMAIL = String(window.TAJ_ADMIN_EMAIL).toLowerCase(); return CURRENT_EMAIL; }
    return null;
  }

  async function loadAdmins() {
    const c = sb();
    if (!c) return [];
    try {
      // select('*') so profile columns (phone/title/notes/user_id) come through
      // when migration 008 is applied, and we degrade gracefully before it.
      const { data, error } = await c.from('admins').select('*').order('created_at', { ascending: true });
      if (error) { console.warn('[admins] load', error.message); return []; }
      return data || [];
    } catch (e) { console.warn('[admins] load failed', e); return []; }
  }

  // Call the owner-gated admin-users Edge Function; normalise its error body.
  async function callFn(body) {
    const c = sb();
    if (!c || !c.functions) return { ok: false, error: 'Not connected to Supabase.' };
    try {
      const { data, error } = await c.functions.invoke('admin-users', { body });
      if (error) {
        let msg = error.message || 'Request failed.';
        try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch (_) {}
        if (/Failed to (fetch|send)|FunctionsFetch|not found|404|does not exist/i.test(msg)) {
          msg = 'The admin-users function isn’t deployed yet — deploy it to enable creating logins and resetting passwords.';
        }
        return { ok: false, error: msg };
      }
      return data || { ok: true };
    } catch (e) { return { ok: false, error: (e && e.message) || String(e) }; }
  }

  // Update a profile row, dropping columns the schema doesn't have yet (so edits
  // still save before migration 008 adds phone/title/notes).
  async function updateProfile(id, fields) {
    const c = sb();
    const ext = ['phone', 'title', 'notes', 'user_id'];
    const payload = Object.assign({}, fields);
    for (let i = 0; i < 6; i++) {
      const { error } = await c.from('admins').update(payload).eq('id', id);
      if (!error) return;
      const m = (error.message || '').toLowerCase();
      const bad = ext.find(k => (k in payload) && (m.includes("'" + k + "'") || m.includes('"' + k + '"') || (m.includes(k) && (m.includes('does not exist') || m.includes('schema cache')))));
      if (bad) { delete payload[bad]; continue; }
      throw error;
    }
  }

  // ---- Role-based menu gating -------------------------------------------------
  function applyAccess(role) {
    const allowed = ACCESS[role] || ACCESS.owner;
    // Sidebar tabs
    document.querySelectorAll('.admin-side__nav a[data-tab]').forEach(a => {
      const li = a.closest('li') || a;
      li.style.display = allowed.includes(a.dataset.tab) ? '' : 'none';
    });
    // If the open tab isn't allowed, jump to the first allowed one.
    const active = document.querySelector('.admin-side__nav a.active[data-tab]');
    if (active && !allowed.includes(active.dataset.tab)) {
      const first = document.querySelector('.admin-side__nav a[data-tab="' + allowed[0] + '"]');
      if (first) first.click();
    }
    // Settings → Admin Users sub-section (managers/receptionists can't manage users)
    if (!CAN_MANAGE_USERS[role]) {
      const chip = document.querySelector('.settings-nav__chip[href="#sg-admins"]');
      if (chip) chip.style.display = 'none';
      const sec = document.getElementById('sg-admins');
      if (sec) sec.style.display = 'none';
    }
    document.body.setAttribute('data-admin-role', role);
  }

  // ---- Render the users table -------------------------------------------------
  function render() {
    const tbody = document.getElementById('admins-tbody');
    if (!tbody) return;
    if (!ADMINS.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--c-text-soft); padding:24px;">No admin users yet — use <strong>Invite User</strong> to add one.</td></tr>';
      return;
    }
    tbody.innerHTML = ADMINS.map(u => {
      const role = ROLES.includes(u.role) ? u.role : 'manager';
      const isActive = (u.status || 'active') === 'active';
      const isSelf = CURRENT_EMAIL && (u.email || '').toLowerCase() === CURRENT_EMAIL;
      return `<tr data-id="${esc(u.id)}">
        <td><div class="cell-name"><div class="av">${esc(initials(u.name || u.email))}</div><div><strong>${esc(u.name || nameFromEmail(u.email))}</strong><small>${ROLE_LABEL[role]}${isSelf ? ' · you' : ''}</small></div></div></td>
        <td>${esc(u.email)}</td>
        <td><span class="badge-tier ${ROLE_BADGE[role]}">${ROLE_LABEL[role]}</span></td>
        <td><span class="badge-status ${isActive ? 'ok' : 'cancel'}">${isActive ? 'Active' : 'Disabled'}</span></td>
        <td class="cell-actions">
          <a class="icon-btn pw-admin" title="${isSelf ? 'Change my password' : 'Reset password'}"><i class="fas fa-key"></i></a>
          <a class="icon-btn edit-admin" title="Edit"><i class="fas fa-pen"></i></a>
          <a class="icon-btn danger del-admin" title="Remove"${isSelf ? ' style="opacity:.35; pointer-events:none;" title="You can\'t remove yourself"' : ''}><i class="fas fa-trash"></i></a>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.edit-admin').forEach(b => b.addEventListener('click', e => {
      const id = e.target.closest('tr').dataset.id;
      openModal(ADMINS.find(u => String(u.id) === String(id)) || null);
    }));
    tbody.querySelectorAll('.del-admin').forEach(b => b.addEventListener('click', e => {
      const id = e.target.closest('tr').dataset.id;
      removeAdmin(ADMINS.find(u => String(u.id) === String(id)) || null);
    }));
    tbody.querySelectorAll('.pw-admin').forEach(b => b.addEventListener('click', e => {
      const id = e.target.closest('tr').dataset.id;
      resetPassword(ADMINS.find(u => String(u.id) === String(id)) || null);
    }));
  }

  // ---- Create / edit modal ----------------------------------------------------
  function openModal(user) {
    const editing = !!user;
    const ov = document.createElement('div');
    ov.className = 'au-modal-ov';
    ov.style.cssText = 'position:fixed; inset:0; background:rgba(36,19,8,.55); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;';
    const half = 'display:grid; grid-template-columns:1fr 1fr; gap:12px;';
    ov.innerHTML = `
      <div style="background:#fff; border-radius:18px; max-width:480px; width:100%; max-height:92vh; overflow:auto; padding:30px 28px; box-shadow:0 30px 80px rgba(0,0,0,.3);">
        <h3 style="font-family:var(--f-display); font-weight:500; color:var(--c-deep); margin-bottom:6px;">${editing ? 'Edit User' : 'Create User'}</h3>
        <p style="color:var(--c-text-soft); font-size:0.86rem; margin-bottom:20px;">${editing ? 'Update this person\'s profile and role.' : 'Creates their login and profile in one step. They sign in with this email and password.'}</p>
        <div class="field" style="margin-bottom:14px;"><label>Full Name</label><input type="text" id="au-name" placeholder="e.g. Sofia Marini" value="${esc(user ? (user.name || '') : '')}"></div>
        <div class="field" style="margin-bottom:14px;"><label>Email</label><input type="email" id="au-email" placeholder="name@tasukunspa.com" value="${esc(user ? (user.email || '') : '')}" ${editing ? 'readonly style="opacity:.7;"' : ''}></div>
        ${editing ? '' : `
        <div style="${half} margin-bottom:14px;">
          <div class="field"><label>Password</label><input type="password" id="au-pass" autocomplete="new-password" placeholder="Min 8 characters"></div>
          <div class="field"><label>Confirm</label><input type="password" id="au-pass2" autocomplete="new-password" placeholder="Re-enter"></div>
        </div>`}
        <div style="${half} margin-bottom:14px;">
          <div class="field"><label>Role</label>
            <select id="au-role">${ROLES.map(r => `<option value="${r}"${user && user.role === r ? ' selected' : (!user && r === 'receptionist' ? ' selected' : '')}>${ROLE_LABEL[r]}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Status</label>
            <select id="au-status"><option value="active"${!user || user.status !== 'disabled' ? ' selected' : ''}>Active</option><option value="disabled"${user && user.status === 'disabled' ? ' selected' : ''}>Disabled</option></select>
          </div>
        </div>
        <div style="${half} margin-bottom:14px;">
          <div class="field"><label>Phone</label><input type="tel" id="au-phone" placeholder="+973 …" value="${esc(user ? (user.phone || '') : '')}"></div>
          <div class="field"><label>Job title</label><input type="text" id="au-title" placeholder="e.g. Spa Director" value="${esc(user ? (user.title || '') : '')}"></div>
        </div>
        <div class="field" style="margin-bottom:8px;"><label>Notes</label><textarea id="au-notes" rows="2" placeholder="Internal notes (optional)" style="width:100%; resize:vertical;">${esc(user ? (user.notes || '') : '')}</textarea></div>
        <p id="au-err" style="color:#c0392b; font-size:0.82rem; min-height:18px; margin:6px 0;"></p>
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:10px;">
          <button class="btn btn--outline" id="au-cancel" style="padding:11px 20px;">Cancel</button>
          <button class="btn btn--primary" id="au-save" style="padding:11px 22px;"><i class="fas fa-save"></i> ${editing ? 'Save' : 'Create User'}</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('#au-cancel').addEventListener('click', close);
    ov.querySelector('#au-save').addEventListener('click', () => saveAdmin(user, ov, close));
  }

  async function saveAdmin(user, ov, close) {
    const c = sb();
    const errEl = ov.querySelector('#au-err');
    const name = ov.querySelector('#au-name').value.trim();
    const email = ov.querySelector('#au-email').value.trim().toLowerCase();
    const role = ov.querySelector('#au-role').value;
    const status = ov.querySelector('#au-status').value;
    const phone = (ov.querySelector('#au-phone').value || '').trim();
    const title = (ov.querySelector('#au-title').value || '').trim();
    const notes = (ov.querySelector('#au-notes').value || '').trim();
    if (!name || !email) { errEl.textContent = 'Name and email are required.'; return; }
    if (!/.+@.+\..+/.test(email)) { errEl.textContent = 'Enter a valid email.'; return; }
    if (!user && ADMINS.some(u => (u.email || '').toLowerCase() === email)) { errEl.textContent = 'That email is already an admin.'; return; }
    if (!c) { errEl.textContent = 'Not connected.'; return; }

    let password = '';
    if (!user) {
      password = ov.querySelector('#au-pass').value;
      const confirm = ov.querySelector('#au-pass2').value;
      if (password.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; return; }
      if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }
    }

    const btn = ov.querySelector('#au-save');
    const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    try {
      if (user) {
        await updateProfile(user.id, { name, role, status, phone: phone || null, title: title || null, notes: notes || null });
      } else {
        // Provision the Auth login + profile atomically via the owner-gated function.
        const res = await callFn({ action: 'create', email, password, name, role, status, phone, title, notes });
        if (!res.ok) { btn.disabled = false; btn.innerHTML = old; errEl.textContent = res.error || 'Create failed.'; return; }
      }
      close();
      await refresh();
    } catch (e) {
      btn.disabled = false; btn.innerHTML = old;
      errEl.textContent = 'Save failed: ' + (e.message || e);
    }
  }

  // Reset a user's password. Own account → Supabase Auth updateUser; others →
  // the owner-gated function.
  function resetPassword(user) {
    if (!user) return;
    const isSelf = CURRENT_EMAIL && (user.email || '').toLowerCase() === CURRENT_EMAIL;
    if (isSelf) {
      if (window.TajAdmin && TajAdmin.changePassword) return TajAdmin.changePassword();
      return alert('Use the key icon by your name (bottom-left) to change your own password.');
    }
    if (!CAN_MANAGE_USERS[CURRENT_ROLE]) { alert('Only an Owner can reset other users\' passwords.'); return; }
    if (!(window.TajAdmin && TajAdmin.passwordModal)) { alert('Password tools unavailable.'); return; }
    TajAdmin.passwordModal({
      title: 'Reset password',
      subtitle: 'Set a new password for ' + (user.name || user.email) + '. They\'ll use it next time they sign in.',
      cta: 'Set Password',
      doneMsg: 'Password updated for ' + (user.name || user.email) + '.',
      onSubmit: async (pw) => callFn({ action: 'set_password', user_id: user.user_id || null, email: user.email, password: pw }),
    });
  }

  async function removeAdmin(user) {
    if (!user) return;
    if (CURRENT_EMAIL && (user.email || '').toLowerCase() === CURRENT_EMAIL) { alert("You can't remove your own account."); return; }
    const owners = ADMINS.filter(u => u.role === 'owner');
    if (user.role === 'owner' && owners.length <= 1) { alert('You can\'t remove the last Owner.'); return; }
    if (!confirm(`Remove ${user.name || user.email}? This deletes both their admin access and their login.`)) return;
    // Prefer the function so the Supabase Auth login is removed too.
    const res = await callFn({ action: 'delete', admin_id: user.id, email: user.email, user_id: user.user_id || null });
    if (!res.ok) {
      // Fallback: remove the profile row directly; the login must be removed in Supabase.
      const c = sb();
      try { if (c) { const { error } = await c.from('admins').delete().eq('id', user.id); if (error) throw error; } }
      catch (e) { alert('Remove failed: ' + (e.message || e)); return; }
      if (window.TajAdmin && TajAdmin.toast) TajAdmin.toast('Profile removed. Note: ' + res.error);
    }
    await refresh();
  }

  async function refresh() {
    ADMINS = await loadAdmins();
    render();
  }

  async function init() {
    if (!document.getElementById('sg-admins')) return;

    // Wire the Invite button up-front so it's responsive even before the
    // (possibly slow) data load finishes.
    const inviteBtn = document.getElementById('invite-user-btn');
    if (inviteBtn) inviteBtn.addEventListener('click', () => {
      if (!CAN_MANAGE_USERS[CURRENT_ROLE]) { alert('Only an Owner can invite users.'); return; }
      openModal(null);
    });

    CURRENT_EMAIL = await currentEmail();
    ADMINS = await loadAdmins();

    // Bootstrap: first signed-in admin with no row becomes the Owner.
    if (CURRENT_EMAIL && !ADMINS.some(u => (u.email || '').toLowerCase() === CURRENT_EMAIL)) {
      const c = sb();
      if (c) {
        try {
          await c.from('admins').insert({ id: 'ADM-' + Date.now().toString().slice(-6), name: nameFromEmail(CURRENT_EMAIL), email: CURRENT_EMAIL, role: 'owner', status: 'active' });
          ADMINS = await loadAdmins();
        } catch (e) { console.warn('[admins] bootstrap', e.message || e); }
      }
    }

    // Resolve current role and gate the menu.
    const me = ADMINS.find(u => CURRENT_EMAIL && (u.email || '').toLowerCase() === CURRENT_EMAIL);
    CURRENT_ROLE = (me && ROLES.includes(me.role)) ? me.role : 'owner';
    applyAccess(CURRENT_ROLE);

    render();
  }

  // Wait for the auth client/session to settle, then run.
  let tries = 0;
  (function waitReady() {
    if (sb() || tries > 40) { init(); return; }
    tries++; setTimeout(waitReady, 200);
  })();
})();
