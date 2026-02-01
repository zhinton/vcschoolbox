// Example pastoral care function schema for embedding
functionSchema = {
  functionName: "Subtype Alert",
  description: "Defines subtype -> alert message pairs used to inform staff of a specific message.",
  fields: [
    {
      name: "subtypeAlertPairs",
      label: "Subtype Alert Pairs",
      type: "rows",
      placeholders: ["Subtype","Message"],
      options: [
        "(Parent)|This will notify the parent/caregiver Do you want to proceed?",
        "Behaviour|Notify classroom teacher",
        "Health|Contact parent/caregiver"
      ],
      tips: "Each line is in the format: subtype|message. New lines allowed.",
      allowMultiple: true
    },

  ]
};

// -------- Function code below --------

  // Inject runtime variables from schema
  ;(function(){
    const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
    let pairs = [];
    if (Array.isArray(s.fields)) {
      const row = s.fields.find(f=>f.type==='rows' || f.name==='subtypeAlertPairs');
      if (row && Array.isArray(row.options) && row.options.length) {
        pairs = row.options.map(r=>r.split('|').map(p=> (p||'').trim()));
      }
    }
    if (!pairs.length && Array.isArray(s.options)) {
      pairs = s.options.map(r=>r.split('|').map(p=> (p||'').trim()));
    }
    window.subtypeAlertPairs = pairs;
    window.subtypeCheck = pairs.length ? (pairs[0][0] || '').toUpperCase() : '';
    window.modalMessage = pairs.length ? (pairs[0][1] || '') : '';
  })();

  // The runtime behaviour for Subtype Alert is appended below.
  (function() {
    function attach() {
      const subtypeDropdown = document.getElementById('subtypeId');
      if (!subtypeDropdown) return;
      subtypeDropdown.addEventListener('change', function() {
        var selectedText = subtypeDropdown.options[subtypeDropdown.selectedIndex].text;
        if (selectedText.toUpperCase().includes(subtypeCheck)) {
          showModal(modalMessage, [
            { text: 'Yes', color: window.acceptColor, },
            { text: 'No', color: window.rejectColor, callback: unselectDropdown }
          ]);
        }
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
  })();

  function unselectDropdown() {
    var dropdown = document.getElementById('subtypeId');
    dropdown.selectedIndex = 0;
  }
