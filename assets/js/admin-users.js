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
      const { data, error } = await c.from('admins').select('id,name,email,role,status,created_at').order('created_at', { ascending: true });
      if (error) { console.warn('[admins] load', error.message); return []; }
      return data || [];
    } catch (e) { console.warn('[admins] load failed', e); return []; }
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
  }

  // ---- Create / edit modal ----------------------------------------------------
  function openModal(user) {
    const editing = !!user;
    const ov = document.createElement('div');
    ov.className = 'au-modal-ov';
    ov.style.cssText = 'position:fixed; inset:0; background:rgba(36,19,8,.55); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px;';
    ov.innerHTML = `
      <div style="background:#fff; border-radius:18px; max-width:460px; width:100%; padding:30px 28px; box-shadow:0 30px 80px rgba(0,0,0,.3);">
        <h3 style="font-family:var(--f-display); font-weight:500; color:var(--c-deep); margin-bottom:6px;">${editing ? 'Edit User' : 'Invite User'}</h3>
        <p style="color:var(--c-text-soft); font-size:0.86rem; margin-bottom:20px;">${editing ? 'Update this person\'s details and role.' : 'Add someone to the team. Create their matching login in Supabase with the same email.'}</p>
        <div class="field" style="margin-bottom:14px;"><label>Full Name</label><input type="text" id="au-name" placeholder="e.g. Sofia Marini" value="${esc(user ? (user.name || '') : '')}"></div>
        <div class="field" style="margin-bottom:14px;"><label>Email</label><input type="email" id="au-email" placeholder="name@tasukunspa.com" value="${esc(user ? (user.email || '') : '')}" ${editing ? 'readonly style="opacity:.7;"' : ''}></div>
        <div class="field" style="margin-bottom:14px;"><label>Role</label>
          <select id="au-role">${ROLES.map(r => `<option value="${r}"${user && user.role === r ? ' selected' : (!user && r === 'receptionist' ? ' selected' : '')}>${ROLE_LABEL[r]}</option>`).join('')}</select>
        </div>
        <div class="field" style="margin-bottom:8px;"><label>Status</label>
          <select id="au-status"><option value="active"${!user || user.status !== 'disabled' ? ' selected' : ''}>Active</option><option value="disabled"${user && user.status === 'disabled' ? ' selected' : ''}>Disabled</option></select>
        </div>
        <p id="au-err" style="color:#c0392b; font-size:0.82rem; min-height:18px; margin:6px 0;"></p>
        <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:10px;">
          <button class="btn btn--outline" id="au-cancel" style="padding:11px 20px;">Cancel</button>
          <button class="btn btn--primary" id="au-save" style="padding:11px 22px;"><i class="fas fa-save"></i> ${editing ? 'Save' : 'Add User'}</button>
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
    if (!name || !email) { errEl.textContent = 'Name and email are required.'; return; }
    if (!/.+@.+\..+/.test(email)) { errEl.textContent = 'Enter a valid email.'; return; }
    if (!user && ADMINS.some(u => (u.email || '').toLowerCase() === email)) { errEl.textContent = 'That email is already an admin.'; return; }
    if (!c) { errEl.textContent = 'Not connected.'; return; }
    const btn = ov.querySelector('#au-save');
    const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
    try {
      if (user) {
        const { error } = await c.from('admins').update({ name, role, status }).eq('id', user.id);
        if (error) throw error;
      } else {
        const id = 'ADM-' + Date.now().toString().slice(-6);
        const { error } = await c.from('admins').insert({ id, name, email, role, status });
        if (error) throw error;
      }
      close();
      await refresh();
    } catch (e) {
      btn.disabled = false; btn.innerHTML = old;
      errEl.textContent = 'Save failed: ' + (e.message || e);
    }
  }

  async function removeAdmin(user) {
    if (!user) return;
    if (CURRENT_EMAIL && (user.email || '').toLowerCase() === CURRENT_EMAIL) { alert("You can't remove your own account."); return; }
    const owners = ADMINS.filter(u => u.role === 'owner');
    if (user.role === 'owner' && owners.length <= 1) { alert('You can\'t remove the last Owner.'); return; }
    if (!confirm(`Remove ${user.name || user.email}? They will lose admin access (their Supabase login, if any, should be removed separately).`)) return;
    const c = sb();
    try { if (c) { const { error } = await c.from('admins').delete().eq('id', user.id); if (error) throw error; } }
    catch (e) { alert('Remove failed: ' + (e.message || e)); return; }
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
