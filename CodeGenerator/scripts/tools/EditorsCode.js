//This can be added to the Analytics Tracking Code field to make editing easier..
// Only run on the Site settings page
if (!location.pathname.endsWith('/adminv2/setting/Site')) {
    // If you want to use this editor on other pages too,
    // remove this guard or adjust the path check.
    // For now, just exit early.
} else {

    var TEXTAREA_SELECTOR = '#site_header_scripts-field';
    var FORMS_MARKER = '// ----- Forms/Form code(s) below -----';
    var FORM_PREFIX = '// Form:';
    var BUTTON_ID = 'open-script-editor-button';
    var MODAL_BUTTON_ID = 'open-modal-editor-button';
    var FUNCTIONS_BUTTON_ID = 'open-functions-editor-button';
    // Marker line that indicates the end of all form blocks in the generated script
    var FORMS_END_MARKER = '// ----- Forms End -----';

    function parseForms(sourceText) {
        var lines = sourceText.split('\n');
        var prefixEnd = -1;

        // Find the marker line
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf(FORMS_MARKER) !== -1) {
                prefixEnd = i;
                break;
            }
        }

        // If we can't find the marker, fall back to simple single-editor mode
        if (prefixEnd === -1) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        var prefixLines = lines.slice(0, prefixEnd + 1);
        var formBlocks = [];
        var idx = prefixEnd + 1;

        while (idx < lines.length) {
            var line = lines[idx];
            var trimmed = line.trim();

            if (trimmed.indexOf(FORM_PREFIX) === 0) {
                var headerLine = line;

                // Extract form name between "// Form:" and "--" (if present)
                var rest = trimmed.slice(FORM_PREFIX.length).trim(); // after "// Form:"
                var formName = rest.split('--')[0].trim() || 'Untitled';

                var j = idx + 1;
                while (j < lines.length) {
                    var currentLine = lines[j];
                    var t = currentLine.trim();

                    // Stop at next form header OR at the explicit Forms End marker
                    if (t.indexOf(FORM_PREFIX) === 0 || currentLine.indexOf(FORMS_END_MARKER) !== -1) {
                        break;
                    }
                    j++;
                }

                var codeLines = lines.slice(idx + 1, j);

                formBlocks.push({
                    formName: formName,
                    headerLine: headerLine,
                    codeLines: codeLines
                });

                idx = j;
            } else {
                // No more form blocks
                break;
            }
        }

        var suffixLines = lines.slice(idx);

        if (formBlocks.length === 0) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        return {
            mode: 'forms',
            prefixLines: prefixLines,
            suffixLines: suffixLines,
            formBlocks: formBlocks
        };
    }

    function buildScriptFromForms(struct, textareaValues) {
        var lines = [];
        var i;

        lines = lines.concat(struct.prefixLines);

        for (i = 0; i < struct.formBlocks.length; i++) {
            var block = struct.formBlocks[i];
            var value = textareaValues[i] || '';
            var valueLines = value.split('\n');

            lines.push(block.headerLine);
            if (valueLines.length && !(valueLines.length === 1 && valueLines[0] === '')) {
                lines = lines.concat(valueLines);
            }
            // If the block has an explicit end line (used by modal blocks), preserve it
            if (block.endLine) {
                lines.push(block.endLine);
            }
        }

        lines = lines.concat(struct.suffixLines);

        return lines.join('\n');
    }

    function createPopup(textarea) {
        var originalText = textarea.value;
        var struct = parseForms(originalText);

        // Overlay
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        // Popup container
        var popup = document.createElement('div');
        popup.style.background = '#fff';
        popup.style.padding = '16px';
        popup.style.borderRadius = '4px';
        popup.style.maxWidth = '800px';
        popup.style.width = '95%';
        popup.style.maxHeight = '90vh';
        popup.style.overflowY = 'auto';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

        var title = document.createElement('h3');
        title.textContent = 'Script Editor';
        popup.appendChild(title);

        var textareas = [];

        if (struct.mode === 'forms') {
            var info = document.createElement('p');
            info.textContent = 'Edit the code for each form below. Saving will update the Custom JavaScript field.';
            popup.appendChild(info);

            for (var i = 0; i < struct.formBlocks.length; i++) {
                var block = struct.formBlocks[i];

                var section = document.createElement('div');
                section.style.marginBottom = '16px';

                var label = document.createElement('label');
                label.textContent = 'Form: ' + block.formName;
                label.style.display = 'block';
                label.style.fontWeight = 'bold';
                label.style.marginBottom = '4px';

                var ta = document.createElement('textarea');
                ta.rows = 8;
                ta.style.width = '100%';
                ta.value = block.codeLines.join('\n');

                section.appendChild(label);
                section.appendChild(ta);
                popup.appendChild(section);

                textareas.push(ta);
            }
        } else {
            var infoSimple = document.createElement('p');
            infoSimple.textContent = 'Forms marker not found. Editing full script in a single text area.';
            popup.appendChild(infoSimple);

            var taFull = document.createElement('textarea');
            taFull.rows = 15;
            taFull.style.width = '100%';
            taFull.value = originalText;
            popup.appendChild(taFull);

            textareas.push(taFull);
        }

        var buttonsRow = document.createElement('div');
        buttonsRow.style.marginTop = '12px';
        buttonsRow.style.textAlign = 'right';

        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save & Close';

        saveBtn.addEventListener('click', function () {
            if (struct.mode === 'forms') {
                var values = [];
                for (var i = 0; i < textareas.length; i++) {
                    values.push(textareas[i].value);
                }
                var newScript = buildScriptFromForms(struct, values);
                textarea.value = newScript;
            } else {
                textarea.value = textareas[0].value;
            }

            document.body.removeChild(overlay);
        });

        buttonsRow.appendChild(saveBtn);
        popup.appendChild(buttonsRow);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function createModalPopup(textarea) {
        var originalText = textarea.value;
        var struct = parseModals(originalText);

        // Overlay
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        // Popup container
        var popup = document.createElement('div');
        popup.style.background = '#fff';
        popup.style.padding = '16px';
        popup.style.borderRadius = '4px';
        popup.style.maxWidth = '800px';
        popup.style.width = '95%';
        popup.style.maxHeight = '90vh';
        popup.style.overflowY = 'auto';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

        var title = document.createElement('h3');
        title.textContent = 'Modal Editor';
        popup.appendChild(title);

        var textareas = [];

        if (struct.mode === 'modals') {
            var info = document.createElement('p');
            info.textContent = 'Edit the code for each modal below. Saving will update the Custom JavaScript field.';
            popup.appendChild(info);

            for (var i = 0; i < struct.formBlocks.length; i++) {
                var block = struct.formBlocks[i];

                var section = document.createElement('div');
                section.style.marginBottom = '16px';

                var label = document.createElement('label');
                label.textContent = 'Modal: ' + block.formName;
                label.style.display = 'block';
                label.style.fontWeight = 'bold';
                label.style.marginBottom = '4px';

                var ta = document.createElement('textarea');
                ta.rows = 8;
                ta.style.width = '100%';
                ta.value = block.codeLines.join('\n');

                section.appendChild(label);
                section.appendChild(ta);
                popup.appendChild(section);

                textareas.push(ta);
            }
        } else {
            var infoSimple = document.createElement('p');
            infoSimple.textContent = 'Modal markers not found. Editing full script in a single text area.';
            popup.appendChild(infoSimple);

            var taFull = document.createElement('textarea');
            taFull.rows = 15;
            taFull.style.width = '100%';
            taFull.value = originalText;
            popup.appendChild(taFull);

            textareas.push(taFull);
        }

        var buttonsRow = document.createElement('div');
        buttonsRow.style.marginTop = '12px';
        buttonsRow.style.textAlign = 'right';

        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save & Close';

        saveBtn.addEventListener('click', function () {
            if (struct.mode === 'modals') {
                var values = [];
                for (var i = 0; i < textareas.length; i++) {
                    values.push(textareas[i].value);
                }
                var newScript = buildScriptFromModals(struct, values);
                textarea.value = newScript;
            } else {
                textarea.value = textareas[0].value;
            }

            document.body.removeChild(overlay);
        });

        buttonsRow.appendChild(saveBtn);
        popup.appendChild(buttonsRow);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function createFunctionsPopup(textarea) {
        var originalText = textarea.value;
        var struct = parseFunctions(originalText);

        // Overlay
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        // Popup container
        var popup = document.createElement('div');
        popup.style.background = '#fff';
        popup.style.padding = '16px';
        popup.style.borderRadius = '4px';
        popup.style.maxWidth = '800px';
        popup.style.width = '95%';
        popup.style.maxHeight = '90vh';
        popup.style.overflowY = 'auto';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

        var title = document.createElement('h3');
        title.textContent = 'Functions Editor';
        popup.appendChild(title);

        var textareas = [];

        if (struct.mode === 'functions') {
            var info = document.createElement('p');
            info.textContent = 'Edit each function block below. Saving will update the Custom JavaScript field.';
            popup.appendChild(info);

            for (var i = 0; i < struct.formBlocks.length; i++) {
                var block = struct.formBlocks[i];

                var section = document.createElement('div');
                section.style.marginBottom = '16px';

                var label = document.createElement('label');
                label.textContent = 'Function: ' + block.formName;
                label.style.display = 'block';
                label.style.fontWeight = 'bold';
                label.style.marginBottom = '4px';

                var ta = document.createElement('textarea');
                ta.rows = 12;
                ta.style.width = '100%';
                // Show the full block code (everything between header and end marker)
                ta.value = (Array.isArray(block.codeLines) && block.codeLines.length) ? block.codeLines.join('\n') : '';

                section.appendChild(label);
                section.appendChild(ta);
                popup.appendChild(section);

                textareas.push(ta);
            }
        } else {
            var infoSimple = document.createElement('p');
            infoSimple.textContent = 'Function block markers not found. Editing full script in a single text area.';
            popup.appendChild(infoSimple);

            var taFull = document.createElement('textarea');
            taFull.rows = 15;
            taFull.style.width = '100%';
            taFull.value = originalText;
            popup.appendChild(taFull);

            textareas.push(taFull);
        }

        var buttonsRow = document.createElement('div');
        buttonsRow.style.marginTop = '12px';
        buttonsRow.style.textAlign = 'right';

        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save & Close';

        saveBtn.addEventListener('click', function () {
            if (struct.mode === 'functions') {
                var values = [];
                for (var i = 0; i < textareas.length; i++) {
                    values.push(textareas[i].value);
                }
                var newScript = buildScriptFromFunctions(struct, values);
                textarea.value = newScript;
            } else {
                textarea.value = textareas[0].value;
            }

            document.body.removeChild(overlay);
        });

        buttonsRow.appendChild(saveBtn);
        popup.appendChild(buttonsRow);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function attachButton() {
        var textarea = document.querySelector(TEXTAREA_SELECTOR);
        if (!textarea) return;

        // Add Forms Editor button if not present
        if (!document.getElementById(BUTTON_ID)) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.id = BUTTON_ID;
            btn.textContent = 'Forms Editor';
            btn.style.marginTop = '8px';
            textarea.parentNode.appendChild(btn);
            btn.addEventListener('click', function () {
                createPopup(textarea);
            });
        }

        // Add Modal Editor button if not present
        if (!document.getElementById(MODAL_BUTTON_ID)) {
            var mbtn = document.createElement('button');
            mbtn.type = 'button';
            mbtn.id = MODAL_BUTTON_ID;
            mbtn.textContent = 'Modal Editor';
            mbtn.style.marginTop = '8px';
            mbtn.style.marginLeft = '8px';
            textarea.parentNode.appendChild(mbtn);
            mbtn.addEventListener('click', function () {
                createModalPopup(textarea);
            });
        }

        // Add Functions Editor button if not present
        if (!document.getElementById(FUNCTIONS_BUTTON_ID)) {
            var fbtn = document.createElement('button');
            fbtn.type = 'button';
            fbtn.id = FUNCTIONS_BUTTON_ID;
            fbtn.textContent = 'Functions Editor';
            fbtn.style.marginTop = '8px';
            fbtn.style.marginLeft = '8px';
            textarea.parentNode.appendChild(fbtn);
            fbtn.addEventListener('click', function () {
                createFunctionsPopup(textarea);
            });
        }
    }

    function init() {
        attachButton();

        // In case the textarea is loaded dynamically
        var observer = new MutationObserver(function () {
            attachButton();
        });
        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

    function parseModals(sourceText) {
        var lines = sourceText.split('\n');
        var firstStart = -1;

        // Find first modal start marker
        for (var i = 0; i < lines.length; i++) {
            var t = lines[i].trim();
            if (t.indexOf('// ----- Modals/') === 0) {
                firstStart = i;
                break;
            }
        }

        if (firstStart === -1) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        var prefixLines = lines.slice(0, firstStart);
        var modalBlocks = [];
        var idx = firstStart;

        while (idx < lines.length) {
            var line = lines[idx];
            var trimmed = line.trim();

            if (trimmed.indexOf('// ----- Modals/') === 0) {
                var headerLine = line;

                // Expected end marker: replace 'Modals/' with 'End Modals/' in the header
                var expectedEnd = headerLine.replace('Modals/', 'End Modals/');

                var j = idx + 1;
                while (j < lines.length && lines[j].indexOf(expectedEnd) === -1) {
                    j++;
                }

                // If we didn't find an explicit end marker, stop parsing further
                if (j >= lines.length) break;

                var codeLines = lines.slice(idx + 1, j);
                var endLine = lines[j];

                modalBlocks.push({
                    formName: trimmed.replace('// ----- Modals/', '').replace(/-----/g, '').trim(),
                    headerLine: headerLine,
                    codeLines: codeLines,
                    endLine: endLine,
                    startIdx: idx,
                    endIdx: j
                });

                idx = j + 1; // move past the end marker
            } else {
                // keep scanning until next possible modal start
                idx++;
            }
        }

        var suffixLines = lines.slice(idx);

        if (modalBlocks.length === 0) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        return {
            mode: 'modals',
            prefixLines: prefixLines,
            suffixLines: suffixLines,
            formBlocks: modalBlocks,
            lines: lines
        };
    }

    function buildScriptFromModals(struct, textareaValues) {
        // Work on a copy of the original lines so we preserve everything not part of modal blocks
        var lines = struct.lines.slice();

        // Replace blocks from last to first to keep indices valid
        for (var i = struct.formBlocks.length - 1; i >= 0; i--) {
            var block = struct.formBlocks[i];
            var start = block.startIdx;
            var end = block.endIdx;
            var value = textareaValues[i] || '';
            var valueLines = value.split('\n');

            var replacement = [];
            replacement.push(block.headerLine);
            if (valueLines.length && !(valueLines.length === 1 && valueLines[0] === '')) {
                replacement = replacement.concat(valueLines);
            }
            if (block.endLine) {
                replacement.push(block.endLine);
            }

            // remove original slice (start..end) and insert replacement
            Array.prototype.splice.apply(lines, [start, (end - start + 1)].concat(replacement));
        }

        return lines.join('\n');
    }

    function parseFunctions(sourceText) {
        var lines = sourceText.split('\n');
        var firstStart = -1;

        // Look for a "// Selected files:" comment block which may list filenames
        // to explicitly include. We support inline comma-separated lists or
        // subsequent comment lines following the header.
        var selectedFiles = null;
        for (var si = 0; si < lines.length; si++) {
            var st = lines[si].trim();
            var m = st.match(/^\/\/\s*Selected files:\s*(.*)$/i);
            if (m) {
                selectedFiles = [];
                var rest = m[1] || '';
                if (rest) {
                    rest.split(/,\s*/).forEach(function(it){ if (it) selectedFiles.push(it.trim()); });
                }
                // consume following comment lines as additional entries
                var k = si + 1;
                while (k < lines.length) {
                    var t = lines[k].trim();
                    if (!t.startsWith('//')) break;
                    var content = t.replace(/^\/\/\s*/, '').trim();
                    if (!content) break;
                    // allow list markers like '- filename'
                    content = content.replace(/^[-*\s]+/, '').trim();
                    if (content) selectedFiles.push(content);
                    k++;
                }
                // normalize entries to lowercase basenames for matching
                selectedFiles = selectedFiles.map(function(f){
                    var parts = f.split('/');
                    return parts[parts.length-1].toLowerCase();
                });
                break;
            }
        }

        // Find first function-style start marker like: // ----- filename.js -----
        for (var i = 0; i < lines.length; i++) {
            var t = lines[i].trim();
            if (t.indexOf('// -----') === 0 && t.indexOf('Modals/') === -1 && t.indexOf('Forms/') === -1) {
                firstStart = i;
                break;
            }
        }

        if (firstStart === -1) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        var prefixLines = lines.slice(0, firstStart);
        var funcBlocks = [];
        var idx = firstStart;

        while (idx < lines.length) {
            var line = lines[idx];
            var trimmed = line.trim();

            // header regex: // ---- name ---- (allow variable dashes/spaces)
            var headerMatch = trimmed.match(/^\/\/\s*-+\s*(.+?)\s*-+\s*$/);
            if (headerMatch) {
                var headerLine = line;
                var name = headerMatch[1] || ('block_' + idx);

                // Ignore dashed comment lines that are just markers like
                // "Function code below" which should not be treated as block headers.
                if (/function\s*code/i.test(name)) {
                    idx++;
                    continue;
                }

                // ignore Modals/Forms style blocks
                if (/Modals\//i.test(name) || /Forms\//i.test(name)) {
                    idx++;
                    continue;
                }

                function escapeForRegex(s) {
                    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                }
                var escName = escapeForRegex(name);
                // end marker regex: // --- End name ---  (tolerant)
                var endRegex = new RegExp('^\\s*//\\s*-+\\s*End\\s+' + escName + '(?:\\s*-+)?\\s*$', 'i');

                var j = idx + 1;
                while (j < lines.length) {
                    var ltrim = lines[j].trim();
                    // stop if we see an explicit end marker
                    if (endRegex.test(lines[j])) break;
                    // or if we see another header (treat as implicit end)
                    var nextHeader = ltrim.match(/^\/\/\s*-+\s*(.+?)\s*-+\s*$/);
                    if (nextHeader) {
                        // If the next dashed comment is a function-code marker, ignore it
                        var nhName = nextHeader[1] || '';
                        if (/function\s*code/i.test(nhName)) {
                            j++;
                            continue;
                        }
                        break;
                    }
                    j++;
                }

                // If we've reached EOF without finding any content, stop
                if (j > lines.length) break;

                // Treat everything between header and end marker as the block code
                var codeLines = lines.slice(idx + 1, j);
                var endLine = (j < lines.length) ? lines[j] : null;

                // If a Selected files list exists, only include blocks whose
                // basename matches one of the selected entries (case-insensitive).
                var includeBlock = true;
                if (Array.isArray(selectedFiles) && selectedFiles.length) {
                    var basename = (name.split('/').pop() || name).toLowerCase();
                    var basenameNoExt = basename.replace(/\.js$/i, '');
                    // Match if selectedFiles contains the basename with or without .js
                    includeBlock = selectedFiles.indexOf(basename) !== -1 || selectedFiles.indexOf(basenameNoExt) !== -1 || selectedFiles.indexOf(basenameNoExt + '.js') !== -1;
                }

                if (includeBlock) {
                    funcBlocks.push({
                        formName: name,
                        headerLine: headerLine,
                        codeLines: codeLines,
                        endLine: endLine,
                        startIdx: idx,
                        endIdx: j
                    });
                }

                idx = j + 1;
            } else {
                idx++;
            }
        }

        var suffixLines = lines.slice(idx);

        if (funcBlocks.length === 0) {
            return {
                mode: 'simple',
                originalText: sourceText
            };
        }

        return {
            mode: 'functions',
            prefixLines: prefixLines,
            suffixLines: suffixLines,
            formBlocks: funcBlocks,
            lines: lines
        };
    }

    function buildScriptFromFunctions(struct, textareaValues) {
        // Work on a copy of the original lines so we preserve everything not part of function blocks
        var lines = struct.lines.slice();

        // Replace blocks from last to first to keep indices valid
        for (var i = struct.formBlocks.length - 1; i >= 0; i--) {
            var block = struct.formBlocks[i];
            var start = block.startIdx;
            var end = block.endIdx;
            var value = textareaValues[i] || '';
            var valueLines = value.split('\n');

            var replacement = [];
            replacement.push(block.headerLine);
            if (valueLines.length && !(valueLines.length === 1 && valueLines[0] === '')) {
                replacement = replacement.concat(valueLines);
            }
            if (block.endLine) replacement.push(block.endLine);

            // remove original slice (start..end) and insert replacement
            Array.prototype.splice.apply(lines, [start, (end - start + 1)].concat(replacement));
        }

        return lines.join('\n');
    }
