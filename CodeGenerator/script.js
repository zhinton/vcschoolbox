import { PastoralCare, Emailing, New } from './ModuleFunctions.js';

// Only one definition!
function toggleSection(section) {
  const sectionId = section + 'Section';
  const checkbox = document.getElementById(section);
  const sectionElem = document.getElementById(sectionId);
  if (checkbox && sectionElem) {
    sectionElem.style.display = checkbox.checked ? 'block' : 'none';
  }
}
window.toggleSection = toggleSection; // Make it available globally for inline HTML handlers

document.addEventListener('DOMContentLoaded', () => {
  // Tab switching logic: show/hide output areas and update active tab
  const splitTabEl = document.getElementById('splitTab');
  const combinedTabEl = document.getElementById('combinedTab');
  if (splitTabEl && combinedTabEl) {
    splitTabEl.addEventListener('click', () => {
      setOutputMode('split');
    });
    combinedTabEl.addEventListener('click', () => {
      setOutputMode('combined');
    });
  }
// Tab switching function: only show relevant output area and update tab styling
function setOutputMode(mode) {
  const splitTabEl = document.getElementById('splitTab');
  const combinedTabEl = document.getElementById('combinedTab');
  if (splitTabEl && combinedTabEl) {
    splitTabEl.classList.remove('active');
    combinedTabEl.classList.remove('active');
    if (mode === 'split') {
      splitTabEl.classList.add('active');
    } else {
      combinedTabEl.classList.add('active');
    }
  }
  const splitArea = document.getElementById('splitOutputArea');
  const combinedArea = document.getElementById('combinedOutputArea');
  if (splitArea) splitArea.style.display = mode === 'split' ? '' : 'none';
  if (combinedArea) combinedArea.style.display = mode === 'combined' ? '' : 'none';
}
  ['PastoralCare', 'Emailing', 'News'].forEach(section => {
    const checkbox = document.getElementById(section);
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        toggleSection(section);
        if (typeof updateSwitchLabel === 'function') {
          updateSwitchLabel(section);
        }
      });
      // Set initial state
      toggleSection(section);
      if (typeof updateSwitchLabel === 'function') {
        updateSwitchLabel(section);
      }
    }
  });

  const generateBtn = document.querySelector('button.generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (typeof window.combineRelevantFiles === 'function') {
        window.combineRelevantFiles();
      }
    });
  }
  document.querySelector('button[onclick="copyCode()"]').addEventListener('click', copyCode);
  document.querySelector('button[onclick="downloadCode()"]').addEventListener('click', downloadCode);

  // Tab switching logic
  const splitTab = document.getElementById('splitTab');
  const combinedTab = document.getElementById('combinedTab');
  splitTab.addEventListener('click', () => setOutputMode('split'));
  combinedTab.addEventListener('click', () => setOutputMode('combined'));
});

let outputMode = 'split';
function setOutputMode(mode) {
  outputMode = mode;
  const splitTab = document.getElementById('splitTab');
  const combinedTab = document.getElementById('combinedTab');
  splitTab.classList.toggle('active', mode === 'split');
  combinedTab.classList.toggle('active', mode === 'combined');
  // Show/hide relevant UI sections
  document.getElementById('splitOutputArea').style.display = mode === 'split' ? '' : 'none';
  document.getElementById('combinedOutputArea').style.display = mode === 'combined' ? '' : 'none';
  // JS URL field logic
  const jsUrlInput = document.getElementById('JavaScriptURL');
  if (jsUrlInput) {
    jsUrlInput.disabled = mode === 'combined';
    if (mode === 'combined') jsUrlInput.value = '';
  }
  // Restore All button logic
  const restoreAllBtn = document.getElementById('restoreAllBtn');
  if (restoreAllBtn) restoreAllBtn.style.display = mode === 'split' ? '' : 'none';
  // No code generation on tab switch
}

