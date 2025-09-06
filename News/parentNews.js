// Define the campuses array
const campuses = ['Primary', 'Secondary'];

// Define the message parts
const message1 = "Please note this will include parents in"; // Message before the count or name of campuses
const message2 = "Did you want to change your audience?"; // Message after the count or name of campuses

// Variable to store already prompted campuses
let promptedCampuses = new Set();

// No changes to be made below here unless you know what you need.
//------------------------------------------------------------
// Function to check list items and store selected campuses in an array
function checkListItems() {
    // Get all list items
    var listItems = document.querySelectorAll('li');

    // Array to store selected campuses
    var selectedCampuses = [];

    // Iterate through each list item
    listItems.forEach(function(item) {
        // Get the title from the <h4> element
        var titleElement = item.querySelector('h4');
        var title = titleElement ? titleElement.getAttribute('title') : '';

        // Get the campus from the <p> element with class 'meta'
        var campusElements = item.querySelectorAll('p.meta');
        var campus = '';
        campusElements.forEach(function(campusElement) {
            if (campusElement.textContent.trim() === 'Campus') {
                campus = 'Campus';
            }
        });

        // Check if the title is in the campuses array and not already prompted
        if (campus && campuses.includes(title) && !promptedCampuses.has(title)) {
            selectedCampuses.push({ title, item });
        }
    });

    // Display modal if any new campuses are selected
    if (selectedCampuses.length > 0) {
        let message;
        if (selectedCampuses.length === 1) {
            message = `${message1} the ${selectedCampuses[0].title} campus. ${message2}`;
        } else {
            const campusNames = selectedCampuses.map(campus => campus.title).join(', ');
            message = `${message1} ${selectedCampuses.length} campuses (${campusNames}). ${message2}`;
        }
        showModal(message, [
            {
                text: "Yes",
                color: "green",
                callback: function() {
                    console.log(`User chose to change the audience for ${selectedCampuses.length} campuses`);
                    selectedCampuses.forEach(function(campus) {
                        // Simulate a click on the remove button
                        var removeButton = campus.item.querySelector('nav a.icon-close');
                        if (removeButton) {
                            removeButton.click();
                        }
                    });
                }
            },
            {
                text: "No",
                color: "red",
                callback: function() {
                    console.log(`User chose not to change the audience for ${selectedCampuses.length} campuses`);
                    // Add the campuses to the prompted set
                    selectedCampuses.forEach(function(campus) {
                        promptedCampuses.add(campus.title);
                    });
                }
            }
        ]);
    }
}

// Add event listener to the "Publish news" button for hover
document.getElementById('news-submit').addEventListener('mouseenter', function() {
    checkListItems(); // Call the function to check list items on hover
});
