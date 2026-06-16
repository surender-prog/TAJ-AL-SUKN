/* Taj Al Sukun — Therapist Editor (admin-therapist.html)
   ============================================================
   URL: admin-therapist.html?id=T-XX  → edit
        admin-therapist.html           → new
   Reads & writes the live `therapists` table via TajData. Maps the UI
   `specialties` array ↔ DB `specialty` (comma text); langs stays text[]. */
(function () {
  'use strict';

  const sb = () => (window.TajAdmin && window.TajAdmin.client && window.TajAdmin.client()) || window.__tajSb || (window.TajData && window.TajData._sb) || null;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const initials = n => (String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || '?').toUpperCase();

  const LANG_QUICK = ['EN', 'AR', 'FR', 'TH', 'ID', 'JP', 'HI', 'UR', 'TL', 'RU'];
  const qp = new URLSearchParams(location.search);
  const editId = qp.get('id');

  let current = null;        // existing therapist (edit) or null (new)
  let mLangs = ['EN'];
  let mTreat = [];
  let svcNames = [];

  function thFromDb(t) {
    const specialties = Array.isArray(t.specialties) ? t.specialties
      : (typeof t.specialty === 'string' && t.specialty ? t.specialty.split(/\s*,\s*/).filter(Boolean) : []);
    const langs = Array.isArray(t.langs) ? t.langs
      : (typeof t.langs === 'string' && t.langs ? t.langs.split(/\s*,\s*/).filter(Boolean) : ['EN']);
    return Object.assign({}, t, { role: t.role || 'Therapist', exp: t.exp || '', phone: t.phone || '', status: t.status === 'off' ? 'off' : 'active', specialties, langs });
  }
  function nextId(list) {
    const nums = (list || []).map(t => parseInt(String(t.id).replace(/\D/g, ''), 10) || 0);
    return 'T-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0');
  }

  // ---- chips ----
  function drawChips(id, arr, onRemove) {
    const c = $(id);
    c.innerHTML = arr.length ? arr.map(v => `<span class="th-chip">${esc(v)}<button type="button" data-x="${esc(v)}">&times;</button></span>`).join('')
      : '<span style="color:var(--c-muted);font-size:.82rem;">none yet</span>';
    c.querySelectorAll('[data-x]').forEach(b => b.addEventListener('click', () => onRemove(b.dataset.x)));
  }
  function drawQuick(id, list, current, onAdd) {
    const c = $(id);
    const avail = list.filter(q => !current.includes(q));
    c.innerHTML = avail.length ? avail.slice(0, 24).map(q => `<button type="button" class="th-quick-btn" data-q="${esc(q)}">+ ${esc(q)}</button>`).join('')
      : '<span style="color:var(--c-muted);font-size:.78rem;">all added</span>';
    c.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => onAdd(b.dataset.q)));
  }
  function refreshLangs() {
    drawChips('th-langs-chips', mLangs, v => { mLangs.splice(mLangs.indexOf(v), 1); refreshLangs(); preview(); });
    drawQuick('th-langs-quick', LANG_QUICK, mLangs, v => { if (!mLangs.includes(v)) { mLangs.push(v); refreshLangs(); preview(); } });
  }
  function refreshTreat() {
    drawChips('th-treat-chips', mTreat, v => { mTreat.splice(mTreat.indexOf(v), 1); refreshTreat(); preview(); });
    drawQuick('th-treat-quick', svcNames, mTreat, v => { if (!mTreat.includes(v)) { mTreat.push(v); refreshTreat(); preview(); } });
  }
  function wireInput(id, arr, refresh) {
    $(id).addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const v = $(id).value.trim().replace(/,+$/, '').trim();
        if (v && !arr.includes(v)) { arr.push(v); refresh(); preview(); }
        $(id).value = '';
      }
    });
  }

  // ---- live preview ----
  function preview() {
    const name = $('th-name').value.trim() || 'New Therapist';
    $('prev-av').textContent = initials(name);
    $('prev-name').textContent = name;
    $('prev-role').textContent = $('th-role').value.trim() || 'Therapist';
    const st = $('th-status').value;
    const sEl = $('prev-status'); sEl.textContent = st === 'off' ? 'Off' : 'Active'; sEl.className = 'th-prev__status ' + st;
    $('prev-tags').innerHTML = (mTreat.length ? mTreat : ['—']).map(s => `<span>${esc(s)}</span>`).join('');
    $('prev-langs').textContent = (mLangs.length ? mLangs : ['EN']).join(' · ');
    $('prev-exp').textContent = $('th-exp').value.trim() || '—';
    $('prev-phone').textContent = $('th-phone').value.trim() || '—';
  }

  async function init() {
    // quick-pick treatments from the live services menu
    try {
      const svc = (window.TajData && TajData.services) ? await TajData.services.list() : [];
      svcNames = [...new Set((svc || []).filter(s => s && s.status === 'active').map(s => s.name))];
    } catch (_) {}

    if (editId && window.TajData && TajData.therapists) {
      try {
        const rows = await TajData.therapists.list();
        const found = (rows || []).find(t => t.id === editId);
        if (found) current = thFromDb(found);
      } catch (e) { console.warn('[therapist] load', e); }
    }

    if (current) {
      $('crumb-mode').textContent = 'Edit · ' + current.name;
      $('page-title').textContent = 'Edit Therapist';
      $('th-save-label').textContent = 'Save Changes';
      $('th-delete').hidden = false;
      const pill = $('th-status-pill');
      pill.innerHTML = current.status === 'active' ? '<i class="fas fa-check-circle"></i> Active' : '<i class="fas fa-power-off"></i> Off';
      $('th-name').value = current.name || '';
      $('th-role').value = current.role || '';
      $('th-status').value = current.status || 'active';
      $('th-exp').value = (current.exp && current.exp !== '—') ? current.exp : '';
      $('th-phone').value = (current.phone && current.phone !== '—') ? current.phone : '';
      mLangs = (current.langs || ['EN']).slice();
      mTreat = (current.specialties || []).slice();
    } else {
      $('th-role').value = 'Wellness Therapist';
      $('th-phone').value = '+973 ';
    }

    refreshLangs(); refreshTreat(); preview();
    wireInput('th-langs-input', mLangs, refreshLangs);
    wireInput('th-treat-input', mTreat, refreshTreat);
    ['th-name', 'th-role', 'th-status', 'th-exp', 'th-phone'].forEach(id => $(id).addEventListener('input', preview));
  }

  // ---- save / delete ----
  document.getElementById('therapist-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('th-name').value.trim();
    if (!name) { $('th-name').focus(); return; }
    // capture any pending chip-input text
    [['th-langs-input', mLangs], ['th-treat-input', mTreat]].forEach(([id, arr]) => {
      const v = $(id).value.trim().replace(/,+$/, '').trim();
      if (v && !arr.includes(v)) arr.push(v);
      $(id).value = '';
    });
    const row = {
      id: current ? current.id : nextId(await listSafe()),
      name,
      role: $('th-role').value.trim() || 'Therapist',
      specialty: mTreat.join(', '),
      langs: mLangs.length ? mLangs : ['EN'],
      exp: $('th-exp').value.trim() || '',
      phone: $('th-phone').value.trim() || '',
      status: $('th-status').value,
    };
    const btn = e.submitter || document.querySelector('#therapist-form button[type="submit"]');
    const old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…'; }
    try {
      if (window.TajData && TajData.therapists) await TajData.therapists.upsert(row);
      if (window.TajData && TajData.activity) {
        TajData.activity.log({ type: 'note', title: (current ? 'Therapist updated: ' : 'Therapist added: ') + name, desc: row.role, ref: row.id, refType: 'therapist' });
      }
      location.href = 'admin.html#sg-therapist';
    } catch (err) {
      if (btn) { btn.disabled = false; btn.innerHTML = old; }
      alert('Save failed: ' + (err.message || err));
    }
  });

  async function listSafe() { try { return (window.TajData && TajData.therapists) ? await TajData.therapists.list() : []; } catch (_) { return []; } }

  document.getElementById('th-delete').addEventListener('click', async () => {
    if (!current) return;
    if (!confirm(`Remove ${current.name} from the team? This cannot be undone.`)) return;
    try {
      if (window.TajData && TajData.therapists && TajData.therapists.remove) await TajData.therapists.remove(current.id);
      location.href = 'admin.html#sg-therapist';
    } catch (err) { alert('Delete failed: ' + (err.message || err)); }
  });

  $('admin-logout') && $('admin-logout').addEventListener('click', e => {
    e.preventDefault();
    if (window.TajAdmin && TajAdmin.signOut) TajAdmin.signOut(); else location.href = 'admin-login.html';
  });

  // boot once the data layer is reachable
  let tries = 0;
  (function ready() {
    if (window.TajData || tries > 40) { init(); return; }
    tries++; setTimeout(ready, 150);
  })();
})();
