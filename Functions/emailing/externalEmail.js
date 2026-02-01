functionSchema = {
    functionName: 'External Emails',
    description: 'Add your email domain(s) and optional message per domain. Prompts staff when emailing external users.',
    fields: [
        {
            name: 'mappings',
            label: 'Domain Mappings (Domain|Message)',
            type: 'rows',
            placeholders: ['Domain', 'Message'],
            options: [
                "example.edu|You are about to email an external user. If this communication needs to be recorded, consider using pastoral care or Outlook."
            ],
            tips: 'One mapping per line. Format: domain|message. You can add multiple domains and messages.',
            allowMultiple: true
        }
    ],
    options: []
};

// -------- Function code below --------

// Ensure mappings and common messages are available from schema
;(function(){
    const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
    // Build mappings from rows field options or top-level options if not provided
    let schemaPairs = [];
    if (Array.isArray(s.fields)) {
        const rowField = s.fields.find(f=>f.type==='rows' || f.name==='mappings');
        if (rowField && Array.isArray(rowField.options) && rowField.options.length) {
            schemaPairs = rowField.options.map(s => s.split('|').map(p => (p || '').trim()));
        }
    }
    if (!schemaPairs.length && Array.isArray(s.options) && s.options.length) {
        schemaPairs = s.options.map(s => s.split('|').map(p => (p || '').trim()));
    }
    // Expose mappings to window for backwards compatibility
    window.externalEmail_mappings = (typeof externalEmail_mappings !== 'undefined') ? externalEmail_mappings : schemaPairs;
    // Provide convenient single-domain/message fallbacks
    window.emailDomain = (window.externalEmail_mappings.length && window.externalEmail_mappings[0][0]) ? window.externalEmail_mappings[0][0] : '';
    window.modalMessage = (window.externalEmail_mappings.length && window.externalEmail_mappings[0][1]) ? window.externalEmail_mappings[0][1] : '';
    window.modalMessage2 = window.modalMessage || 'Please consider a Pastoral Care record or email directly from Outlook.';
})();

// The runtime behaviour for External Emails is appended below.
// Build mappings array from injected var, schema options, or field placeholders.
// Each mapping is [domain, message].
const mappings = (typeof externalEmail_mappings !== 'undefined')
    ? externalEmail_mappings
    : (function() {
            if (functionSchema && Array.isArray(functionSchema.fields)) {
                const rowField = functionSchema.fields.find(f => f.type === 'rows' || f.name === 'mappings');
                if (rowField && Array.isArray(rowField.options) && rowField.options.length) {
                    return rowField.options.map(s => s.split('|').map(p => (p || '').trim()));
                }
            }
            if (functionSchema && Array.isArray(functionSchema.options) && functionSchema.options.length) {
                return functionSchema.options.map(s => s.split('|').map(p => (p || '').trim()));
            }
            return [];
        })();

const defaultMessage = (mappings.length && mappings[0][1]) ? mappings[0][1] : 'Please consider a Pastoral Care record or email directly from Outlook.';

(function() {
    // Function to check for external emails
    const checkForExternalEmails = () => {
        const emailElements = document.querySelectorAll('.selectize-input.items.not-full.has-options.has-items .item');
        let hasExternalEmails = false;

        emailElements.forEach(element => {
            const email = element.textContent.trim();
            if (!email.includes(`@${emailDomain}`)) {
                hasExternalEmails = true;
            }
        });

        return hasExternalEmails;
    };

    
    // Function to show the secondary modal dialog
    const showSecondaryModal = (message) => {
        showModal(message, [
            {
                text: 'Ok',
                color: '#4CAF50',
                callback: () => {
                    console.log('User acknowledged the message.');
                }
            }
        ]);
    };

    // Function to test the email check and modal display
    window.testEmailCheck = () => {
        if (checkForExternalEmails()) {
            showModal(modalMessage, [
                {
                    text: 'Yes',
                    color: '#4CAF50',
                    callback: () => {
                        // Logic for handling "Yes" option
                        console.log('User chose to record the communication.');
                        showSecondaryModal(modalMessage2);
                    }
                },
                {
                    text: 'No',
                    color: '#F44336',
                    callback: () => {
                        // Logic for handling "No" option
                        console.log('User chose not to record the communication.');
                        mailSubmitButton.removeEventListener('click', handleClick);
                        mailSubmitButton.click(); // Trigger the click event again to send the email
                    }
                }
            ]);
        } else {
            console.log('No external emails found.');
        }
    };

    // Directly run the script without waiting for DOMContentLoaded
    const mailSubmitButton = document.getElementById('mailSubmit');

    const handleClick = (event) => {
        if (checkForExternalEmails()) {
            event.preventDefault(); // Prevent the form from submitting

            showModal(modalMessage, [
                {
                    text: 'Yes',
                    color: '#4CAF50',
                    callback: () => {
                        // Logic for handling "Yes" option
                        console.log('User chose to record the communication.');
                        showSecondaryModal(modalMessage2);
                    }
                },
                {
                    text: 'No',
                    color: '#F44336',
                    callback: () => {
                        // Logic for handling "No" option
                        console.log('User chose not to record the communication.');
                        mailSubmitButton.removeEventListener('click', handleClick);
                        mailSubmitButton.click(); // Trigger the click event again to send the email
                    }
                }
            ]);
        }
    };

    if (mailSubmitButton) {
        mailSubmitButton.addEventListener('click', handleClick);
    } else {
        console.error('Mail submit button not found.');
    }
})();