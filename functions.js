<script>
// Generated Schoolbox Addons Loader Script

const schoolboxDomain = 'dev-vici.victorycollege.com';
const JavaScriptURL = 'https://raw.githubusercontent.com/zhinton/vcschoolbox/refs/heads/main/';
window.acceptColor = '';
window.rejectColor = '';

const modules = {
  "PastoralCare": true,
  "Emailing": false,
  "News": false
};

// Function to load a script from a URL if not already loaded
const loadScript = (url) => {
    if (!url) {
        console.error('No JavaScriptURL provided. Script not loaded.');
        return;
    }
    if (!document.querySelector(`script[src="${url}"]`)) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => console.log(`${url} loaded successfully.`);
        script.onerror = () => console.error(`Failed to load ${url}.`);
        document.head.appendChild(script);
    } else {
        console.log(`Script ${url} already loaded.`);
    }
};

// Function to check if the current URL matches the pattern
function isMatchingURL(url, targetURLPart) {
    return url.includes(targetURLPart);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Loader script loaded.');
    if (typeof modules === 'undefined') {
        console.error('Modules object is not defined!');
        return;
    }
    if (typeof JavaScriptURL === 'undefined') {
        console.error('JavaScriptURL is not defined!');
        return;
    }
    console.log('Enabled modules:', Object.keys(modules).filter(m => modules[m]));
    console.log('JavaScriptURL:', JavaScriptURL);

    // Pastoral Care Module
    if (modules.PastoralCare) {
        const pcURLPart = '/pastoral/student/';
        const endingPart = '/record/insert';
        if (isMatchingURL(window.location.href, pcURLPart) && window.location.href.endsWith(endingPart)) {
            console.log('PastoralCare module active and URL matched. Loading script...');
            loadScript(`${JavaScriptURL}functions.js`);
        } else {
            console.log('PastoralCare module enabled, but URL did not match.');
        }
    }
    // Emailing Module
    if (modules.Emailing) {
        const emailURLPart = '/mail/create';
        if (isMatchingURL(window.location.href, emailURLPart)) {
            console.log('Emailing module active and URL matched. Loading script...');
            loadScript(`${JavaScriptURL}functions.js`);
        } else {
            console.log('Emailing module enabled, but URL did not match.');
        }
    }
    // News Module
    if (modules.News) {
        const newsURLPart = '/news/';
        if (isMatchingURL(window.location.href, newsURLPart)) {
            console.log('News module active and URL matched. Loading script...');
            loadScript(`${JavaScriptURL}functions.js`);
        } else {
            console.log('News module enabled, but URL did not match.');
        }
    }
});
</script>
