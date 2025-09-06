(function() {
    // Email Checker Variables
    const emailDomain = 'victorycollege.com'; // Enter your email domain here
    const modalMessage = "It looks like you are emailing external users. Do you need a record of this communication?";
    const modalMessage2 = "Please consider a Pastoral Care record or email directly from outlook."; // Secondary modal message when selecting yes to the first message.

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
