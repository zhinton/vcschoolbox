//This code checks the Sub-Type field for the option "Not Selected". If this is still selected on save a notification will prompt

//Any possible user changable variables?

//Do not change code below unless you know what you need changed.
//-----------------------------------------------------------------------------------------------------------
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
