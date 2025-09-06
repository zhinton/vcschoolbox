// This code is used currently to check for a specific action and check for any tags.

// Arrays for actions, tags, and messages
const actions = [
    "Referral to Coordinator", // actionOne
    "Referral to Enrichment" // actionTwo
];

const tagLists = [
    ['Maths', 'Science', 'English', 'Technologies', 'Arts', 'PE'], // Tags for actionOne 
    ['NCCD', 'Spelling', 'assessment', 'other'] // Tags for actionTwo
];
const messages = [
    "Please tag the correct department for referring to the coordinator.<br>", // Message for actionOne
    "Please select the correct tags for learning enrichment.<br>" // Message for actionTwo
];

// Do not change code below unless you know what you need changed.
//-----------------------------------------------------------------------------------------------------------
document.querySelector('.submit').addEventListener('mouseover', (event) => {
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

    for (let i = 0; i < pastoralDropdown.options.length; i++) {
        const option = pastoralDropdown.options[i];
        if (option.selected) {
            const selectedActionIndex = actions.findIndex(action => option.textContent.includes(action));
            if (selectedActionIndex !== -1) {
                console.log('Selected action:', actions[selectedActionIndex]);

                const requiredTags = tagLists[selectedActionIndex];
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

    if (missingTagsMessages.length > 0) {
        event.preventDefault(); // Prevent form submission
        showModal(`<ul>${missingTagsMessages.join('')}</ul>`, [{
            text: 'OK',
            color: '#4CAF50',
            callback: () => {
                const inputElement = selectizeInput.querySelector('input');
                if (inputElement) {
                    inputElement.focus();
                }
            }
        }]);
    }
});
