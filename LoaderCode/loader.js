// Define Global Variables
const schoolboxDomain = 'vici.victorycollege.com'; // Enter your Schoolbox domain here
const javascriptURLBase = 'https://creativedimensions.com.au/js/'; // JavaScripts location

// Define module flags. Set each module to true
const modules = {
    PastoralCare: true,
    Emailing: true,
    News: true//
    };

const scripts = {
    // Add pastoral care module filenames here in single quotes and comma separated
    PastoralCareFiles: [
        'hoverEffect.js',
        'subtypeAlert.js',
        'submitNotification.js',
        'actionChecker.js',
        'subtypeSeverity.js',
        'forcedConfidential.js'
    ],
    EmailingFiles: [ //Add Emailing filenames here
        'emailChecker.js'
    ],
    NewsFiles: [ // Add News module filenames here
        'parentNews.js'
    ]
};
// Define button colors with fallback to tabBarColor
const acceptColor = 'green' || tabBarColor;
const rejectColor = 'red' || tabBarColor;

//No changes below this line unless you know what you need changed.
//----------------------------------------------------------------------------------------------------------------------------------

// Function to load a script from a URL if not already loaded
const loadScript = (url) => {
    if (!document.querySelector(`script[src="${url}"]`)) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => console.log(`${url} loaded successfully.`);
        script.onerror = () => console.error(`Failed to load ${url}.`);
        document.head.appendChild(script);
    }
};

// Function to check if the current URL matches the pattern
function isMatchingURL(url, targetURLPart) {
    return url.includes(targetURLPart);
}

document.addEventListener('DOMContentLoaded', () => {
    // Load common scripts
    commonScripts.forEach(file => {
        loadScript(`${javascriptURLBase}${file}`);
    });

    // Pastoral Care Module Scripts
    if (modules.PastoralCare) {
        const pcURLPart = '/pastoral/student/';
        const endingPart = '/record/insert';
        if (isMatchingURL(window.location.href, pcURLPart) && window.location.href.endsWith(endingPart)) {
            scripts.PastoralCareFiles.forEach(file => {
                loadScript(`${javascriptURLBase}${file}`);
            });
        }
    }

    // Emailing Module Scripts
    if (modules.Emailing) {
        const emailURLPart = '/mail/create';
        if (isMatchingURL(window.location.href, emailURLPart)) {
            scripts.EmailingFiles.forEach(file => {
                loadScript(`${javascriptURLBase}${file}`);
            });
        }
    }

    // News Module Scripts
    if (modules.News) {
        const newsURLPart = '/news/';
        if (isMatchingURL(window.location.href, newsURLPart)) {
            scripts.NewsFiles.forEach(file => {
                loadScript(`${javascriptURLBase}${file}`);
            });
        }
    }
});


// Get tab bar color from computed styles
const tabBarElement = document.querySelector('.tab-bar');
const tabBarColor = tabBarElement ? getComputedStyle(tabBarElement).backgroundColor : null;

// If acceptColor or rejectColor is blank or falsy, use tabBarColor
window.acceptColor = acceptColor && acceptColor.trim() ? acceptColor : tabBarColor;
window.rejectColor = rejectColor && rejectColor.trim() ? rejectColor : tabBarColor;

// This is the notification popup code used by other scripts
// Function to create and show a modal dialog with customizable buttons
function showModal(message, buttons) {
    var modal = document.createElement('div');
    modal.id = 'myModal';
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';

    var modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '300px';
    modalContent.style.textAlign = 'center';
    modalContent.style.boxSizing = 'border-box';

    var modalText = document.createElement('p');
    modalText.innerHTML = message;

    var modalButtons = document.createElement('div');
    modalButtons.style.display = 'flex';
    modalButtons.style.justifyContent = 'space-around';
    modalButtons.style.marginTop = '20px';

    buttons.forEach(button => {
        var btn = document.createElement('button');
        btn.textContent = button.text;
        btn.style.backgroundColor = button.color;
        btn.style.color = 'white'; // Force white text
        btn.style.padding = '10px 20px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            closeModal();
            if (button.callback) button.callback();
        });
        modalButtons.appendChild(btn);
    });

    modalContent.appendChild(modalText);
    modalContent.appendChild(modalButtons);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add media query for smaller screens
    var style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 600px) {
            #myModal div {
                width: 90%;
                margin: 30% auto;
            }
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    var modal = document.getElementById('myModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    }
}

// ...existing code...

window.acceptColor = acceptColor;
window.rejectColor = rejectColor;

// ...existing code...