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
