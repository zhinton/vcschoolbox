// Helper to normalize script URLs for reliable comparison
const getNormalizedScriptUrl = (url) => {
    try {
        return new URL(url, document.baseURI).href;
    } catch (e) {
        // If URL construction fails, fall back to the original string
        return url;
    }
};

// Track loaded script URLs (normalized) to avoid duplicates
const loadedScripts = new Set();

// Function to load a script from a URL if not already loaded
const loadScript = (url) => {
    if (!url) {
        console.error('No JavaScriptURL provided. Script not loaded.');
        return;
    }

    const normalizedUrl = getNormalizedScriptUrl(url);

    // Check if this script URL has already been recorded as loaded
    if (loadedScripts.has(normalizedUrl)) {
        console.log(`Script ${url} already loaded.`);
        return;
    }

    // Also check existing script tags in the document for an equivalent URL
    const existingScripts = document.getElementsByTagName('script');
    for (let i = 0; i < existingScripts.length; i++) {
        const existingSrc = existingScripts[i].getAttribute('src');
        if (!existingSrc) {
            continue;
        }
        const normalizedExistingSrc = getNormalizedScriptUrl(existingSrc);
        if (normalizedExistingSrc === normalizedUrl) {
            loadedScripts.add(normalizedUrl);
            console.log(`Script ${url} already loaded.`);
            return;
        }
    }

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => console.log(`${url} loaded successfully.`);
    script.onerror = () => console.error(`Failed to load ${url}.`);

    // Record the script as loaded as soon as we start loading it
    loadedScripts.add(normalizedUrl);

    document.head.appendChild(script);
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