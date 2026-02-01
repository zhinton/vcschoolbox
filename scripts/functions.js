// Combines relevant files into a single <script> block and previews in the combined output textarea
window.combineRelevantFiles = async function combineRelevantFiles() {
    // List your relevant files here (relative to the HTML file)
    const files = [
        'Functions/pastoralCare/submitNotification.js',
        'Modals/notificationModal.js',
        // Add more files as needed
    ];

    let combined = '<script>\n';
    for (const file of files) {
        try {
            const resp = await fetch(file);
            if (!resp.ok) throw new Error(`Failed to load ${file}`);
            const content = await resp.text();
            combined += `// ---- ${file} ----\n${content}\n\n`;
        } catch (err) {
            combined += `// ERROR: Could not load ${file}: ${err.message}\n\n`;
        }
    }

    // Wrap DOM-dependent behaviors so they don't run before elements exist
    document.addEventListener('DOMContentLoaded', function() {
        // ---- Functions/pastoralCare/submitNotification.js ----
        const submitBtn = document.querySelector('.submit');
        if (submitBtn) {
            submitBtn.addEventListener('click', (event) => {
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
        }

        // ---- Functions/pastoralCare/forcedConfidential.js ----
        function updatePageForConfidentialType() {
            const typeIdField = document.getElementById('typeId');
            const generalTabLink = document.querySelector('a[data-tab][href="#panel-general"]');
            const confidentialTabLink = document.querySelector('a[data-tab][href="#panel-confidential"]');

            if (!typeIdField || !generalTabLink || !confidentialTabLink) {
                console.error('Required elements not found.');
                return;
            }

            const selectedOption = typeIdField.options[typeIdField.selectedIndex];
            const selectedType = selectedOption ? selectedOption.text : '';
            console.log('Selected type:', selectedType);

            if (selectedType.startsWith(forcedConfidential_type)) {
                console.log('Confidential type detected.');
                generalTabLink.style.display = 'none';
                confidentialTabLink.setAttribute('aria-selected', 'true');
                confidentialTabLink.setAttribute('tabindex', '0');
                confidentialTabLink.click();
            } else {
                console.log('Non-confidential type detected.');
                generalTabLink.style.display = '';
                confidentialTabLink.removeAttribute('aria-selected');
                confidentialTabLink.setAttribute('tabindex', '-1');
            }
        }

        const typeField = document.getElementById('typeId');
        if (typeField) {
            typeField.addEventListener('change', updatePageForConfidentialType);
            updatePageForConfidentialType();
        }

        // ---- Functions/pastoralCare/hoverEffect.js ----
        const dropdownMenu = document.getElementById('severityId');
        if (dropdownMenu) {
            const hoverImage = document.createElement('img');
            hoverImage.id = 'hoverImage';
            hoverImage.src = `https://${schoolboxDomain}/send.php?id=${hoverEffect_imageID}&height=${hoverEffect_imageHeight}&width=${hoverEffect_imageWidth}`;
            hoverImage.alt = 'Hover Image';
            hoverImage.style.display = 'none';
            hoverImage.style.position = 'absolute';
            hoverImage.style.height = '35REM';
            hoverImage.style.zIndex = '1000';
            document.body.appendChild(hoverImage);
            dropdownMenu.addEventListener('mouseover', () => {
                const rect = dropdownMenu.getBoundingClientRect();
                hoverImage.style.top = `${rect.top + window.scrollY}px`;
                hoverImage.style.left = `${rect.right + window.scrollX}px`;
                hoverImage.style.transform = 'translateY(-50%)';
                hoverImage.style.display = 'block';
            });
            dropdownMenu.addEventListener('mouseout', () => {
                hoverImage.style.display = 'none';
            });
        }

        // Modal implementation moved to Modals/notificationModal.js to avoid duplication
    });

    // ...existing code...
}

// ...existing code...