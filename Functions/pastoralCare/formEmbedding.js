// Pastoral Care - Form Embedding schema
functionSchema = {
  functionName: "Form Embedding",
  description: "Defines embedding rules mapping Type + Subtype to a form name. Use one entry per line in the textarea as: Type|Subtype|Form Name",
  fields: [
    {
      name: "embeds",
      label: "Embeds (Type|Subtype|Form Name)",
      type: "rows",
      placeholders: ["Type", "Subtype", "Form Name"],
      options: [
        "NCCD|Assessment|NCCD Adjustment Log",
        "Welbeing|Assessment|Referral Form"
      ],
      tips: "One mapping per line. Format: Type|Subtype|Form Name. New lines allowed.",
      allowMultiple: true
    }
  ]
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
  const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
  let embeds = [];
  if (Array.isArray(s.fields)) {
    const row = s.fields.find(f=>f.type==='rows' || f.name==='embeds');
    if (row && Array.isArray(row.options) && row.options.length) {
      embeds = row.options.map(r => r.split('|').map(p=> (p||'').trim()));
    }
  }
  if (!embeds.length && Array.isArray(s.options)) {
    embeds = s.options.map(r => r.split('|').map(p=> (p||'').trim()));
  }
  window.formEmbeds = embeds.map(arr=>({
    type: arr[0]||'',
    subtype: arr[1]||'',
    formName: arr[2]||''
  }));
})();

// Initialize the global forms registry
window.GeneratedForms = window.GeneratedForms || {};

// The runtime behaviour for Form Embedding is appended below.
// Helper to show modal and copy submitted form data into CKEditor editable area
function showFormWithEditorCopy(html, opts = {}) {
  // Previously this helper attempted to detect CKEditor instances and call their
  // APIs. That caused errors in some environments when the detected object
  // wasn't actually an editor. The modal's default behaviour already copies
  // submitted data to the clipboard, so prefer that by not overriding
  // `options.onSubmit` here. Callers can still pass a custom `onSubmit` in
  // `opts` if they need special handling.
  const options = Object.assign({ maxWidth: '900px' }, opts);
  // Persist last shown form html/options so a small "refresh" button
  // can re-open the same modal without re-generating it.
  try {
    window._lastEmbeddedFormHtml = html;
    window._lastEmbeddedFormOptions = options;
  } catch (e) {
    // ignore if host prevents mutation
  }
  formShowModal(html, options);
}