async function generateCode() {
  // Collect static fields
  const schoolboxDomain = window.location.origin;
  const JavaScriptURL = document.getElementById('JavaScriptURL').value;
  const acceptColor = document.getElementById('acceptColor').value;
  const rejectColor = document.getElementById('rejectColor').value;

  // Collect selected modules
  const modules = {
    PastoralCare: document.getElementById('PastoralCare')?.checked || false,
    Emailing: document.getElementById('Emailing')?.checked || false,
    News: document.getElementById('News')?.checked || false
  };

  // --- Loader.js generation ---
  let loaderCode = `<script>
// Generated Schoolbox Addons Loader Script

const schoolboxDomain = window.location.origin;
const JavaScriptURL = '${JavaScriptURL}';
window.acceptColor = '${acceptColor}';
window.rejectColor = '${rejectColor}';

const modules = ${JSON.stringify(modules, null, 2)};

`;

  // Fetch and append the loader logic
  try {
    const response = await fetch('scripts/loader.js');
    if (!response.ok) throw new Error('Failed to load loader.js');
    const loaderContent = await response.text();
    loaderCode += loaderContent;
  } catch (err) {
    loaderCode += `// ERROR: Could not load loader.js: ${err.message}\n`;
  }

  loaderCode += `\n</script>`;

  // --- Functions.js generation ---
  // Gather selected functions for each module
  function getCheckedFunctions(className) {
    return Array.from(document.querySelectorAll(`.${className}`))
      .filter(cb => cb.checked)
      .map(cb => cb.value);
  }
  const selectedPastoralCare = getCheckedFunctions('pcFunction');
  const selectedEmailing = getCheckedFunctions('emailFunction');
  const selectedNews = getCheckedFunctions('newsFunction');

  // Collect all entered options for selected functions
  function collectOptions(selected, section, className) {
    const options = {};
    selected.forEach(fn => {
      // Find the function definition
      const funcDef = (section.find(f => f.fileName.replace('.js', '') === fn));
      if (funcDef && funcDef.options && funcDef.options.length > 0) {
        options[fn] = {};
        funcDef.options.forEach(opt => {
          const input = document.getElementById(`${className}-${fn}-${opt.key}`);
          if (input) {
            options[fn][opt.key] = input.value;
          }
        });
      }
    });
    return options;
  }

  const pcOptions = collectOptions(selectedPastoralCare, PastoralCare, 'pcFunction');
  const emailOptions = collectOptions(selectedEmailing, Emailing, 'emailFunction');
  const newsOptions = collectOptions(selectedNews, New, 'newsFunction');

  // Combine all options into one object
  const allOptions = {
    ...pcOptions,
    ...emailOptions,
    ...newsOptions
  };

  // --- Special handling for subtypeSeverity.js dynamic pairs ---
  let subtypeSeverityCode = '';
  if (selectedPastoralCare.includes('subtypeSeverity')) {
    const entry = document.getElementById('pcFunction-subtypeSeverity')?.closest('.function-entry');
    if (entry) {
      const pairs = [];
      const seen = new Set();
      entry.querySelectorAll('div').forEach(row => {
        const subtypeInput = row.querySelector('input[placeholder="Subtype"]');
        const categoryInput = row.querySelector('input[placeholder="Category"]');
        if (subtypeInput && categoryInput) {
          const subtype = subtypeInput.value.trim();
          const category = categoryInput.value.trim();
          if (subtype && category) {
            const key = `${subtype}|||${category}`;
            if (!seen.has(key)) {
              pairs.push([subtype, category]);
              seen.add(key);
            }
          }
        }
      });
      subtypeSeverityCode = `const subtypeSeverity = ${JSON.stringify(pairs, null, 4)};\n\n`;
    }
  }

  // --- Special handling for subtypeAlert.js dynamic pairs ---
  let subtypeAlertCode = '';
  if (selectedPastoralCare.includes('subtypeAlert')) {
    const entry = document.getElementById('pcFunction-subtypeAlert')?.closest('.function-entry');
    if (entry) {
      const pairs = [];
      const seen = new Set();
      entry.querySelectorAll('div').forEach(row => {
        const subtypeInput = row.querySelector('input[placeholder="Subtype"]');
        const messageInput = row.querySelector('input[placeholder="Message"]');
        if (subtypeInput && messageInput) {
          const subtype = subtypeInput.value.trim();
          const message = messageInput.value.trim();
          if (subtype && message) {
            const key = `${subtype}|||${message}`;
            if (!seen.has(key)) {
              pairs.push([subtype, message]);
              seen.add(key);
            }
          }
        }
      });
      subtypeAlertCode = `const subtypeAlertPairs = ${JSON.stringify(pairs, null, 4)};\n\n`;
    }
  }

  // --- Special handling for actionChecker.js dynamic rows ---
  let actionCheckerCode = '';
  if (selectedPastoralCare.includes('actionChecker')) {
    const entry = document.getElementById('pcFunction-actionChecker')?.closest('.function-entry');
    if (entry) {
      const rows = [];
      const seen = new Set();
      entry.querySelectorAll('div').forEach(row => {
        const actionInput = row.querySelector('input[placeholder="Action"]');
        const tagListInput = row.querySelector('input[placeholder="Tag List (comma separated)"]');
        const messageInput = row.querySelector('input[placeholder="Message"]');
        if (actionInput && tagListInput && messageInput) {
          const action = actionInput.value.trim();
          const tagList = tagListInput.value.trim();
          const message = messageInput.value.trim();
          if (action && tagList && message) {
            const key = `${action}|||${tagList}|||${message}`;
            if (!seen.has(key)) {
              rows.push([action, tagList, message]);
              seen.add(key);
            }
          }
        }
      });
      actionCheckerCode = `const actionCheckerRows = ${JSON.stringify(rows, null, 4)};\n\n`;
    }
  }

  // Build variable declarations for all options
  // Place special codes at the very top of functionsCode
  let functionsCode = subtypeSeverityCode + subtypeAlertCode + actionCheckerCode;
  Object.entries(allOptions).forEach(([fn, opts]) => {
    Object.entries(opts).forEach(([key, value]) => {
      // Variable name: functionname_key (e.g. forcedConfidential_type)
      functionsCode += `const ${fn}_${key} = ${JSON.stringify(value)};\n`;
    });
  });

  // List of all selected function script files
  const selectedFiles = [
    ...selectedPastoralCare.map(fn => `scripts/${fn}.js`),
    ...selectedEmailing.map(fn => `scripts/${fn}.js`),
    ...selectedNews.map(fn => `scripts/${fn}.js`)
  ];

  // Fetch and append the contents of each selected JS file
  for (const file of selectedFiles) {
    try {
      const resp = await fetch(file);
      if (!resp.ok) throw new Error(`Failed to load ${file}`);
      const content = await resp.text();
      functionsCode += `\n// ---- ${file} ----\n${content}\n`;
    } catch (err) {
      functionsCode += `\n// ERROR: Could not load ${file}: ${err.message}\n`;
    }
  }

  // --- Append modal.js at the end ---
  try {
    const modalResp = await fetch('scripts/modal.js');
    if (!modalResp.ok) throw new Error('Failed to load scripts/modal.js');
    const modalContent = await modalResp.text();
    functionsCode += `\n// ---- scripts/modal.js ----\n${modalContent}\n`;
  } catch (err) {
    functionsCode += `\n// ERROR: Could not load scripts/modal.js: ${err.message}\n`;
  }

  // Show the generated code in the output textareas
  document.getElementById('output').value = loaderCode;
  document.getElementById('functionsOutput').value = functionsCode;
  // Do NOT update the combined output area automatically
}

