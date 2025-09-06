console.log("Before loading functions.js");

function showModal(message, buttons) {
  alert(message); // Simple fallback for testing
  console.log("showModal called with:", message, buttons);
}

window.acceptColor = "#00ff00"; // For testing

// Dynamically load functions.js from your GitHub raw URL
function loadScript(url) {
  var script = document.createElement('script');
  script.src = url;
  script.onload = function() {
    console.log(url + " loaded successfully!");
  };
  script.onerror = function() {
    console.error("Failed to load " + url);
  };
  document.head.appendChild(script);
}

// Use the correct raw URL (not /refs/heads/)
loadScript("https://raw.githubusercontent.com/zhinton/vcschoolbox/main/functions.js");

console.log("After calling loadScript for functions.js");

