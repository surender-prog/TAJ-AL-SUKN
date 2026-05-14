/* Taj Al Sukn — Service Editor (admin-service.html)
   ============================================================
   URL: admin-service.html?id=SV-XX  → edit
        admin-service.html           → new

   Reads & writes taj-services in localStorage. Includes a live
   preview card and a few quick-pick stock images.
*/

if (sessionStorage.getItem('taj-admin-auth') !== '1') {
  location.replace('admin-login.html');
}

/* ---- Data ---- */
const STORE = 'taj-services';
const QUICK_IMAGES = [
  'assets/images/spa-detail-1.jpg',
  'assets/images/spa-detail-2.jpg',
  'assets/images/sanctuary-bed.jpg',
  'assets/images/treatment-room.jpg',
  'assets/images/lounge-flowers.jpg',
  'assets/images/spa-relax-1.jpg',
  'assets/images/spa-relax-2.jpg',
  'assets/images/spa-relax-3.jpg',
  'assets/images/therapist-products.jpg',
  'assets/images/therapist-prep.jpg',
  'assets/images/deep-tissue.jpg',
  'assets/images/couples-massage.jpg'
];

function loadServices() {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]') || []; }
  catch (_) { return []; }
}
function saveServices(arr) {
  localStorage.setItem(STORE, JSON.stringify(arr));
}
function nextId(list) {
  const nums = list.map(s => parseInt((s.id || '').replace(/\D/g, ''), 10) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return 'SV-' + String(max + 1).padStart(2, '0');
}

/* ---- Mode (new vs edit) ---- */
const qp = new URLSearchParams(location.search);
const editId = qp.get('id');
let services = loadServices();
let current = editId ? services.find(s => s.id === editId) : null;
const isEdit = !!current;

if (isEdit) {
  document.getElementById('crumb-mode').textContent = 'Edit · ' + current.name;
  document.getElementById('page-title').textContent = 'Edit Service';
  document.getElementById('page-sub').textContent = 'Update details, pricing, and where this service appears.';
  document.getElementById('save-label').textContent = 'Save Changes';
  document.getElementById('delete-svc').hidden = false;
  const pill = document.getElementById('service-status-pill');
  if (current.status === 'active') {
    pill.classList.add('is-paid');
    pill.innerHTML = '<i class="fas fa-check-circle"></i> Active';
  } else if (current.status === 'hidden') {
    pill.innerHTML = '<i class="far fa-eye-slash"></i> Hidden';
  } else {
    pill.innerHTML = '<i class="far fa-clock"></i> Draft';
  }
}

/* ---- Field references ---- */
const F = {
  name:       document.getElementById('sv-name'),
  category:   document.getElementById('sv-category'),
  tag:        document.getElementById('sv-tag'),
  description:document.getElementById('sv-description'),
  long:       document.getElementById('sv-long'),
  duration:   document.getElementById('sv-duration'),
  price:      document.getElementById('sv-price'),
  priceAlt:   document.getElementById('sv-price2'),
  memberPrice:document.getElementById('sv-member-price'),
  image:      document.getElementById('sv-image'),
  showWeb:    document.getElementById('sv-show-web'),
  showBook:   document.getElementById('sv-show-book'),
  featured:   document.getElementById('sv-featured'),
  memberOnly: document.getElementById('sv-member-only'),
  status:     document.getElementById('sv-status'),
  sort:       document.getElementById('sv-sort')
};

/* ---- Hydrate from existing ---- */
function hydrate(s) {
  F.name.value        = s.name || '';
  F.category.value    = s.category || 'Massage';
  F.tag.value         = s.tag || '';
  F.description.value = s.description || '';
  F.long.value        = s.long_description || '';
  F.duration.value    = s.duration || '60 min';
  F.price.value       = (s.price != null) ? s.price : '';
  F.priceAlt.value    = (s.price_alt != null) ? s.price_alt : '';
  F.memberPrice.value = (s.member_price != null) ? s.member_price : '';
  F.image.value       = s.image || '';
  F.showWeb.checked   = s.show_on_website !== false;
  F.showBook.checked  = s.show_in_booking !== false;
  F.featured.checked  = !!s.featured;
  F.memberOnly.checked= !!s.member_only;
  F.status.value      = s.status || 'active';
  F.sort.value        = (s.sort != null) ? s.sort : 100;
}

if (current) {
  hydrate(current);
} else {
  // Defaults for new
  F.duration.value = '60 min';
  F.status.value   = 'active';
  F.sort.value     = 100;
}

/* ---- Image quick-picks ---- */
const sg = document.getElementById('svc-img-suggest');
QUICK_IMAGES.forEach(src => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'svc-img-quick';
  btn.title = src.split('/').pop();
  btn.innerHTML = `<img src="${src}" alt="">`;
  btn.addEventListener('click', () => {
    F.image.value = src;
    refresh();
  });
  sg.appendChild(btn);
});

