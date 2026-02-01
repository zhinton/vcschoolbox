// Pastoral Care - Subtype Severity schema
functionSchema = {
  functionName: 'Subtype Severity',
  description: 'Auto selecting severity/category based on the subtype selected.',
  fields: [
    {
      name: 'subtypeSeverityPairs',
      label: 'Subtype/Category Pairs',
      type: 'rows',
      placeholders: ['Subtype','Category'],
      tips: 'Each line: Subtype|Category',
      allowMultiple: true
    }
  ],
  options: [
    'Behaviour|Level 2',
    'Uniform|Level 1'
  ]
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
  const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
  // Look for a rows field or fall back to options
  let pairs = [];
  if (Array.isArray(s.fields)) {
    const row = s.fields.find(f=>f.type==='rows' || f.name==='subtypeSeverityPairs');
    if (row && Array.isArray(row.options) && row.options.length) {
      pairs = row.options.map(r => r.split('|').map(p=> (p||'').trim()));
    }
  }
  if (!pairs.length && Array.isArray(s.options)) {
    pairs = s.options.map(r => r.split('|').map(p=> (p||'').trim()));
  }
  window.subtypeSeverity = pairs;
})();

// The runtime behaviour for Subtype Severity is appended below.
function autoSelectSeverity() {
    const subtypeDropdown = document.getElementById('subtypeId');
    const severityDropdown = document.getElementById('severityId');

    if (!subtypeDropdown || !severityDropdown) {
        console.error('Subtype or severity dropdown not found.');
        return;
    }

    const selectedOption = subtypeDropdown.options[subtypeDropdown.selectedIndex];
    if (!selectedOption) {
        console.log('No subtype selected.');
        return;
    }

    const selectedSubtype = selectedOption.text;
    console.log('Selected subtype:', selectedSubtype);

    for (let i = 0; i < subtypeSeverity.length; i++) {
        const [subtype, severity] = subtypeSeverity[i];
        if (selectedSubtype.startsWith(subtype)) {
            console.log(`Matching subtype found: ${subtype}, setting severity to: ${severity}`);
            for (let j = 0; j < severityDropdown.options.length; j++) {
                if (severityDropdown.options[j].text.includes(severity)) {
                    severityDropdown.selectedIndex = j;
                    console.log(`Selected severity: ${severity}`);
                    break;
                }
            }
            break;
        }
    }
}

// Add event listener to subtype dropdown to trigger auto-select on change
(function() {
  function attach() {
    const subtypeEl = document.getElementById('subtypeId');
    if (subtypeEl) subtypeEl.addEventListener('change', autoSelectSeverity);
    try { autoSelectSeverity(); } catch (e) { /* ignore init errors */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
})();
