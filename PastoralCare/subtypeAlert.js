// This file needs updating to have variables
const modalMessage = "<strong>Please Note:</strong> This <strong>WILL</strong> send a notification to the parents of this student.<br>Do you want to proceed?"; // Use HTML code to format your text.
const subtypeCheck = "PARENT";

// No changes below this line unless you know what you need changed.
//----------------------------------------------------------------------------------------------------------------------------------

const subtypeDropdown = document.getElementById("subtypeId");
subtypeDropdown.addEventListener("change", function() {
    var selectedText = subtypeDropdown.options[subtypeDropdown.selectedIndex].text;
    if (selectedText.toUpperCase().includes(subtypeCheck)) {
        showModal(modalMessage, [
            { text: 'Yes', color: window.acceptColor, },
            { text: 'No', color: window.rejectColor, callback: unselectDropdown }
        ]);
    }
});

function unselectDropdown() {
    var dropdown = document.getElementById('subtypeId');
    dropdown.selectedIndex = 0;
}
