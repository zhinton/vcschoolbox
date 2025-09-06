const forcedConfidential_type = "Student Protection";

// ---- scripts/submitNotification.js ----
document.querySelector('.submit')?.addEventListener('click', (event) => {
    const dropdown = document.getElementById('subtypeId');
    if (!dropdown) return;

    const selectedOption = dropdown.options[dropdown.selectedIndex];
    if (!selectedOption) return;

    if (selectedOption.textContent.includes("Not Selected")) {
        event.preventDefault();
        showModal("Please select a sub-type", [{
            text: 'OK',
            color: window.acceptColor,
            callback: () => { dropdown.focus(); }
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

    if (selectedType.startsWith(forcedConfidential_type)) {
        console.log('Confidential type detected.');
        generalTabLink.style.display = 'none';
        confidentialTabLink.setAttribute('aria-selected', 'true');
        confidentialTabLink.setAttribute('tabindex', '0');
        confidentialTabLink.click();
    } else {
        console.log('Non-confidential type detected.');
        generalTabLink.style.display = '';
        confidentialTabLink.removeAttribute('aria-selected');
        confidentialTabLink.setAttribute('tabindex', '-1');
    }
}

document.getElementById('typeId')?.addEventListener('change', updatePageForConfidentialType);
updatePageForConfidentialType();