function checkAndLogEmbeddedForm() {
  const typeEl = document.getElementById('typeId');
  const subtypeEl = document.getElementById('subtypeId');
  if (!typeEl || !subtypeEl) {
    console.warn('Type or Subtype element not found.');
    return;
  }
  const typeOpt = typeEl.options[typeEl.selectedIndex];
  const subtypeOpt = subtypeEl.options[subtypeEl.selectedIndex];
  const selectedType = typeOpt ? typeOpt.text.trim() : '';
  const selectedSubtype = subtypeOpt ? subtypeOpt.text.trim() : '';
  if (!selectedType && !selectedSubtype) {
    console.log('No type or subtype selected.');
    return;
  }
  console.log('formEmbeds:', window.formEmbeds);
  console.log('Selected type/subtype:', selectedType, selectedSubtype);
  for (let i=0;i<(window.formEmbeds||[]).length;i++) {
    const m = window.formEmbeds[i] || {};
    const mt = (m.type||'').trim().toLowerCase();
    const ms = (m.subtype||'').trim().toLowerCase();
    const st = (selectedType||'').toLowerCase();
    const ss = (selectedSubtype||'').toLowerCase();
    const typeMatches = mt === '' ? true : st.startsWith(mt);
    const subtypeMatches = ms === '' ? true : ss.startsWith(ms);
    console.log(`Comparing to mapping: type='${m.type}', subtype='${m.subtype}', form='${m.formName}' -> typeMatches=${typeMatches}, subtypeMatches=${subtypeMatches}`);
    if (typeMatches && subtypeMatches) {
      console.log('Form would have loaded:', m.formName);
      // If a generated form is available, render it into the modal. Otherwise show placeholder.
      ensureFormModalLoaded(() => {
        try {
          const placeholder = '<div style="padding:8px"><h3>' + (m.formName||'Form') + '</h3><p>Form would have loaded here.</p></div>';
          if (window.GeneratedForms && window.GeneratedForms[m.formName]) {
            const entry = window.GeneratedForms[m.formName];
            // Prefer a render function when available, otherwise pass the schema object
            if (entry && typeof entry.render === 'function') {
              const tmpId = 'generatedFormTmp_' + Math.random().toString(36).slice(2);
              const tmp = document.createElement('div');
              tmp.id = tmpId;
              tmp.style.display = 'none';
              document.body.appendChild(tmp);
              try {
                entry.render(tmpId);
                const html = tmp.innerHTML || placeholder;
                showFormWithEditorCopy(html);
              } catch (e) {
                console.warn('Rendering generated form failed:', e);
                showFormWithEditorCopy(placeholder, { maxWidth: '700px' });
              } finally {
                tmp.remove();
              }
            } else if (entry && entry.schema) {
              try {
                showFormWithEditorCopy(entry.schema);
              } catch (e) {
                console.warn('Showing schema in modal failed', e);
                showFormWithEditorCopy(placeholder, { maxWidth: '700px' });
              }
            } else {
              showFormWithEditorCopy(placeholder, { maxWidth: '700px' });
            }
          } else {
            showFormWithEditorCopy(placeholder, { maxWidth: '700px' });
          }
        } catch (e) {
          console.warn('formShowModal failed:', e);
        }
      });
      return;
    }
  }
  // Fallback: if the selected subtype or type directly matches a generated form name, load it
  try {
    const gen = window.GeneratedForms || {};
    const names = Object.keys(gen).map(n => n.toLowerCase());
    const ss = (selectedSubtype||'').toLowerCase();
    const st = (selectedType||'').toLowerCase();
    if (ss && names.indexOf(ss) !== -1) {
      console.log('Fallback: selectedSubtype matches generated form name:', selectedSubtype);
      ensureFormModalLoaded(() => {
        try {
          const key = Object.keys(gen).find(k=>k.toLowerCase()===ss);
          const entry = gen[key];
          if (entry) {
            if (typeof entry.render === 'function') {
              const tmpId = 'generatedFormTmp_' + Math.random().toString(36).slice(2);
              const tmp = document.createElement('div');
              tmp.id = tmpId;
              tmp.style.display = 'none';
              document.body.appendChild(tmp);
              entry.render(tmpId);
              const html = tmp.innerHTML || '<div>Form</div>';
              tmp.remove();
              showFormWithEditorCopy(html);
            } else if (entry.schema) {
              showFormWithEditorCopy(entry.schema);
            } else {
              showFormWithEditorCopy('<div>Form would have loaded</div>', { maxWidth: '700px' });
            }
          }
        } catch(e) {
          console.warn('Fallback render failed', e);
          showFormWithEditorCopy('<div>Form would have loaded</div>', { maxWidth: '700px' });
        }
      });
      return;
    }
    if (st && names.indexOf(st) !== -1) {
      console.log('Fallback: selectedType matches generated form name:', selectedType);
      ensureFormModalLoaded(() => {
        try {
          const key = Object.keys(gen).find(k=>k.toLowerCase()===st);
          const entry = gen[key];
          if (entry) {
            if (typeof entry.render === 'function') {
              const tmpId = 'generatedFormTmp_' + Math.random().toString(36).slice(2);
              const tmp = document.createElement('div');
              tmp.id = tmpId;
              tmp.style.display = 'none';
              document.body.appendChild(tmp);
              entry.render(tmpId);
              const html = tmp.innerHTML || '<div>Form</div>';
              tmp.remove();
              showFormWithEditorCopy(html);
            } else if (entry.schema) {
              showFormWithEditorCopy(entry.schema);
            } else {
              showFormWithEditorCopy('<div>Form would have loaded</div>', { maxWidth: '700px' });
            }
          }
        } catch(e) {
          console.warn('Fallback render failed', e);
          showFormWithEditorCopy('<div>Form would have loaded</div>', { maxWidth: '700px' });
        }
      });
      return;
    }
  } catch (e) {
    console.warn('Fallback matching error', e);
  }
  console.log('No embedded form matched for selected type/subtype.');
}

