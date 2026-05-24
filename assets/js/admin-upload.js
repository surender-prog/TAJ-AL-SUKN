/* Taj Al Sukun — shared image-upload helper for the admin
   ============================================================
   Used everywhere the admin picks an image (Pages CMS, Service editor, …).
   Primary path: upload to a Supabase Storage bucket named "cms-images" and
   return its public URL. Fallback: read the file as a base64 data: URL so
   the feature still works before Storage is configured.

   Public API:
     await TajUpload.uploadFile(File)         → publicUrl | dataURL
     TajUpload.pickAndUpload(cb, { btn? })    → opens file chooser, on success
                                                cb(url) is called; if btn is
                                                supplied, shows a spinner.

   Setup (one-time, in Supabase Dashboard):
     1. Storage → New bucket → name "cms-images" → Public: ON.
     2. (Optional) Add an INSERT policy on storage.objects for authenticated
        so only logged-in admins can upload.
*/
(function () {
  'use strict';

  var BUCKET = 'cms-images';
  var MAX_BYTES = 5 * 1024 * 1024;          // 5 MB
  var ACCEPT  = 'image/*';

  function sb() {
    // Reuse the shared client (admin-auth created it under the auth session).
    return window.__tajSb || (window.TajData && window.TajData._sb) || null;
  }

  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function (e) { reject(new Error('Could not read file: ' + (e && e.message || ''))); };
      r.readAsDataURL(file);
    });
  }

  function makePath(file) {
    var ext = (file.name || '').split('.').pop() || 'jpg';
    ext = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    var base = (file.name || 'image')
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image';
    return base + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
  }

  async function uploadFile(file) {
    if (!file) throw new Error('No file selected.');
    if (!/^image\//.test(file.type)) throw new Error('Please choose an image file.');
    if (file.size > MAX_BYTES) {
      throw new Error('Image is too large (' + (file.size / 1024 / 1024).toFixed(1) + ' MB). Max is 5 MB.');
    }
    var client = sb();
    if (client && client.storage) {
      try {
        var path = makePath(file);
        var up = await client.storage.from(BUCKET).upload(path, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        if (!up.error && up.data) {
          var pub = client.storage.from(BUCKET).getPublicUrl(up.data.path);
          if (pub && pub.data && pub.data.publicUrl) return pub.data.publicUrl;
        }
        console.warn('[TajUpload] storage upload failed:', up.error && up.error.message);
      } catch (e) {
        console.warn('[TajUpload] storage threw:', e && e.message);
      }
    }
    // Fallback: inline as data URL (works without storage; bloats settings rows)
    console.info('[TajUpload] using data-URL fallback (set up a Supabase "cms-images" bucket for proper hosting)');
    return await fileToDataURL(file);
  }

  function pickAndUpload(cb, opts) {
    opts = opts || {};
    var btn = opts.btn || null;
    var origHtml = btn ? btn.innerHTML : null;
    var origDisabled = btn ? btn.disabled : false;

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT;
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async function () {
      var file = input.files && input.files[0];
      input.remove();
      if (!file) return;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading…'; }
      try {
        var url = await uploadFile(file);
        cb(url);
      } catch (err) {
        alert(err && err.message ? err.message : 'Upload failed.');
      } finally {
        if (btn) { btn.disabled = origDisabled; btn.innerHTML = origHtml; }
      }
    });

    input.click();
  }

  window.TajUpload = { uploadFile: uploadFile, pickAndUpload: pickAndUpload, BUCKET: BUCKET };
})();
