// Define the confidential type
const confidentialTypes = 'Student Protection';

// Function to update the page based on the typeId field
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