(function(){
  function attach() {
    const typeEl = document.getElementById('typeId');
    const subtypeEl = document.getElementById('subtypeId');

    function hasEmbeddedFormForCurrentSelection() {
      const tEl = document.getElementById('typeId');
      const sEl = document.getElementById('subtypeId');
      const typeOpt = tEl && tEl.options[tEl.selectedIndex];
      const subtypeOpt = sEl && sEl.options[sEl.selectedIndex];
      const selectedType = typeOpt ? typeOpt.text.trim() : '';
      const selectedSubtype = subtypeOpt ? subtypeOpt.text.trim() : '';

      const st = (selectedType||'').toLowerCase();
      const ss = (selectedSubtype||'').toLowerCase();

      for (let i=0;i<(window.formEmbeds||[]).length;i++) {
        const m = window.formEmbeds[i] || {};
        const mt = (m.type||'').trim().toLowerCase();
        const ms = (m.subtype||'').trim().toLowerCase();
        const typeMatches = mt === '' ? true : st.startsWith(mt);
        const subtypeMatches = ms === '' ? true : ss.startsWith(ms);
        if (typeMatches && subtypeMatches) return true;
      }

      try {
        const gen = window.GeneratedForms || {};
        const names = Object.keys(gen).map(n => n.toLowerCase());
        if (ss && names.indexOf(ss) !== -1) return true;
        if (st && names.indexOf(st) !== -1) return true;
      } catch (e) { }

      return false;
    }

    function ensureRefreshButton() {
      if (document.getElementById('refreshEmbeddedFormButton')) return;
      const refBtn = document.createElement('button');
      refBtn.id = 'refreshEmbeddedFormButton';
      refBtn.type = 'button';
      // Add a refresh icon to the left of the button label. Use an inline
      // SVG so it works without external assets and inherits `currentColor`.
      // Use a stroke-based refresh icon (thicker stroke) for better visibility
      // Make the button a flex container so the icon and text center vertically
      refBtn.style.display = refBtn.style.display || 'inline-flex';
      refBtn.style.alignItems = refBtn.style.alignItems || 'center';
      refBtn.style.gap = refBtn.style.gap || '8px';
      refBtn.innerHTML = '<span class="refresh-icon" style="display:inline-flex;align-items:center;">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block;height:18px;width:18px;">'
        + '<path d="M21 12a8.5 8.5 0 1 0-2.5 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />'
        + '<polyline points="21 6 21 12 15 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />'
        + '</svg>'
        + '</span>'
        + '<span class="refresh-text">Re-Submit</span>';
      refBtn.style.marginLeft = '0';
      // Use base font size and line-height variables when available
      // Fallback to 12px / 1.2 if the variables are not present in the host
      refBtn.style.fontSize = refBtn.style.fontSize || 'var(--base-font-size,12px)';
      refBtn.style.lineHeight = refBtn.style.lineHeight || 'calc(var(--base-font-size,12px) * var(--base-line-height,1.2))';
      // Use a normal font weight (400). The user wrote "400px" but
      // font-weight is numeric — interpret as 400.
      refBtn.style.fontWeight = refBtn.style.fontWeight || '400';
      refBtn.style.verticalAlign = 'middle';
      refBtn.style.marginBottom = '16px';
      refBtn.className = 'refresh-embedded-form-button';
      // Prevent the button text from wrapping onto a second line
      refBtn.style.whiteSpace = refBtn.style.whiteSpace || 'nowrap';
      refBtn.style.paddingLeft = refBtn.style.paddingLeft || '8px';
      refBtn.style.paddingRight = refBtn.style.paddingRight || '8px';
      refBtn.style.minWidth = refBtn.style.minWidth || '125px';
      refBtn.style.overflow = refBtn.style.overflow || 'hidden';
      try {
        const txt = refBtn.querySelector && refBtn.querySelector('.refresh-text');
        if (txt) {
          txt.style.whiteSpace = 'nowrap';
          txt.style.display = txt.style.display || 'inline-block';
          txt.style.fontWeight = txt.style.fontWeight || '400';
        }
      } catch (e) { /* ignore */ }
      refBtn.addEventListener('click', function () {
        if (window._lastEmbeddedFormHtml) {
          try { formShowModal(window._lastEmbeddedFormHtml, window._lastEmbeddedFormOptions || { maxWidth: '900px' }); }
          catch (e) { console.warn('Refresh show failed', e); }
        } else {
          checkAndLogEmbeddedForm();
        }
      });

      const anchor = subtypeEl || typeEl;
      if (anchor && anchor.parentNode) {
        try {
          const parent = anchor.parentNode;
          // Create a small flex row that contains ONLY the select and the
          // refresh button so labels and other siblings are not reflowed.
          let rowWrap = null;
          try {
            rowWrap = document.createElement('div');
            rowWrap.className = rowWrap.className || 'embedded-form-row';
            rowWrap.style.display = rowWrap.style.display || 'flex';
            rowWrap.style.alignItems = rowWrap.style.alignItems || 'center';
            rowWrap.style.gap = rowWrap.style.gap || '0';
            parent.insertBefore(rowWrap, anchor);
            rowWrap.appendChild(anchor);
          } catch (e) { rowWrap = null; }
          // Set select width to 75% so it and the button share the row,
          // but avoid forcing a width when the subtype select is used
          // (the user prefers the subtype to keep its natural width).
          try {
            if (anchor === typeEl) {
              anchor.style.width = anchor.style.width || '75%';
            } else {
              // Ensure subtype (or other anchors) are not forced to a percentage
              anchor.style.width = anchor.style.width || '';
            }
            anchor.style.boxSizing = 'border-box';
            anchor.style.display = anchor.style.display || 'inline-block';
          } catch (e) { /* ignore style failures */ }

          // Create a small wrapper for the button so we don't change parent's layout
          const wrap = document.createElement('div');
          wrap.className = 'embedded-form-btn-wrap';
          wrap.style.display = 'inline-flex';
          wrap.style.alignItems = 'center';
          wrap.style.marginLeft = '0';
          // Avoid using float which can alter parent's layout; insert the
          // wrapper immediately after the anchor instead so it stays
          // visually adjacent without forcing layout changes.
          wrap.style.float = '';

          wrap.appendChild(refBtn);

          // Insert wrapper into the row container (if created) or the parent
          const container = rowWrap || parent;
          container.appendChild(wrap);
          // Try to match the button height to the select's rendered height
          try {
            const h = (anchor && anchor.offsetHeight) ? anchor.offsetHeight : 0;
            if (h) {
              refBtn.style.height = h + 'px';
              refBtn.style.lineHeight = h + 'px';
              // Remove internal vertical padding to keep heights identical
              refBtn.style.paddingTop = '0';
              refBtn.style.paddingBottom = '0';
            }
          } catch (err) { /* ignore */ }
        } catch (e) {
          // Fallback: insert the raw button after the anchor instead of
          // appending to the end which can shift layout.
          try { anchor.parentNode.insertBefore(refBtn, anchor.nextSibling); }
          catch (ee) { anchor.parentNode.appendChild(refBtn); }
        }
      } else {
        document.body.appendChild(refBtn);
      }
    }

    function removeRefreshButton() {
      const ex = document.getElementById('refreshEmbeddedFormButton');
      if (ex && ex.parentNode) ex.parentNode.removeChild(ex);
    }

    function toggleRefreshButton() {
      if (hasEmbeddedFormForCurrentSelection()) ensureRefreshButton();
      else removeRefreshButton();
    }

    if (typeEl) typeEl.addEventListener('change', function(){ checkAndLogEmbeddedForm(); toggleRefreshButton(); });
    if (subtypeEl) subtypeEl.addEventListener('change', function(){ checkAndLogEmbeddedForm(); toggleRefreshButton(); });

    try { checkAndLogEmbeddedForm(); } catch(e) { console.warn('checkAndLogEmbeddedForm init failed', e); }
    try { toggleRefreshButton(); } catch (e) { }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();

// Helper to load the form modal script dynamically if it's not already present
function ensureFormModalLoaded(cb) {
  if (typeof window.formShowModal === 'function') {
    return cb();
  }
  // Attempt to load the script from the Modals folder relative to site root
  const src = 'Modals/formModal.js';
  // Avoid loading multiple times
  if (document.querySelector('script[data-formmodal-loader]')) {
    // Wait for it to load
    const checkInterval = setInterval(() => {
      if (typeof window.formShowModal === 'function') {
        clearInterval(checkInterval);
        cb();
      }
    }, 50);
    // Timeout fallback after 5s
    setTimeout(() => clearInterval(checkInterval), 5000);
    return;
  }
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.setAttribute('data-formmodal-loader', '1');
  s.onload = () => { try { cb(); } catch(e){console.warn('callback failed', e);} };
  s.onerror = () => { console.warn('Failed to load formModal script:', src); };
  document.head.appendChild(s);
}

