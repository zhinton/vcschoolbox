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
