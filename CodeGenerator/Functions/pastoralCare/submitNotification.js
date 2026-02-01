// Pastoral Care - Submit Notification schema
functionSchema = {
  functionName: 'Submit Notification',
  description: "Prompts users to select a subtype if 'Not Selected' is chosen. You will need to add the Subtype 'Not Selected' to your subtype lists for this to work.",
  fields: [
    {
      // subtype is fixed to 'Not Selected' and should not be shown in the UI
      name: 'subtype',
      label: 'Subtype (fixed)',
      type: 'input',
      placeholder: 'Not Selected',
      default: 'Not Selected',
      tips: "Subtype is fixed to 'Not Selected' and cannot be changed.",
      allowMultiple: false,
      hidden: true
    },
    {
      name: 'message',
      label: 'Message',
      type: 'multiline',
      placeholder: 'Please select a subtype before submitting.',
      default: 'Please select a subtype before submitting.',
      allowMultiple: false
    }
  ],
  options: [
    'Not Selected|Please select a subtype before submitting.'
  ]
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
    const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
    const msgField = Array.isArray(s.fields) ? s.fields.find(f=>f.name==='message') : null;
    window.submitNotification_message = (msgField && (msgField.default || msgField.placeholder)) || 'Please select a subtype before submitting.';
  })();

  // The runtime behaviour for Submit Notification is appended below.
  (function() {
    function attach() {
      const submitBtn = document.querySelector('.submit');
      if (!submitBtn) return;
      submitBtn.addEventListener('click', (event) => {
        const dropdown = document.getElementById('subtypeId');
        if (!dropdown) {
          return;
        }

        const selectedOption = dropdown.options[dropdown.selectedIndex];
        if (!selectedOption) {
          return;
        }

        if (selectedOption.textContent.includes('Not Selected')) {
          event.preventDefault(); // Prevent form submission
          showModal('Please select a sub-type', [{
            text: 'OK',
            color: window.acceptColor,
            callback: () => {
              dropdown.focus();
            }
          }]);
        } else {
          console.log('Condition not met: No action taken');
        }
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
  })();
