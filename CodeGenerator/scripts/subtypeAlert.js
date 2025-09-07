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
