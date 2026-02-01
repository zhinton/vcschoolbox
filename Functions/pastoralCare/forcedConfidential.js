// Pastoral Care - Forced Confidential schema
functionSchema = {
  functionName: 'Forced Confidential',
  description: 'Forces users to enter details in the confidential tab when a specified type is selected.',
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'input',
      placeholder: 'Type that should trigger forced confidential behavior',
      default: 'Student Protection',
      allowMultiple: false
    }
  ],
  options: []
}; 

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
  const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
  const field = Array.isArray(s.fields) ? s.fields.find(f=>f.name==='type') : null;
  // Prefer explicit default, then placeholder, then empty string
  window.forcedConfidential_type = (field && (field.default || field.placeholder)) || '';
})();
// The runtime behaviour for Forced Confidential is appended below.
function updatePageForConfidentialType() {
    const typeIdField = document.getElementById('typeId');
    const generalTabLink = document.querySelector('a[data-tab][href="#panel-general"]');
    const confidentialTabLink = document.querySelector('a[data-tab][href="#panel-confidential"]');

    if (!typeIdField || !generalTabLink || !confidentialTabLink) {
        console.error('Required elements not found.');
        return;
    }

    const selectedOption = typeIdField.options[typeIdField.selectedIndex];
    const selectedType = selectedOption ? selectedOption.text : '';
    console.log('Selected type:', selectedType);

    // Use the generated variable here:
    if (selectedType.startsWith(forcedConfidential_type)) {
        console.log('Confidential type detected.');

        // Hide the General tab link
        generalTabLink.style.display = 'none';

        // Select the Confidential tab
        confidentialTabLink.setAttribute('aria-selected', 'true');
        confidentialTabLink.setAttribute('tabindex', '0');
        confidentialTabLink.click(); // Simulate a click to activate the tab
    } else {
        console.log('Non-confidential type detected.');

        // Show the General tab link
        generalTabLink.style.display = '';

        // Deselect the Confidential tab
        confidentialTabLink.removeAttribute('aria-selected');
        confidentialTabLink.setAttribute('tabindex', '-1');
    }
}

// Safely attach listener and initialise after DOM is ready
(function() {
  function attach() {
    const typeEl = document.getElementById('typeId');
    if (typeEl) {
      typeEl.addEventListener('change', updatePageForConfidentialType);
    }
    try { updatePageForConfidentialType(); } catch (e) { console.warn('updatePageForConfidentialType failed on init', e); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
})();
