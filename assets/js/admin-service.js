/* Taj Al Sukun — Service Editor (admin-service.html)
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
/* Complete image library, each photo tagged with the categories it suits.
   The picker groups these into category "folders" so the right images are
   easy to find. `cat` keys match the Category dropdown values exactly so the
   matching folder can auto-open; 'Venue' is a general ambience folder. */
const GALLERY = [
  { src:'assets/images/spa-detail-1.jpg',       cats:['Hammam','Body'] },
  { src:'assets/images/spa-detail-2.jpg',       cats:['Hammam','Body'] },
  { src:'assets/images/spa-relax-1.jpg',        cats:['Massage','Couple'] },
  { src:'assets/images/spa-relax-2.jpg',        cats:['Massage','Face'] },
  { src:'assets/images/spa-relax-3.jpg',        cats:['Foot','Massage'] },
  { src:'assets/images/deep-tissue.jpg',        cats:['Massage'] },
  { src:'assets/images/sanctuary-bed.jpg',      cats:['Massage','Body'] },
  { src:'assets/images/treatment-room.jpg',     cats:['Massage','Venue'] },
  { src:'assets/images/couples-massage.jpg',    cats:['Couple','Massage','Package'] },
  { src:'assets/images/therapist-prep.jpg',     cats:['Massage','Waxing','Foot'] },
  { src:'assets/images/therapist-products.jpg', cats:['Nails','Face','Massage'] },
  { src:'assets/images/products-shelf.jpg',     cats:['Nails','Face','Venue'] },
  { src:'assets/images/lounge-flowers.jpg',     cats:['Venue','Couple'] },
  { src:'assets/images/packages-menu.jpg',      cats:['Package','Venue'] },
  { src:'assets/images/services-menu.jpg',      cats:['Package','Venue'] },
  { src:'assets/images/spa-foyer.jpg',          cats:['Package','Venue'] },
  { src:'assets/images/lobby-table.jpg',        cats:['Package','Venue'] },
  { src:'assets/images/waiting-lounge.jpg',     cats:['Venue'] },
  { src:'assets/images/spa-corridor.jpg',       cats:['Venue','Barber'] },
  { src:'assets/images/reception-desk.jpg',     cats:['Barber','Venue'] },
  { src:'assets/images/team-reception.jpg',     cats:['Barber','Venue'] },
  { src:'assets/images/spa-entrance.jpg',       cats:['Venue'] },
  { src:'assets/images/spa-exterior.jpg',       cats:['Venue'] },
  { src:'assets/images/exterior-front.jpg',     cats:['Venue'] },
  { src:'assets/images/manager-portrait.jpg',   cats:['Venue'] }
];
/* Folder order + labels. `key` matches the Category value (or 'all'/'Venue'). */
const GALLERY_FOLDERS = [
  { key:'all',     label:'All Images' },
  { key:'Hammam',  label:'Hammam' },
  { key:'Massage', label:'Massage' },
  { key:'Foot',    label:'Foot Ritual' },
  { key:'Face',    label:'Face / Skincare' },
  { key:'Body',    label:'Body Treatment' },
  { key:'Couple',  label:'Couple' },
  { key:'Package', label:'Packages' },
  { key:'Waxing',  label:'Waxing / Hair Removal' },
  { key:'Nails',   label:'Nails / Beauty' },
  { key:'Barber',  label:'Barber / Grooming' },
  { key:'Venue',   label:'Spa & Venue' }
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
  audience:   document.getElementById('sv-audience'),
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
  if (F.audience) F.audience.value = s.audience || 'both';
}

if (current) {
  hydrate(current);
} else {
  // Defaults for new
  F.duration.value = '60 min';
  F.status.value   = 'active';
  F.sort.value     = 100;
  if (F.audience) F.audience.value = 'both';
}

/* ---- Audience is stored in a settings map (service-audience: { id: 'both'|
   'ladies'|'men' }) because the services DB table has no audience column.
   Load the current service's audience from there on edit. ---- */