// Add these functions for the new box:
function copyFunctionsCode() {
  const output = document.getElementById('functionsOutput');
  output.select();
  document.execCommand('copy');
  alert('Functions code copied to clipboard!');
}

function downloadFunctionsCode() {
  const blob = new Blob([document.getElementById('functionsOutput').value], { type: 'text/javascript' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'functions.js';
  link.click();
}

function copyCode() {
  const output = document.getElementById('output');
  output.select();
  document.execCommand('copy');
  alert('Code copied to clipboard!');
}

function downloadCode() {
  const blob = new Blob([document.getElementById('output').value], { type: 'text/javascript' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'loader.js';
  link.click();
}

function populateFunctionSections() {
  // Helper to create checkboxes
  function createCheckbox(item, className) {
    const div = document.createElement('div');
    div.className = 'function-entry';

  // Header: Checkbox + Name + Description (aligned)
  const header = document.createElement('div');
  header.className = 'function-header';
  header.style.display = 'flex';
  header.style.flexDirection = 'row';
  header.style.alignItems = 'center';
  header.style.gap = '12px';

  const checkboxId = `${className}-${item.fileName.replace('.js', '')}`;
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = className;
  checkbox.value = item.fileName.replace('.js', '');
  checkbox.checked = false; // <-- Default to unchecked
  checkbox.id = checkboxId;

  const label = document.createElement('label');
  label.setAttribute('for', checkboxId);
  label.textContent = item.name;
  label.style.minWidth = '180px';
  label.style.display = 'inline-block';

  const desc = document.createElement('span');
  desc.className = 'function-desc';
  desc.textContent = item.description;
  desc.style.marginLeft = '0';
  desc.style.display = 'inline-block';
  desc.style.minWidth = '320px';
  desc.style.textAlign = 'left';

  header.appendChild(checkbox);
  header.appendChild(label);
  header.appendChild(desc);

  div.appendChild(header);

    // Options for Hover Effect (in a row)
    if (item.fileName === "hoverEffect.js" && item.options && item.options.length > 0) {
      // Options title
  // Removed options-title div

      // Options row
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'hover-options-row';
      optionsDiv.style.display = 'none';

      item.options.forEach(opt => {
        const optLabel = document.createElement('label');
        optLabel.textContent = `${opt.label}: `;
        optLabel.title = opt.description;

        const optInput = document.createElement('input');
        optInput.type = 'text';
        optInput.id = `${checkboxId}-${opt.key}`;
        optInput.className = `hoverEffectOption ${opt.key}`;
        optInput.style.width = '70px';

        optLabel.appendChild(optInput);

        // Add a help '?' if help_text exists
        if (opt.help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = opt.help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          optLabel.appendChild(help);
        }

        optionsDiv.appendChild(optLabel);
      });

      // Show/hide options when checkbox is toggled
      checkbox.addEventListener('change', () => {
        optionsDiv.style.display = checkbox.checked ? 'flex' : 'none';
      });

  // Removed options-title div
      div.appendChild(optionsDiv);
    }

    // Options for Subtype Severity (dynamic pairs)
    else if (item.fileName === "subtypeSeverity.js" && item.options && item.options.length > 0) {
      // Options title
  // Removed options-title div

      // Container for all pairs
      const pairsDiv = document.createElement('div');
      pairsDiv.className = 'hover-options-row';
      pairsDiv.style.flexDirection = 'column';
      pairsDiv.style.gap = '8px';
      pairsDiv.style.display = 'none';


      // Generic function to add a row to a container
      function updateAddBtnVisibility(container) {
        const rows = container.querySelectorAll('div');
        rows.forEach((r, idx) => {
          const btn = r.querySelector('button.row-action-btn:last-of-type');
          if (btn) btn.style.display = idx === rows.length - 1 ? 'inline-block' : 'none';
        });
      }

      function addDynamicRow(container, fields) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.style.width = '100%';
        fields.forEach((field, i) => {
          const input = document.createElement('input');
          input.type = 'text';
          input.placeholder = field.placeholder;
          input.value = field.value || '';
          input.style.width = field.width;
          input.style.display = 'inline-block';
          input.style.verticalAlign = 'middle';
          row.appendChild(input);
          // Add help icon for Subtype and Category if help_text exists in item.options[0]
          if (item.options && item.options[0] && item.options[0].help_text) {
            const help = document.createElement('span');
            help.textContent = ' ?';
            help.title = item.options[0].help_text;
            help.style.color = '#0074D9';
            help.style.fontWeight = 'bold';
            help.style.cursor = 'help';
            row.appendChild(help);
          }
        });
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '–';
        removeBtn.title = 'Remove this row';
        removeBtn.className = 'row-action-btn';
        removeBtn.onclick = () => {
          container.removeChild(row);
          updateAddBtnVisibility(container);
        };
        row.appendChild(removeBtn);
        // Add (+) button to the right of removeBtn
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.textContent = '+';
        addBtn.title = 'Add another row';
        addBtn.className = 'row-action-btn';
        addBtn.onclick = () => {
          addDynamicRow(container, fields.map(f => ({ ...f, value: '' })));
          updateAddBtnVisibility(container);
        };
        row.appendChild(addBtn);
        container.appendChild(row);
        updateAddBtnVisibility(container);
      }

      // Helper to clear and fill container with data
      function fillDynamicRows(container, data, fieldDefs) {
        container.innerHTML = '';
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(item => {
            const fields = fieldDefs.map((def, i) => ({ ...def, value: item[i] }));
            addDynamicRow(container, fields);
          });
        } else {
          // Add one empty row by default
          addDynamicRow(container, fieldDefs);
        }
      }

      // Fill initial rows for dynamic pairs/rows
      if (item.fileName === "subtypeSeverity.js") {
        fillDynamicRows(pairsDiv, null, [
          { placeholder: 'Subtype', width: '180px' },
          { placeholder: 'Category', width: '120px' }
        ]);
      }
      else if (item.fileName === "subtypeAlert.js") {
        fillDynamicRows(pairsDiv, null, [
          { placeholder: 'Subtype', width: '180px' },
          { placeholder: 'Message', width: '260px' }
        ]);
      }
      else if (item.fileName === "actionChecker.js") {
        fillDynamicRows(pairsDiv, null, [
          { placeholder: 'Action', width: '120px' },
          { placeholder: 'Tag List (comma separated)', width: '180px' },
          { placeholder: 'Message', width: '220px' }
        ]);
      }

      // Container for pairs only (no addBtn)
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '4px';
      container.appendChild(pairsDiv);

      // Show/hide on checkbox toggle
      checkbox.addEventListener('change', () => {
        pairsDiv.style.display = checkbox.checked ? 'flex' : 'none';
      });

  // Removed options-title div
      div.appendChild(container);
    }

    // Options for Subtype Alert (dynamic pairs)
    else if (item.fileName === "subtypeAlert.js" && item.options && item.options.length > 0) {
      // Options title
  // Removed options-title div

      // Container for all pairs
      const pairsDiv = document.createElement('div');
      pairsDiv.className = 'hover-options-row';
      pairsDiv.style.flexDirection = 'column';
      pairsDiv.style.gap = '8px';
      pairsDiv.style.display = 'none';

      // Function to add a new pair row
      function addPairRow(subtype = '', message = '') {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';

        const subtypeInput = document.createElement('input');
        subtypeInput.type = 'text';
        subtypeInput.placeholder = 'Subtype';
        subtypeInput.value = subtype;
        subtypeInput.style.width = '180px';
        row.appendChild(subtypeInput);
        // Add help icon if help_text exists for subtype
        if (item.options && item.options[0] && item.options[0].help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = item.options[0].help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          row.appendChild(help);
        }

        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Message';
        messageInput.value = message;
        messageInput.style.width = '260px';
        row.appendChild(messageInput);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '–';
  removeBtn.title = 'Remove this pair';
  removeBtn.className = 'row-action-btn';
  removeBtn.onclick = () => pairsDiv.removeChild(row);
  row.appendChild(removeBtn);
  // Add (+) button to the right of removeBtn
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+';
  addBtn.title = 'Add another pair';
  addBtn.className = 'row-action-btn';
  addBtn.onclick = () => {
    addPairRow();
    updateAddBtnVisibility();
  };
  row.appendChild(addBtn);
  pairsDiv.appendChild(row);

  updateAddBtnVisibility();

  function updateAddBtnVisibility() {
    const rows = pairsDiv.querySelectorAll('div');
    rows.forEach((r, idx) => {
      const btn = r.querySelector('button.row-action-btn:last-of-type');
      if (btn) btn.style.display = idx === rows.length - 1 ? 'inline-block' : 'none';
    });
  }
      }

      // Add initial row
      addPairRow();

  // Container for pairs only (no addBtn)
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '4px';
  container.appendChild(pairsDiv);

      // Show/hide on checkbox toggle
      checkbox.addEventListener('change', () => {
        container.style.display = checkbox.checked ? 'flex' : 'none';
        pairsDiv.style.display = checkbox.checked ? 'flex' : 'none';
      });

      // Hide container by default
  container.style.display = 'none';
  // Removed options-title div
      div.appendChild(container);
    }

    // Options for Action Checker (dynamic rows)
    else if (item.fileName === "actionChecker.js" && item.options && item.options.length > 0) {
      // Options title
  // Removed options-title div

      // Container for all rows
      const rowsDiv = document.createElement('div');
      rowsDiv.className = 'hover-options-row';
      rowsDiv.style.flexDirection = 'column';
      rowsDiv.style.gap = '8px';
      rowsDiv.style.display = 'none';

      // Function to add a new row
      function addRow(action = '', tagList = '', message = '') {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';

        // Action input
        const actionInput = document.createElement('input');
        actionInput.type = 'text';
        actionInput.placeholder = 'Action';
        actionInput.value = action;
        actionInput.style.width = '120px';
        row.appendChild(actionInput);
        if (item.options && item.options[0] && item.options[0].help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = item.options[0].help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          row.appendChild(help);
        }

        // Tag List input
        const tagListInput = document.createElement('input');
        tagListInput.type = 'text';
        tagListInput.placeholder = 'Tag List (comma separated)';
        tagListInput.value = tagList;
        tagListInput.style.width = '180px';
        row.appendChild(tagListInput);
        if (item.options && item.options[1] && item.options[1].help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = item.options[1].help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          row.appendChild(help);
        }

        // Message input
        const messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Message';
        messageInput.value = message;
        messageInput.style.width = '220px';
        row.appendChild(messageInput);
        if (item.options && item.options[2] && item.options[2].help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = item.options[2].help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          row.appendChild(help);
        }

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '–';
  removeBtn.title = 'Remove this row';
  removeBtn.className = 'row-action-btn';
  removeBtn.onclick = () => rowsDiv.removeChild(row);
  row.appendChild(removeBtn);
  // Add (+) button to the right of removeBtn
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+';
  addBtn.title = 'Add another row';
  addBtn.className = 'row-action-btn';
  addBtn.onclick = () => {
    addRow();
    updateAddBtnVisibility();
  };
  row.appendChild(addBtn);
  rowsDiv.appendChild(row);

  updateAddBtnVisibility();

  function updateAddBtnVisibility() {
    const rows = rowsDiv.querySelectorAll('div');
    rows.forEach((r, idx) => {
      const btn = r.querySelector('button.row-action-btn:last-of-type');
      if (btn) btn.style.display = idx === rows.length - 1 ? 'inline-block' : 'none';
    });
  }
      }

      // Add initial row
      addRow();

  // Container for rows only (no addBtn)
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '4px';
  container.appendChild(rowsDiv);

      // Show/hide on checkbox toggle
      checkbox.addEventListener('change', () => {
        container.style.display = checkbox.checked ? 'flex' : 'none';
        rowsDiv.style.display = checkbox.checked ? 'flex' : 'none';
      });

      // Hide container by default
  container.style.display = 'none';
  // Removed options-title div
      div.appendChild(container);
    }

    // For all other functions with options
    else if (item.options && item.options.length > 0) {
  // Removed options-title div

      // Options row
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'hover-options-row';
      optionsDiv.style.display = 'none'; // <-- Hide by default

      item.options.forEach(opt => {
        const optLabel = document.createElement('label');
        optLabel.textContent = `${opt.label}: `;
        optLabel.title = opt.description;

        const optInput = document.createElement('input');
        optInput.type = 'text';
        optInput.id = `${checkboxId}-${opt.key}`;
        optInput.className = `hoverEffectOption ${opt.key}`;

        optLabel.appendChild(optInput);

        // Add a help '?' if help_text exists
        if (opt.help_text) {
          const help = document.createElement('span');
          help.textContent = ' ?';
          help.title = opt.help_text;
          help.style.color = '#0074D9';
          help.style.fontWeight = 'bold';
          help.style.cursor = 'help';
          optLabel.appendChild(help);
        }

        optionsDiv.appendChild(optLabel);
      });

      // Show/hide options when checkbox is toggled
      checkbox.addEventListener('change', () => {
        optionsDiv.style.display = checkbox.checked ? 'flex' : 'none';
      });

      div.appendChild(optionsDiv);
    }

    return div; // <--- Always return div at the end!
  }

  // PastoralCare
  const pcSection = document.getElementById('PastoralCareSection');
  pcSection.innerHTML = '<legend>PastoralCare Functions</legend>';
  const sortedPastoralCare = [...PastoralCare].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sortedPastoralCare.forEach(item => {
    pcSection.appendChild(createCheckbox(item, 'pcFunction'));
  });

  // Emailing
  const emailingSection = document.getElementById('EmailingSection');
  emailingSection.innerHTML = '<legend>Emailing Functions</legend>';
  const sortedEmailing = [...Emailing].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sortedEmailing.forEach(item => {
    emailingSection.appendChild(createCheckbox(item, 'emailFunction'));
  });

  // News
  const newsSection = document.getElementById('NewsSection');
  newsSection.innerHTML = '<legend>News Functions</legend>';
  const sortedNew = [...New].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sortedNew.forEach(item => {
    newsSection.appendChild(createCheckbox(item, 'newsFunction'));
  });
}

// Call this on page load
window.addEventListener('DOMContentLoaded', populateFunctionSections);

window.generateCode = generateCode;
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.copyFunctionsCode = copyFunctionsCode;
window.downloadFunctionsCode = downloadFunctionsCode;

function restoreConfig() {
  const code = document.getElementById('restoreInput').value;

  // Extract values using regex
  const getString = (name) => {
    const match = code.match(new RegExp(`const\\s+${name}\\s*=\\s*['"]([^'"]*)['"]`));
    return match ? match[1] : '';
  };
  const getWindowString = (name) => {
    const match = code.match(new RegExp(`window\\.${name}\\s*=\\s*['"]([^'"]*)['"]`));
    return match ? match[1] : '';
  };
  const getModules = () => {
    const match = code.match(/const modules = (\{[\s\S]*?\});/);
    if (match) {
      try {
        return JSON.parse(match[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
      } catch (e) {}
    }
    return {};
  };

  // Set fields
  document.getElementById('schoolboxDomain').value = getString('schoolboxDomain');
  document.getElementById('JavaScriptURL').value = getString('JavaScriptURL');
  document.getElementById('acceptColor').value = getWindowString('acceptColor');
  document.getElementById('rejectColor').value = getWindowString('rejectColor');

  // Set module checkboxes
  const modules = getModules();
  ['PastoralCare', 'Emailing', 'News'].forEach(mod => {
    const cb = document.getElementById(mod);
    if (cb && typeof modules[mod] === 'boolean') {
      cb.checked = modules[mod];
      toggleSection(mod);
    }
  });

  // --- Restore function checkboxes and options from functions.js code ---
  // Find all variable assignments like: const function_option = "value";
  const varRegex = /const\\s+([a-zA-Z0-9_]+)_([a-zA-Z0-9_]+)\\s*=\\s*(['"`])([\\s\S]*?)\\3;/g;
  let match;
  while ((match = varRegex.exec(code)) !== null) {
    const [_, fn, key, , value] = match;
    // Try all possible className prefixes
    const pcInput = document.getElementById(`pcFunction-${fn}-${key}`);
    const emailInput = document.getElementById(`emailFunction-${fn}-${key}`);
    const newsInput = document.getElementById(`newsFunction-${fn}-${key}`);

    // Set the value if the input exists
    if (pcInput) pcInput.value = value;
    if (emailInput) emailInput.value = value;
    if (newsInput) newsInput.value = value;

    // Also check the checkbox for this function
    const pcCheckbox = document.querySelector(`.pcFunction[value="${fn}"]`);
    const emailCheckbox = document.querySelector(`.emailFunction[value="${fn}"]`);
    const newsCheckbox = document.querySelector(`.newsFunction[value="${fn}"]`);
    if (pcCheckbox) pcCheckbox.checked = true;
    if (emailCheckbox) emailCheckbox.checked = true;
    if (newsCheckbox) newsCheckbox.checked = true;
  }

  // Optionally, trigger change events to show/hide options UI
  ['pcFunction', 'emailFunction', 'newsFunction'].forEach(className => {
    document.querySelectorAll(`.${className}`).forEach(cb => {
      cb.dispatchEvent(new Event('change'));
    });
  });
}
window.restoreConfig = restoreConfig;

function restoreFunctionsConfig() {

  const code = document.getElementById('restoreFunctionsInput').value;
  function parseArrayVar(varName) {
    const arrMatch = code.match(new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`));
    if (arrMatch) {
      let arrStr = arrMatch[1]
        .replace(/(,)(\s*\])/g, '$2') // Remove trailing commas before ]
        .replace(/\r?\n/g, ' ') // Remove newlines
        .replace(/\s+/g, ' '); // Collapse whitespace
      try {
        return JSON.parse(arrStr);
      } catch (e) {
        try {
          // Try eval as a fallback (safe here because user pastes code)
          // eslint-disable-next-line no-eval
          return eval(arrStr);
        } catch (err) {
          console.error('Failed to parse array for', varName, arrStr, err);
        }
      }
    }
    return null;
  }
  setTimeout(() => {
    // Restore individual function variable values and checkboxes (like restoreAllConfig)
    const varRegex = /const\s+([a-zA-Z0-9_]+)_([a-zA-Z0-9_]+)\s*=\s*(["'`])([\s\S]*?)\3;/g;
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      const [_, fn, key, , value] = match;
      // Try all possible className prefixes
      const pcInput = document.getElementById(`pcFunction-${fn}-${key}`);
      const emailInput = document.getElementById(`emailFunction-${fn}-${key}`);
      const newsInput = document.getElementById(`newsFunction-${fn}-${key}`);
      if (pcInput) pcInput.value = value;
      if (emailInput) emailInput.value = value;
      if (newsInput) newsInput.value = value;
      // Also check the checkbox for this function and unhide parent section
      // PastoralCare (pcFunction)
      const pcCheckbox = document.querySelector(`.pcFunction[value="${fn}"]`);
      if (pcCheckbox) {
        pcCheckbox.checked = true;
        // Check parent module checkbox and trigger change event
        const parentModule = document.getElementById('PastoralCare');
        if (parentModule && !parentModule.checked) {
          parentModule.checked = true;
          parentModule.dispatchEvent(new Event('change'));
        }
        // Unhide parent section
        const section = pcCheckbox.closest('.function-section');
        if (section) section.style.display = 'block';
      }
      // Emailing (emailFunction)
      const emailCheckbox = document.querySelector(`.emailFunction[value="${fn}"]`);
      if (emailCheckbox) {
        emailCheckbox.checked = true;
        const parentModule = document.getElementById('Emailing');
        if (parentModule && !parentModule.checked) {
          parentModule.checked = true;
          parentModule.dispatchEvent(new Event('change'));
        }
        const section = emailCheckbox.closest('.function-section');
        if (section) section.style.display = 'block';
      }
      // News (newsFunction)
      const newsCheckbox = document.querySelector(`.newsFunction[value="${fn}"]`);
      if (newsCheckbox) {
        newsCheckbox.checked = true;
        const parentModule = document.getElementById('News');
        if (parentModule && !parentModule.checked) {
          parentModule.checked = true;
          parentModule.dispatchEvent(new Event('change'));
        }
        const section = newsCheckbox.closest('.function-section');
        if (section) section.style.display = 'block';
      }
    }

    // Subtype Severity
    const subtypeSeverityArr = parseArrayVar('subtypeSeverity');
    const subtypeSeverityEntry = document.getElementById('pcFunction-subtypeSeverity')?.closest('.function-entry');
    if (subtypeSeverityEntry) {
      const pairsDiv = subtypeSeverityEntry.querySelector('div.hover-options-row');
      if (pairsDiv) {
        fillDynamicRows(pairsDiv, subtypeSeverityArr, [
          { placeholder: 'Subtype', width: '180px' },
          { placeholder: 'Category', width: '120px' }
        ]);
      }
    }
    // Subtype Alert
    const subtypeAlertArr = parseArrayVar('subtypeAlertPairs');
    const subtypeAlertEntry = document.getElementById('pcFunction-subtypeAlert')?.closest('.function-entry');
    if (subtypeAlertEntry) {
      const pairsDiv = subtypeAlertEntry.querySelector('div.hover-options-row');
      if (pairsDiv) {
        fillDynamicRows(pairsDiv, subtypeAlertArr, [
          { placeholder: 'Subtype', width: '180px' },
          { placeholder: 'Message', width: '260px' }
        ]);
      }
    }
    // Action Checker
    const actionCheckerArr = parseArrayVar('actionCheckerRows');
    const actionCheckerEntry = document.getElementById('pcFunction-actionChecker')?.closest('.function-entry');
    if (actionCheckerEntry) {
      const rowsDiv = actionCheckerEntry.querySelector('div.hover-options-row');
      if (rowsDiv) {
        fillDynamicRows(rowsDiv, actionCheckerArr, [
          { placeholder: 'Action', width: '120px' },
          { placeholder: 'Tag List (comma separated)', width: '180px' },
          { placeholder: 'Message', width: '220px' }
        ]);
      }
    }

    // After restoring variables, also check function checkboxes for included scripts
    ['pcFunction', 'emailFunction', 'newsFunction'].forEach(className => {
      document.querySelectorAll(`.${className}`).forEach(cb => {
        const fn = cb.value;
        const regex = new RegExp(`// ---- scripts/${fn}\\.js ----`);
        if (regex.test(code)) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });

    // Optionally, trigger change events to show/hide options UI
    ['pcFunction', 'emailFunction', 'newsFunction'].forEach(className => {
      document.querySelectorAll(`.${className}`).forEach(cb => {
        cb.dispatchEvent(new Event('change'));
      });
    });
  }, 0);
}
window.restoreFunctionsConfig = restoreFunctionsConfig;

function restoreAllConfig() {
  // --- Loader restore ---
  const loaderCode = document.getElementById('restoreInput').value;

  // Extract values using regex
  const getString = (name) => {
    const match = loaderCode.match(new RegExp(`const\\s+${name}\\s*=\\s*['"]([^'"]*)['"]`));
    return match ? match[1] : '';
  };
  const getWindowString = (name) => {
    const match = loaderCode.match(new RegExp(`window\\.${name}\\s*=\\s*['"]([^'"]*)['"]`));
    return match ? match[1] : '';
  };
  const getModules = () => {
    const match = loaderCode.match(/const modules = (\{[\s\S]*?\});/);
    if (match) {
      try {
        return JSON.parse(match[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
      } catch (e) {}
    }
    return {};
  };

  // Set loader fields
  document.getElementById('schoolboxDomain').value = getString('schoolboxDomain');
  document.getElementById('JavaScriptURL').value = getString('JavaScriptURL');
  document.getElementById('acceptColor').value = getWindowString('acceptColor');
  document.getElementById('rejectColor').value = getWindowString('rejectColor');

  // Set module checkboxes
  const modules = getModules();
  ['PastoralCare', 'Emailing', 'News'].forEach(mod => {
    const cb = document.getElementById(mod);
    if (cb && typeof modules[mod] === 'boolean') {
      cb.checked = modules[mod];
      toggleSection(mod);
    }
  });

  // --- Functions restore ---
  const functionsCode = document.getElementById('restoreFunctionsInput').value;

  // Find all variable assignments like: const function_option = "value";
  const varRegex = /const\s+([a-zA-Z0-9_]+)_([a-zA-Z0-9_]+)\s*=\s*(['"`])([\s\S]*?)\3;/g;
  let match;
  while ((match = varRegex.exec(functionsCode)) !== null) {
    const [_, fn, key, , value] = match;
    // Try all possible className prefixes
    const pcInput = document.getElementById(`pcFunction-${fn}-${key}`);
    const emailInput = document.getElementById(`emailFunction-${fn}-${key}`);
    const newsInput = document.getElementById(`newsFunction-${fn}-${key}`);

    // Set the value if the input exists
    if (pcInput) pcInput.value = value;
    if (emailInput) emailInput.value = value;
    if (newsInput) newsInput.value = value;

    // Also check the checkbox for this function
    const pcCheckbox = document.querySelector(`.pcFunction[value="${fn}"]`);
    const emailCheckbox = document.querySelector(`.emailFunction[value="${fn}"]`);
    const newsCheckbox = document.querySelector(`.newsFunction[value="${fn}"]`);
    if (pcCheckbox) pcCheckbox.checked = true;
    if (emailCheckbox) emailCheckbox.checked = true;
    if (newsCheckbox) newsCheckbox.checked = true;
  }

  // After restoring variables, also check function checkboxes for included scripts
  ['pcFunction', 'emailFunction', 'newsFunction'].forEach(className => {
    document.querySelectorAll(`.${className}`).forEach(cb => {
      const fn = cb.value;
      // Look for the script block in the code
      const regex = new RegExp(`// ---- scripts/${fn}\\.js ----`);
      // Use the correct code source (functionsCode for restoreAllConfig, code for restoreConfig)
      const codeSource = typeof functionsCode !== 'undefined' ? functionsCode : code;
      if (regex.test(codeSource)) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
      }
    });
  });

  // Optionally, trigger change events to show/hide options UI
  ['pcFunction', 'emailFunction', 'newsFunction'].forEach(className => {
    document.querySelectorAll(`.${className}`).forEach(cb => {
      cb.dispatchEvent(new Event('change'));
    });
  });
}
window.restoreAllConfig = restoreAllConfig;