/* ---- Live preview ---- */
function refresh() {
  const name = F.name.value.trim() || 'Service Name';
  const desc = F.description.value.trim() || 'Short description.';
  const dur  = F.duration.value.trim() || '— min';
  const cat  = F.category.value;
  const tag  = F.tag.value;
  const price = F.price.value || '0';
  const img  = F.image.value.trim();

  document.getElementById('prev-name').textContent = name;
  document.getElementById('prev-desc').textContent = desc;
  document.getElementById('prev-dur').textContent  = dur;
  document.getElementById('prev-price').textContent = price;

  const tagEl = document.getElementById('prev-tag');
  if (tag) { tagEl.textContent = tag; tagEl.style.display = ''; }
  else     { tagEl.style.display = 'none'; }

  const prevImg = document.getElementById('prev-img');
  if (img) prevImg.src = img;

  document.getElementById('prev-cat').textContent = cat;
  const statusMap = { active: 'Active', hidden: 'Hidden', draft: 'Draft' };
  document.getElementById('prev-status').textContent = statusMap[F.status.value] || F.status.value;
  document.getElementById('prev-mdisc').textContent  = F.memberPrice.value
    ? `${F.memberPrice.value} BHD (fixed)`
    : 'Auto by tier';

  let aud = 'Everyone';
  if (F.memberOnly.checked) aud = 'Members only';
  if (!F.showWeb.checked && !F.showBook.checked) aud = 'Internal only';
  document.getElementById('prev-aud').textContent = aud;

  // Image preview block
  const imgPv = document.getElementById('svc-img-preview');
  if (img) {
    imgPv.style.backgroundImage = `url('${img.replace(/'/g, "\\'")}')`;
    imgPv.classList.add('has-image');
  } else {
    imgPv.style.backgroundImage = '';
    imgPv.classList.remove('has-image');
  }
}
document.getElementById('service-form').addEventListener('input', refresh);
document.getElementById('service-form').addEventListener('change', refresh);
refresh();

/* ---- Submit ---- */
document.getElementById('service-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = F.name.value.trim();
  const desc = F.description.value.trim();
  const price = parseFloat(F.price.value);
  if (!name || !desc) { alert('Name and description are required.'); return; }
  if (isNaN(price) || price < 0) { alert('Please enter a valid starting price.'); return; }

  // Build payload
  services = loadServices();
  const payload = {
    id: isEdit ? current.id : nextId(services),
    name,
    category: F.category.value,
    tag: F.tag.value || '',
    description: desc,
    long_description: F.long.value.trim() || '',
    duration: F.duration.value.trim() || '60 min',
    price,
    price_alt: F.priceAlt.value ? parseFloat(F.priceAlt.value) : null,
    member_price: F.memberPrice.value ? parseFloat(F.memberPrice.value) : null,
    image: F.image.value.trim() || '',
    show_on_website: F.showWeb.checked,
    show_in_booking: F.showBook.checked,
    featured: F.featured.checked,
    member_only: F.memberOnly.checked,
    status: F.status.value,
    sort: parseInt(F.sort.value, 10) || 100
  };

  // Disable save button while we persist
  const saveBtn = document.querySelector('#service-form button[type="submit"]');
  const originalLabel = saveBtn ? saveBtn.innerHTML : null;
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (isEdit ? 'Saving…' : 'Adding…');
  }

  // Persist via data layer (Supabase + LS mirror); fall back to LS only if it fails
  try {
    if (window.TajData) {
      await TajData.services.upsert(payload);
      await TajData.activity.log({
        type: 'note',
        title: isEdit ? 'Service updated' : 'Service added',
        desc:  `${payload.name} · ${payload.category} · ${payload.price} BHD`,
        ref:   payload.id,
        refType: 'service'
      });
    } else {
      if (isEdit) {
        const idx = services.findIndex(s => s.id === current.id);
        services[idx] = Object.assign({}, services[idx], payload);
      } else {
        services.unshift(payload);
      }
      saveServices(services);
      if (window.TajLog) {
        TajLog.add({
          type: 'note',
          title: isEdit ? 'Service updated' : 'Service added',
          desc:  `${payload.name} · ${payload.category} · ${payload.price} BHD`,
          ref:   payload.id,
          refType: 'service'
        });
      }
    }
  } catch (err) {
    console.warn('[admin-service] save failed:', err);
    if (isEdit) {
      const idx = services.findIndex(s => s.id === current.id);
      if (idx >= 0) services[idx] = Object.assign({}, services[idx], payload);
    } else {
      services.unshift(payload);
    }
    saveServices(services);
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = originalLabel || (isEdit ? 'Save Changes' : 'Save Service');
  }

  if (typeof showToast === 'function') showToast(isEdit ? 'Service updated' : 'Service added');
  setTimeout(() => location.href = 'admin.html#sg-services', 700);
});

/* ---- Delete ---- */
document.getElementById('delete-svc')?.addEventListener('click', async () => {
  if (!isEdit) return;
  if (!confirm(`Remove "${current.name}" from your services?`)) return;

  const delBtn = document.getElementById('delete-svc');
  const originalLabel = delBtn ? delBtn.innerHTML : null;
  if (delBtn) {
    delBtn.disabled = true;
    delBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing…';
  }

  try {
    if (window.TajData) {
      await TajData.services.remove(current.id);
      await TajData.activity.log({
        type: 'note',
        title: 'Service removed',
        desc:  `${current.name} · ${current.id}`,
        ref:   current.id,
        refType: 'service'
      });
    } else {
      services = loadServices().filter(s => s.id !== current.id);
      saveServices(services);
    }
  } catch (err) {
    console.warn('[admin-service] delete failed:', err);
    services = loadServices().filter(s => s.id !== current.id);
    saveServices(services);
  }

  if (delBtn) {
    delBtn.disabled = false;
    delBtn.innerHTML = originalLabel || 'Delete';
  }

  if (window.TajLog) {
    TajLog.add({
      type: 'note',
      title: 'Service removed',
      desc:  `${current.name} · ${current.id}`,
      ref:   current.id,
      refType: 'service'
    });
  }
  if (typeof showToast === 'function') showToast('Service removed');
  setTimeout(() => location.href = 'admin.html#sg-services', 500);
});

/* Toast fallback */
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#2A1810;color:#D4B896;padding:14px 28px;border-radius:999px;font-size:0.86rem;letter-spacing:0.04em;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.3);';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = 1;
  setTimeout(() => el.style.opacity = 0, 2200);
}
window.showToast = window.showToast || showToast;
