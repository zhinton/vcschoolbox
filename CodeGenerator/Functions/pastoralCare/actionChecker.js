// Pastoral Care - Action Checker schema
functionSchema = {
  functionName: 'Action Checker',
  description: 'Links actions to Tags. Prompts the user to ensure they are taking the correct action.',
  fields: [
    {
      name: 'mappings',
      label: 'Action Mappings (Action|Tag Lists|Message)',
      type: 'rows',
      placeholders: ['Action', 'Tag Lists', 'Message'],
      options: [
        'Suspend Student|Discipline Tags|Please follow the discipline process',
        'Refer to Counsellor|Counselling Tags|Refer the student to the counselling team'
      ],
      tips: 'One mapping per line. Format: Action|Tag Lists|Message. Tag lists may be comma-separated.',
      allowMultiple: true,
      maxEntries: 0
    }
  ],
  options: []
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
  const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
  let mappings = [];
  if (Array.isArray(s.fields)) {
    const row = s.fields.find(f=>f.type==='rows' || f.name==='mappings');
    if (row && Array.isArray(row.options) && row.options.length) {
      mappings = row.options.map(r=>r.split('|').map(p=> (p||'').trim()));
    }
  }
  if (!mappings.length && Array.isArray(s.options) && s.options.length) {
    mappings = s.options.map(r=>r.split('|').map(p=> (p||'').trim()));
  }
  // Build parallel arrays used by the runtime
  window.actions = mappings.map(m=>m[0] || '');
  window.tagLists = mappings.map(m=> (m[1] || '').split(',').map(t=>t.trim()).filter(Boolean));
  window.messages = mappings.map(m=> m[2] || '');
})();

// The runtime behaviour for Action Checker is appended below.
(function() {
  function attach() {
    const submitEl = document.querySelector('.submit');
    if (!submitEl) return;
    submitEl.addEventListener('mouseover', (event) => {
      const pastoralDropdown = document.getElementById('pastoral-actions');
      if (!pastoralDropdown) {
        return;
      }

      const selectizeInput = document.querySelector('.selectize-input.items.not-full');
      if (!selectizeInput) {
        console.error('Selectize input not found.');
        return;
      }

      const items = Array.from(selectizeInput.querySelectorAll('div.item'));
      const hasItems = items.length > 0;

      console.log('Selected items:', items.map(item => item.textContent.trim()));

      let missingTagsMessages = [];
      let promptedNoTagList = false;

      for (let i = 0; i < pastoralDropdown.options.length; i++) {
        const option = pastoralDropdown.options[i];
        if (option.selected) {
          const selectedActionIndex = actions.findIndex(action => option.textContent.includes(action));
          if (selectedActionIndex !== -1) {
            console.log('Selected action:', actions[selectedActionIndex]);

            const requiredTags = tagLists[selectedActionIndex];
            if (!requiredTags || requiredTags.length === 0) {
              if (!promptedNoTagList) {
                missingTagsMessages.push(`<li>${messages[selectedActionIndex]}</li>`);
                promptedNoTagList = true;
              }
            } else {
              const hasRequiredTags = items.some(item => {
                const itemText = item.textContent.replace('×', '').trim();
                console.log('Checking item:', itemText);
                return requiredTags.includes(itemText);
              });

              console.log('Required tags:', requiredTags);
              console.log('Has required tags:', hasRequiredTags);

              if (!hasRequiredTags) {
                missingTagsMessages.push(`<li>${messages[selectedActionIndex]} Options: ${requiredTags.join(', ')}</li>`);
              }
            }
          }
        }
      }

      if (missingTagsMessages.length > 0) {
        event.preventDefault(); // Prevent form submission
        showModal(`<ul>${missingTagsMessages.join('')}</ul>`, [{
          text: 'OK',
          color: window.acceptColor,
          callback: () => {
            const inputElement = selectizeInput.querySelector('input');
            if (inputElement) {
              inputElement.focus();
            }
          }
        }]);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
})();