let audienceMap = {};
(async function loadAudience() {
  try {
    if (window.TajData?.settings?.get) {
      const saved = await TajData.settings.get('service-audience');
      if (saved && typeof saved === 'object') audienceMap = saved;
    }
    if (!Object.keys(audienceMap).length) {
      try { audienceMap = JSON.parse(localStorage.getItem('taj-service-audience') || '{}') || {}; } catch (_) {}
    }
    if (isEdit && current && F.audience && audienceMap[current.id]) {
      F.audience.value = audienceMap[current.id];
    }
  } catch (_) {}
})();

/* ---- Image gallery (complete library, grouped into category folders) ---- */
const sg          = document.getElementById('svc-img-suggest');     // grid
const elFolders   = document.getElementById('svc-gallery-folders');
const elCount     = document.getElementById('svc-gallery-count');
let galleryFolder = 'all';

function galleryItems(folder) {
  return folder === 'all' ? GALLERY : GALLERY.filter(g => g.cats.includes(folder));
}
function renderFolders() {
  if (!elFolders) return;
  elFolders.innerHTML = GALLERY_FOLDERS.map(f => {
    const n = galleryItems(f.key).length;
    if (f.key !== 'all' && n === 0) return '';                 // hide empty folders
    const active = f.key === galleryFolder;
    return `<button type="button" class="svc-folder${active ? ' is-active' : ''}" data-folder="${f.key}">
      <i class="fas ${active ? 'fa-folder-open' : 'fa-folder'}"></i><span>${f.label}</span><b>${n}</b>
    </button>`;
  }).join('');
  elFolders.querySelectorAll('.svc-folder').forEach(b =>
    b.addEventListener('click', () => { galleryFolder = b.dataset.folder; renderGallery(); }));
}
function renderGrid() {
  if (!sg) return;
  const items = galleryItems(galleryFolder);
  const current = (F.image.value || '').trim();
  sg.innerHTML = items.map(g => {
    const name = g.src.split('/').pop();
    const sel = current === g.src ? ' is-selected' : '';
    return `<button type="button" class="svc-img-quick${sel}" data-src="${g.src}" title="${name}">
      <img src="${g.src}" alt="" loading="lazy"><span class="svc-img-quick__name">${name}</span>
    </button>`;
  }).join('') || '<p class="svc-gallery__empty">No images in this folder yet.</p>';
  sg.querySelectorAll('.svc-img-quick').forEach(b =>
    b.addEventListener('click', () => { F.image.value = b.dataset.src; refresh(); renderGrid(); }));
  if (elCount) elCount.textContent = items.length + ' image' + (items.length === 1 ? '' : 's');
}
function renderGallery() { renderFolders(); renderGrid(); }

// Open the folder that matches the service's category (falls back to "All").
function syncGalleryToCategory() {
  const c = F.category && F.category.value;
  galleryFolder = (c && galleryItems(c).length) ? c : 'all';
  renderGallery();
}
if (F.category) F.category.addEventListener('change', syncGalleryToCategory);
if (F.image)    F.image.addEventListener('input', renderGrid);
syncGalleryToCategory();

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

// Upload-from-computer button next to the image URL field.
// Uses the shared TajUpload helper (Supabase Storage with data-URL fallback).
document.getElementById('sv-image-upload')?.addEventListener('click', e => {
  if (!window.TajUpload) { alert('Upload helper not loaded.'); return; }
  TajUpload.pickAndUpload(url => {
    F.image.value = url;
    refresh();
  }, { btn: e.currentTarget });
});

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
    sort: parseInt(F.sort.value, 10) || 100,
    // Carried locally for instant UI; the durable copy is the settings map below.
    audience: (F.audience && F.audience.value) || 'both'
  };

  // Persist audience into the settings map (durable — survives DB sync, since
  // the services table has no audience column).
  try {
    audienceMap[payload.id] = payload.audience;
    localStorage.setItem('taj-service-audience', JSON.stringify(audienceMap));
    if (window.TajData?.settings?.set) await TajData.settings.set('service-audience', audienceMap);
  } catch (_) {}

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
