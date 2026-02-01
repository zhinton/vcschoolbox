functionSchema = {
	functionName: 'Parent News',
	description: 'Displays a warning notification when publishing news items to campus audiences, or other selected audiences, to ensure the user is aware of the audience being targeted.',
	fields: [
		{
			name: 'targetedAudiences',
			label: 'Targeted Audience',
			type: 'rows',
			placeholders: ['Audience','Message'],
			tips: 'Enter the the audience that is targeted in the news module'
		},
		{
			name: 'message',
			label: 'Message',
			type: 'multiline',
			placeholder: 'Please note the audiences selected may go to parents. Please check before sending'
		}
	],
	// example: Audience|Message (rows use | to separate columns)
	options: [
		"Parents|Please note the audiences selected may go to parents. Please check before sending",
		"Campus Staff|Please note the audiences selected may go to parents. Please check before sending"
	]
};

// -------- Function code below --------

// Inject runtime variables from schema
;(function(){
	const s = typeof functionSchema !== 'undefined' ? functionSchema : {};
	let pairs = [];
	if (Array.isArray(s.fields)) {
		const row = s.fields.find(f=>f.type==='rows' || f.name==='targetedAudiences');
		if (row && Array.isArray(row.options) && row.options.length) {
			pairs = row.options.map(r=>r.split('|').map(p=> (p||'').trim()));
		}
	}
	if (!pairs.length && Array.isArray(s.options) && s.options.length) {
		pairs = s.options.map(r=>r.split('|').map(p=> (p||'').trim()));
	}
	// List of audience titles to check against
	window.campuses = pairs.map(p=> p[0] || '').filter(Boolean);
	window.promptedCampuses = new Set();
	window.message1 = 'You are about to publish to';
	window.message2 = (Array.isArray(s.fields) && s.fields[1] && (s.fields[1].placeholder || s.fields[1].default)) ? (s.fields[1].placeholder || s.fields[1].default) : '';
})();

// The runtime behaviour for Parent News is appended below.
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
(function() {
	function attach() {
		const newsBtn = document.getElementById('news-submit');
		if (!newsBtn) return;
		newsBtn.addEventListener('mouseenter', function() {
			checkListItems(); // Call the function to check list items on hover
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach); else attach();
})();
