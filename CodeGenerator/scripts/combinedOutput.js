/* Module: buildCombinedCode
	 Exports a function that assembles the final combined output given
	 the generated loader code and the functions code.
*/
export function buildCombinedCode(loaderCode, functionsCode) {
	// Remove any <script> tags from the functions area
	let functions = (functionsCode || '').replace(/<script>/gi, '').replace(/<\/script>/gi, '');

	// Find all script-section headers (format: // ----- path/to/file.js -----\n)
	// Accept any number of dashes (for backward compatibility)
	const headerRegex = /\/\/\s*-+\s*(.+?)\s*-+\s*\n/g;
	const headers = [];
	let hmatch;
	while ((hmatch = headerRegex.exec(functions)) !== null) {
		headers.push({ raw: hmatch[0], file: hmatch[1], index: hmatch.index });
	}

	let functionsCombined = '';
	if (headers.length === 0) {
		functionsCombined = functions;
	} else {
		const preamble = functions.slice(0, headers[0].index);

		// Extract const declarations from the preamble
		const constRegex = /(^\s*const\s+[a-zA-Z0-9_]+\s*=([\s\S]*?)?;\s*)/gm;
		const preVars = [];
		let vmatch;
		while ((vmatch = constRegex.exec(preamble)) !== null) {
			preVars.push(vmatch[0]);
		}

		// Build section objects
		const sections = [];
		for (let i = 0; i < headers.length; i++) {
			const start = headers[i].index + headers[i].raw.length;
			const end = i + 1 < headers.length ? headers[i + 1].index : functions.length;
			const content = functions.slice(start, end);
			sections.push({ file: headers[i].file, content });
		}

		// Assign vars to sections heuristically
		const varsBySection = {};
		sections.forEach(s => { varsBySection[s.file] = []; });
		const remainingVars = [];

		preVars.forEach(v => {
			const nameMatch = v.match(/const\s+([a-zA-Z0-9_]+)\s*=/);
			if (!nameMatch) { remainingVars.push(v); return; }
			const name = nameMatch[1];
			let assigned = false;
			for (const s of sections) {
				const base = s.file.replace(/^.*[\/\\]/, '').replace(/\.js$/, '');
				if (name === base || name.startsWith(base + '_') || name.toLowerCase().includes(base.toLowerCase())) {
					varsBySection[s.file].push(v);
					assigned = true;
					break;
				}
			}
			if (!assigned) {
				if (name === 'actionCheckerRows') {
					const key = Object.keys(varsBySection).find(k => k.endsWith('/actionChecker.js'));
					if (key) { varsBySection[key].push(v); assigned = true; }
				} else if (name === 'subtypeSeverity') {
					const key = Object.keys(varsBySection).find(k => k.endsWith('/subtypeSeverity.js'));
					if (key) { varsBySection[key].push(v); assigned = true; }
				} else if (name === 'subtypeAlertPairs') {
					const key = Object.keys(varsBySection).find(k => k.endsWith('/subtypeAlert.js'));
					if (key) { varsBySection[key].push(v); assigned = true; }
				}
			}
			if (!assigned) remainingVars.push(v);
		});

		const preambleNoVars = preamble.replace(constRegex, '').trim();
		if (preambleNoVars) functionsCombined += preambleNoVars + '\n\n';
		if (remainingVars.length) functionsCombined += remainingVars.join('') + '\n';

		sections.forEach(s => {
			functionsCombined += `// ----- ${s.file} -----\n`;
			if (varsBySection[s.file] && varsBySection[s.file].length) {
				functionsCombined += varsBySection[s.file].join('') + '\n';
			}
			functionsCombined += s.content.trim() + '\n\n';
		});
	}

	// Merge loader and functions into single script block
	let combined = (loaderCode || '') + '\n' + functionsCombined;
	combined = combined.replace(/<script>/gi, '').replace(/<\/script>/gi, '');
	combined = combined.replace(/\n{3,}/g, '\n\n').trim();

	// Quick syntax validation: try to compile the combined code and surface errors
	try {
		// Use Function constructor to validate syntax without executing
		new Function(combined);
	} catch (e) {
		const errMsg = e && e.message ? e.message : String(e);
		// Build a small numbered snippet to help locate the issue
		const lines = combined.split('\n');
		const snippetLines = lines.slice(0, 200); // show first 200 lines
		const numbered = snippetLines.map((ln, i) => `${String(i+1).padStart(4,' ')}: ${ln}`).join('\n');
		const msg = `// SYNTAX ERROR: ${errMsg}\n// Showing the first ${snippetLines.length} lines of the combined script for inspection:\n` + numbered + '\n// End of snippet\n';
		combined = msg + '\n' + combined;
	}
	// Return combined JS wrapped in <script> tags (needed when embedding into HTML)
	return `<script>\n${combined}\n</script>`;
}

