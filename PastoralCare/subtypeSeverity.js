// Auto select the severity for select subtypes listed below.

// Add the subtype and severity level pair, copy the entire line to add new pairs. Add comma for each pair except the last option.
const subtypeSeverity = [
    ['Submission - Late/Incomplete', 'Level 1'],
    ['Academic Integrity/AI', 'Level 2'],
    ['(PARENT) Academic Integrity/AI', 'Level 3']
];

// No changes to be made below here unless you know what you need.
//------------------------------------------------------------
// Function to auto-select severity based on subtype
function autoSelectSeverity() {
    const subtypeDropdown = document.getElementById('subtypeId');
    const severityDropdown = document.getElementById('severityId');

    if (!subtypeDropdown || !severityDropdown) {
        console.error('Subtype or severity dropdown not found.');
        return;
    }

    const selectedOption = subtypeDropdown.options[subtypeDropdown.selectedIndex];
    if (!selectedOption) {
        console.log('No subtype selected.');
        return;
    }

    const selectedSubtype = selectedOption.text;
    console.log('Selected subtype:', selectedSubtype);

    for (let i = 0; i < subtypeSeverity.length; i++) {
        const [subtype, severity] = subtypeSeverity[i];
        if (selectedSubtype.startsWith(subtype)) {
            console.log(`Matching subtype found: ${subtype}, setting severity to: ${severity}`);
            for (let j = 0; j < severityDropdown.options.length; j++) {
                if (severityDropdown.options[j].text.includes(severity)) {
                    severityDropdown.selectedIndex = j;
                    console.log(`Selected severity: ${severity}`);
                    break;
                }
            }
            break;
        }
    }
}

// Add event listener to subtype dropdown to trigger auto-select on change
document.getElementById('subtypeId').addEventListener('change', autoSelectSeverity);

// Initial call to set severity based on the initial subtype selection
autoSelectSeverity();
