// modal.js - Generic modal used across the generator
// Provides `showModal(message, buttons)` and `closeModal()`

// Get tab bar color from computed styles (guarded).
// Use a `var` and cache on `window` to avoid redeclaration if the script
// is loaded more than once which would throw for `const`.
var tabBarElement = (window.__cg_tabBarElement !== undefined) ? window.__cg_tabBarElement : document.querySelector('.tab-bar');
window.__cg_tabBarElement = tabBarElement;
var tabBarColor = tabBarElement ? getComputedStyle(tabBarElement).backgroundColor : null;

// If acceptColor or rejectColor is blank or falsy, use tabBarColor
window.acceptColor = (typeof acceptColor !== 'undefined' && acceptColor && acceptColor.trim()) ? acceptColor : tabBarColor;
window.rejectColor = (typeof rejectColor !== 'undefined' && rejectColor && rejectColor.trim()) ? rejectColor : tabBarColor;

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

window.showModal = showModal;
window.closeModal = closeModal;