// Generate loader, functions and combined code directly from the DOM UI
export async function generateCombinedFromUI() {
	// Collect static fields
	const schoolboxDomain = window.location.origin;
	const acceptColor = document.getElementById('acceptColor')?.value || '';
	const rejectColor = document.getElementById('rejectColor')?.value || '';

	// Helper to coerce option values into safe strings
	function safeString(v) {
		if (v == null) return '';
		if (typeof v === 'string') return v;
		if (v instanceof Element) return v.value || '';
		try { return String(v); } catch (e) { return ''; }
	}

	// Collect selected modules
	const modules = {
		PastoralCare: document.getElementById('PastoralCare')?.checked || false,
		Emailing: document.getElementById('Emailing')?.checked || false,
		News: document.getElementById('News')?.checked || false
	};

	// --- Loader.js generation ---
	let loaderCode = `<script>\n// Generated Schoolbox Addons Loader Script\n\nconst schoolboxDomain = window.location.origin;\nwindow.acceptColor = ${JSON.stringify(safeString(acceptColor))};\nwindow.rejectColor = ${JSON.stringify(safeString(rejectColor))};\n\nconst modules = ${JSON.stringify(modules, null, 2)};\n\n`;

	// Fetch and append the loader logic
	try {
		const response = await fetch('scripts/loader.js');
		if (!response.ok) throw new Error('Failed to load loader.js');
		const loaderContent = await response.text();
		// Ensure loader can run in combined mode without a JavaScriptURL global
		const loaderPrefix = "if (typeof JavaScriptURL === 'undefined') { var JavaScriptURL = ''; }\nconst COMBINED_GENERATED = true;\n";
		// If combined, short-circuit the DOMContentLoaded handler to avoid loading external functions.js
		let safeLoaderContent = loaderContent.replace(/document\.addEventListener\(\s*['\"]DOMContentLoaded['\"]\s*,\s*\(\)\s*=>\s*{/, "document.addEventListener('DOMContentLoaded', () => { if (typeof COMBINED_GENERATED !== 'undefined' && COMBINED_GENERATED) { console.log('Combined mode: skipping external loader actions'); return; } ");
		loaderCode += loaderPrefix + safeLoaderContent;
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

	// Debug: log dynamic toggles and selections
	try {
		const allPc = Array.from(document.querySelectorAll('.pcFunction'));
		console.debug('[generateCombinedFromUI] all .pcFunction count=', allPc.length, allPc.map(e => ({ id: e.id, value: e.value, dataset: e.dataset }))); 
		console.debug('[generateCombinedFromUI] selectedPastoralCare=', selectedPastoralCare);
		const allEmail = Array.from(document.querySelectorAll('.emailFunction'));
		console.debug('[generateCombinedFromUI] all .emailFunction count=', allEmail.length, allEmail.map(e => ({ id: e.id, value: e.value, dataset: e.dataset }))); 
		console.debug('[generateCombinedFromUI] selectedEmailing=', selectedEmailing);
		const allNews = Array.from(document.querySelectorAll('.newsFunction'));
		console.debug('[generateCombinedFromUI] all .newsFunction count=', allNews.length, allNews.map(e => ({ id: e.id, value: e.value, dataset: e.dataset }))); 
		console.debug('[generateCombinedFromUI] selectedNews=', selectedNews);
	} catch (e) {
		console.warn('Debug logging failed', e);
	}

	// Collect all entered options for selected functions directly from the DOM.
	// This avoids relying on preloaded `window.*` schema objects which may
	// contain file defaults rather than user-edited values.
	function collectOptions(selected, _section, className) {
		const options = {};
		selected.forEach(fn => {
			// find any inputs/textareas/selects whose id starts with the expected prefix
			const prefix = `${className}-${fn}-`;
			const els = Array.from(document.querySelectorAll(`[id^="${prefix}"]`));
			if (els.length) {
				options[fn] = {};
				els.forEach(el => {
					const id = el.id || '';
					const key = id.slice(prefix.length);
					if (!key) return;
					let val = '';
					if (el.tagName && el.tagName.toLowerCase() === 'textarea') val = el.value;
					else if (el.value !== undefined) val = el.value;
					else val = el.textContent || '';
					options[fn][key] = val;
				});
			}
		});
		return options;
	}

	const pcOptions = collectOptions(selectedPastoralCare, (Array.isArray(window.PastoralCare) ? window.PastoralCare : []), 'pcFunction');
	const emailOptions = collectOptions(selectedEmailing, (Array.isArray(window.Emailing) ? window.Emailing : []), 'emailFunction');
	const newsOptions = collectOptions(selectedNews, (Array.isArray(window.New) ? window.New : []), 'newsFunction');

	const allOptions = { ...pcOptions, ...emailOptions, ...newsOptions };

	// Special handling for dynamic rows/pairs
	let subtypeSeverityCode = '';
	let subtypeSeverityArr = [];
	if (selectedPastoralCare.includes('subtypeSeverity')) {
		// Find the function entry via its toggle (.pcFunction[value="subtypeSeverity"]) so
		// dynamically-generated entries are discovered regardless of hard-coded IDs.
		const toggle = document.querySelector('.pcFunction[value="subtypeSeverity"]');
		const entry = toggle?.closest('.function-entry') || document.getElementById('pcFunction-subtypeSeverity')?.closest('.function-entry');
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
						if (!seen.has(key)) { pairs.push([subtype, category]); seen.add(key); }
					}
				}
			});
			subtypeSeverityArr = pairs;
			subtypeSeverityCode = `const subtypeSeverity = ${JSON.stringify(pairs, null, 4)};\n\n`;
		}
	}

	let subtypeAlertCode = '';
	let subtypeAlertPairsArr = [];
	if (selectedPastoralCare.includes('subtypeAlert')) {
		// Try to locate the entry by toggle value first, fall back to legacy static id
		const toggle = document.querySelector('.pcFunction[value="subtypeAlert"]') || document.querySelector('.pcFunction[value="subtypeAlertPairs"]');
		const entry = toggle?.closest('.function-entry') || document.getElementById('pcFunction-subtypeAlertPairs')?.closest('.function-entry');
		if (entry) {
			const pairs = [];
			const seen = new Set();
			entry.querySelectorAll('div').forEach(row => {
				const subtypeInput = row.querySelector('input[placeholder="Subtype"]');
				const messageInput = row.querySelector('input[placeholder="Alert Message"]');
				if (subtypeInput && messageInput) {
					const subtype = subtypeInput.value.trim();
					const message = messageInput.value.trim();
					if (subtype && message) {
						const key = `${subtype}|||${message}`;
						if (!seen.has(key)) { pairs.push([subtype, message]); seen.add(key); }
					}
				}
			});
			subtypeAlertPairsArr = pairs;
			subtypeAlertCode = `const subtypeAlertPairs = ${JSON.stringify(pairs, null, 4)};\n\n`;
		}
	}

	let actionCheckerCode = '';
	let actionCheckerRowsArr = [];
	if (selectedPastoralCare.includes('actionChecker')) {
		const toggle = document.querySelector('.pcFunction[value="actionChecker"]');
		const entry = toggle?.closest('.function-entry') || document.getElementById('pcFunction-actionChecker')?.closest('.function-entry');
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
						if (!seen.has(key)) { rows.push([action, tagList, message]); seen.add(key); }
					}
				}
			});
			actionCheckerRowsArr = rows;
			actionCheckerCode = `const actionCheckerRows = ${JSON.stringify(rows, null, 4)};\n\n`;
		}
	}

	// Fetch modal first so it appears above all functions in the output
	let modalCode = '';
	try {
		const modalResp = await fetch('Modals/notificationModal.js');
		if (!modalResp.ok) throw new Error('Failed to load Modals/notificationModal.js');
		const modalContent = await modalResp.text();
		modalCode = `\n// ----- Modals/notificationModal.js -----\n${modalContent}\n// ----- End Modals/notificationModal.js -----\n\n`;
	} catch (err) {
		modalCode = `\n// ERROR: Could not load Modals/notificationModal.js: ${err.message}\n// ----- End Modals/notificationModal.js -----\n\n`;
	}

	// Optionally include the form modal code only when the formEmbedding function is selected
	let formModalCode = '';
	if (selectedPastoralCare.includes('formEmbedding')) {
		try {
			const fmResp = await fetch('Modals/formModal.js');
			if (!fmResp.ok) throw new Error('Failed to load Modals/formModal.js');
			const fmContent = await fmResp.text();
			formModalCode = `\n// ----- Modals/formModal.js -----\n${fmContent}\n// ----- End Modals/formModal.js -----\n\n`;
		} catch (err) {
			formModalCode = `\n// ERROR: Could not load Modals/formModal.js: ${err.message}\n// ----- End Modals/formModal.js -----\n\n`;
		}
	}

	// Build variable declarations for all options
	let functionsCode = modalCode + formModalCode + subtypeSeverityCode + subtypeAlertCode + actionCheckerCode;
	Object.entries(allOptions).forEach(([fn, opts]) => {
		Object.entries(opts).forEach(([key, value]) => {
			const val = safeString(value);
			functionsCode += `const ${fn}_${key} = ${JSON.stringify(val)};\n`;
		});
	});

	// List of all selected function script files
	const selectedFiles = [
		...selectedPastoralCare.map(fn => `Functions/pastoralCare/${fn}.js`),
		...selectedEmailing.map(fn => `Functions/emailing/${fn}.js`),
		...selectedNews.map(fn => `Functions/news/${fn}.js`)
	];

	// Add a readable list of selected files for debugging/visibility
	if (selectedFiles.length) {
		functionsCode += `\n// Selected files:\n` + selectedFiles.map(f => `// ${f}`).join('\n') + `\n\n`;
	} else {
		functionsCode += `\n// Selected files: (none)\n\n`;
	}

	// Fetch and append the contents of each selected JS file
	// Collect any form names referenced by formEmbedding (to include form code placeholders)
	let formEmbeddingForms = [];

	for (const file of selectedFiles) {
		try {
			const resp = await fetch(file);
			if (!resp.ok) throw new Error(`Failed to load ${file}`);
			const content = await resp.text();
			let updatedContent = content;
			try {
				const schemaKeyIndex = content.indexOf('functionSchema');
				if (schemaKeyIndex !== -1) {
					const after = content.slice(schemaKeyIndex);
					const eq = after.indexOf('=');
					if (eq !== -1) {
						const rest = after.slice(eq + 1);
						const braceStart = rest.indexOf('{');
						if (braceStart !== -1) {
							let depth = 0;
							let endIndex = -1;
							for (let i = braceStart; i < rest.length; i++) {
								if (rest[i] === '{') depth++;
								else if (rest[i] === '}') { depth--; if (depth === 0) { endIndex = i; break; } }
							}
							if (endIndex !== -1) {
								const objText = rest.slice(braceStart, endIndex + 1);
								let schemaObj = null;
								try { schemaObj = (new Function('return ' + objText))(); } catch (e) { schemaObj = null; }
								if (schemaObj && Array.isArray(schemaObj.fields)) {
									const base = file.replace(/^.*[\\/]/, '').replace(/\.js$/, '');
									// If this is the formEmbedding function, extract mapping names
									if (base === 'formEmbedding') {
										try {
											const row = schemaObj.fields.find(f=>f.type==='rows' || f.name==='embeds');
											let embeds = [];
											if (row && Array.isArray(row.options) && row.options.length) {
												embeds = row.options.map(r=>r.split('|').map(p=> (p||'').trim()));
											}
											if (!embeds.length && Array.isArray(schemaObj.options)) {
												embeds = schemaObj.options.map(r=>r.split('|').map(p=> (p||'').trim()));
											}
											// Prefer values entered on the page: locate the formEmbedding function entry
											try {
												const toggle = document.querySelector('.pcFunction[value="formEmbedding"]');
												const entry = toggle?.closest('.function-entry') || document.getElementById('pcFunction-formEmbedding')?.closest('.function-entry');
												if (entry) {
													// Look for a textarea containing options first
													const ta = entry.querySelector('textarea');
													if (ta && ta.value && ta.value.trim()) {
														const lines = ta.value.split('\n').map(l=>l.trim()).filter(Boolean);
														embeds = lines.map(l=>l.split('|').map(p=> (p||'').trim()));
													} else {
														// Fallback: look for row editor items
														const rows = Array.from(entry.querySelectorAll('.row-item'));
														if (rows.length) {
															embeds = rows.map(r => Array.from(r.querySelectorAll('input,textarea')).map(i=> (i.value||'').trim()));
														}
													}
												}
											} catch (ed) { /* ignore DOM read errors in non-browser env */ }
											formEmbeddingForms = embeds.map(a => (a && a[2]) ? a[2] : (a && a[0]) ? a[0] : '').filter(Boolean);
										} catch (e) { /* ignore */ }
									}
									// Sync schema fields with UI inputs: update values, add new fields, remove missing fields
									try {
										const fnKey = base;
										// Build map of UI fields for this function by scanning inputs/textarea/select with id prefixes
										const uiMap = {};
										try {
											const prefixes = ['pcFunction-', 'emailFunction-', 'newsFunction-'];
											prefixes.forEach(pref => {
												const selector = `[id^="${pref}${fnKey}-"]`;
												Array.from(document.querySelectorAll(selector)).forEach(el => {
													const id = el.id || '';
													// id format: <pref><fnKey>-<key...>
													const parts = id.split('-');
													// remove first two parts (e.g., 'pcFunction','<fn>')
													const key = parts.slice(2).join('-');
													if (!key) return;
													const val = (el.value !== undefined) ? el.value : (el.textContent || '');
													const tag = el.tagName ? el.tagName.toLowerCase() : 'input';
													uiMap[key] = { value: val, tag };
												});
											});
										} catch (eui) { /* ignore UI scan failures in non-browser env */ }

										// Start with existing fields, but only keep those present in uiMap (or special rows handled below)
										const keptFields = [];
										const existingByName = {};
										schemaObj.fields.forEach(f => { existingByName[f.name] = f; });

										// Handle row fields (special multi-row types) first: map provided arrays
										schemaObj.fields.forEach(f => {
											if (f.type === 'rows') {
												const baseName = base;
												if (baseName === 'actionChecker' && actionCheckerRowsArr.length) {
													f.options = actionCheckerRowsArr.map(r => r.join('|'));
												} else if (baseName === 'subtypeSeverity' && subtypeSeverityArr.length) {
													f.options = subtypeSeverityArr.map(r => r.join('|'));
												} else if (baseName === 'subtypeAlert' && subtypeAlertPairsArr.length) {
													f.options = subtypeAlertPairsArr.map(r => r.join('|'));
												} else if (baseName === 'externalEmail') {
													if (Array.isArray(window.externalEmail_mappings) && window.externalEmail_mappings.length) {
														f.options = window.externalEmail_mappings.map(r => Array.isArray(r) ? r.join('|') : String(r));
													}
												}
												keptFields.push(f);
											}
										});

										// For non-row fields: update placeholder/default from UI if present; if UI has a field not present, add it
										Object.keys(uiMap).forEach(key => {
											// prefer to update existing field with matching name
											if (existingByName[key]) {
												const f = existingByName[key];
												const uiVal = uiMap[key].value;
												if (uiVal !== undefined && uiVal !== null && String(uiVal).trim() !== '') {
													if (f.type === 'multiline') f.placeholder = uiVal;
													else f.placeholder = uiVal;
												}
												keptFields.push(f);
												delete existingByName[key];
											} else {
												// Add new field inferred from UI
												const uiEntry = uiMap[key];
												const newField = {
													name: key,
													label: key.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
													type: uiEntry.tag === 'textarea' ? 'multiline' : 'input',
													placeholder: uiEntry.value || '',
													allowMultiple: false
												};
												keptFields.push(newField);
											}
										});

										// Any remaining existingByName entries were removed from the UI -> skip them (effectively remove fields)

										// Assign the synced fields back
										schemaObj.fields = keptFields;
									} catch (esync) {
										console.warn('Schema sync failed for', base, esync);
									}
									const newSchemaText = 'var functionSchema = ' + JSON.stringify(schemaObj, null, 2) + ';\n\n';
									const beforeSchema = content.slice(0, schemaKeyIndex);
									const afterSchema = rest.slice(endIndex + 1);
									updatedContent = beforeSchema + newSchemaText + afterSchema;
								}
							}
						}
					}
				}
			} catch (e) {
				console.error('Schema update failed for', file, e);
			}
			const basename = file.replace(/^.*[\\\\\/]/, '');
			functionsCode += `\n// ----- ${basename} -----\n${updatedContent}\n// ----- End ${basename} -----\n`;
		} catch (err) {
			const basenameErr = file.replace(/^.*[\\\\\/]/, '');
			functionsCode += `\n// ERROR: Could not load ${file}: ${err.message}\n// ----- End ${basenameErr} -----\n`;
		}
	}

	// modal already prepended above

	// If formEmbedding is selected, append a Forms block placeholder listing referenced forms
	if (selectedPastoralCare.includes('formEmbedding')) {
		functionsCode += '\n// ----- Forms/Form code(s) below -----\n';
		if (formEmbeddingForms && formEmbeddingForms.length) {
			formEmbeddingForms.forEach(fn => {
				functionsCode += `// Form: ${fn} -- add the form JS/HTML here if required\n`;
			});
		} else {
			functionsCode += `// Add any form JS/HTML needed for embedded forms here.\n`;
		}
		// Explicit end-of-forms marker so the admin editor knows where to stop
		functionsCode += `// ----- Forms End -----\n`;
		functionsCode += '\n';
	}

	const combined = buildCombinedCode(loaderCode, functionsCode);
	return { loaderCode, functionsCode, combinedCode: combined };
}
