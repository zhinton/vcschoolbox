// Generated loader.js

const schoolboxDomain = '';
const javascriptURLBase = '';
window.acceptColor = '';
window.rejectColor = '';

const modules = {
  "PastoralCare": true,
  "Emailing": false,
  "News": false
};


const forcedConfidential_type = "Student Protection";
// ---- scripts/submitNotification.js ----
// submitNotification.js
document.querySelector('.submit').addEventListener('click', (event) => {
    const dropdown = document.getElementById('subtypeId');
    if (!dropdown) {
        return;
    }

    const selectedOption = dropdown.options[dropdown.selectedIndex];
    if (!selectedOption) {
        return;
    }

    if (selectedOption.textContent.includes("Not Selected")) { // Check the text content
        event.preventDefault(); // Prevent form submission
        showModal("Please select a sub-type", [{
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


// ---- scripts/forcedConfidential.js ----
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

    if (selectedType.startsWith(confidentialTypes)) {
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

// Add event listener to typeId field to trigger update on change
document.getElementById('typeId').addEventListener('change', updatePageForConfidentialType);

// Initial call to set the page based on the initial typeId selection
updatePageForConfidentialType();

