// formModal.js - Simplified modal for forms
// Usage: formShowModal(html, options)

function formShowModal(html, options = {}) {
  // Auto-detect CKEditor5 instance if not provided
  try {
    if (!options.ckEditor5Instance) {
      options.ckEditor5Instance = window.myEditor || window.editor || window.Editor || null;
    }
  } catch (e) { /* ignore */ }

  // Remove existing modal
  const oldModal = document.getElementById('formModal');
  if (oldModal) oldModal.remove();

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'formModal';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: ${options.overlayColor || 'rgba(0,0,0,0.25)'};
    z-index: 9999; display: flex; align-items: flex-start;
    justify-content: center; overflow-y: auto; padding-top: ${options.topOffset || '6vh'};
  `;

  // Create modal box
  const modalBox = document.createElement('div');
  modalBox.style.cssText = `
    background: ${options.bgColor || '#fff'}; border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12); padding: ${options.padding || '20px'};
    max-width: ${options.maxWidth || '520px'}; width: 100%; position: relative;
    max-height: calc(100vh - 80px); overflow-y: auto; margin: 0 auto;
  `;
  modalBox.className = 'form-modal';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = options.closeText || '×';
  closeBtn.title = 'Close';
  closeBtn.style.cssText = `
    position: absolute; top: 12px; right: 16px; font-size: 1.5em;
    background: none; border: none; cursor: pointer;
  `;
  closeBtn.onclick = formCloseModal;
  modalBox.appendChild(closeBtn);

  // Build HTML from schema if needed
  if (html && typeof html === 'object' && Array.isArray(html.fields)) {
    html = buildFormHTML(html);
  }

  // Add content
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = html;
  modalBox.appendChild(contentDiv);

  // Add submit button and handler
  const form = contentDiv.querySelector('form');
  if (form) {
    addSubmitButton(form, options);
    addSubmitHandler(form, options);
  }

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
}

function buildFormHTML(schema) {
  let html = '';
  if (schema.formName) {
    html += `<h2 style="margin-top:0;margin-bottom:18px;font-size:1.3em;color:#222;"><strong>${schema.formName}</strong></h2>`;
  }
  
  html += '<form>';
  
  const fields = schema.fields || [];
  let i = 0;
  
  while (i < fields.length) {
    const field = fields[i];
    const nextField = fields[i + 1];
    
    // Check if current and next field are both halfWidth
    if (field && field.halfWidth && nextField && nextField.halfWidth) {
      // Create flex container for two half-width fields
      html += '<div style="display:flex;gap:16px;margin-bottom:16px;">';
      
      // Process both fields
      [field, nextField].forEach(f => {
        html += '<div style="flex:1;">';
        html += `<label style="font-weight:500;display:block;margin-bottom:4px;">${f.label || ''}</label>`;
        html += buildFieldHTML(f);
        html += '</div>';
      });
      
      html += '</div>';
      i += 2; // Skip next field since we processed it
    } else {
      // Single field (full width)
      html += '<div style="margin-bottom:16px;">';
      html += `<label style="font-weight:500;display:block;margin-bottom:4px;">${field.label || ''}</label>`;
      html += buildFieldHTML(field);
      html += '</div>';
      i += 1;
    }
  }
  
  html += '</form>';
  return html;
}

function buildFieldHTML(field) {
  const baseStyle = 'width:100%;padding:7px;border-radius:6px;border:1px solid #d0d7de;';
  const required = field.required ? ' required' : '';
  
  switch(field.type) {
    case 'text':
      return `<input type="text" name="${field.name}" style="${baseStyle}"${required}>`;
    case 'textarea':
      return `<textarea name="${field.name}" style="${baseStyle}"${required}></textarea>`;
    case 'number':
      return `<input type="number" name="${field.name}" style="${baseStyle}"${required}>`;
    case 'date':
      return `<input type="date" name="${field.name}" style="${baseStyle}"${required}>`;
    case 'dropdown':
      let html = `<select name="${field.name}" style="${baseStyle}"${required}>`;
      if (field.options) {
        field.options.forEach(opt => {
          html += `<option value="${opt}">${opt}</option>`;
        });
      }
      html += '</select>';
      return html;
    case 'checkbox':
      return `<input type="checkbox" name="${field.name}" value="1">`;
    case 'checkboxGroup':
      if (field.options) {
        return field.options.map(opt => 
          `<label style="margin-right:12px;"><input type="checkbox" name="${field.name}" value="${opt}">${opt}</label>`
        ).join('');
      }
      return '';
    case 'radio':
      if (field.options) {
        return field.options.map(opt => 
          `<label style="margin-right:12px;"><input type="radio" name="${field.name}" value="${opt}">${opt}</label>`
        ).join('');
      }
      return '';
    default:
      return `<input type="text" name="${field.name}" style="${baseStyle}"${required}>`;
  }
}

function addSubmitButton(form, options) {
  const actionsWrap = document.createElement('div');
  actionsWrap.style.cssText = 'display:flex;justify-content:flex-end;margin-top:16px;';
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.textContent = options.submitText || 'Submit';
  submitBtn.classList.add('modal-submit');
  
  submitBtn.onclick = () => {
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
  };
  
  actionsWrap.appendChild(submitBtn);
  form.parentNode.insertBefore(actionsWrap, form.nextSibling);
}

function addSubmitHandler(form, options) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (!Array.isArray(data[key])) data[key] = [data[key]];
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
    
    // Custom submit handler
    if (typeof options.onSubmit === 'function') {
      try {
        const result = options.onSubmit(data, form);
        if (result !== false) formCloseModal();
      } catch (err) {
        console.warn('Submit handler failed:', err);
        formCloseModal();
      }
      return;
    }
    
    // Default: copy to clipboard and paste to CKEditor with layout
    const plainText = Object.entries(data)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join('\n');
    
    const htmlText = buildFormattedOutput(data, form);
    
    // Try to paste into CKEditor first
    if (options.pasteToEditor !== false) {
      pasteToCKEditor(htmlText, options);
    }
    
    // Copy to clipboard
    copyToClipboard(plainText, htmlText);
  });
}

function buildFormattedOutput(data, form) {
  // Try to get the form schema from the modal or reconstruct from form structure
  let html = '';
  
  // Get form title if available
  const titleElement = form.parentNode.querySelector('h2');
  if (titleElement) {
    html += `<h3 style="margin-bottom:16px;color:#333;border-bottom:2px solid #eee;padding-bottom:8px;"><strong>${titleElement.textContent}</strong></h3>`;
  }
  
  // Create a structured table layout
  html += '<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">';
  
  // Get field containers to maintain layout structure
  const fieldContainers = form.querySelectorAll('[style*="margin-bottom"], [style*="display:flex"]');
  
  fieldContainers.forEach(container => {
    // Check if this is a flex container (two fields side by side)
    if (container.style.display === 'flex') {
      const fields = container.querySelectorAll('input, select, textarea');
      if (fields.length === 2) {
        // Two fields side by side
        html += '<tr>';
        fields.forEach(field => {
          const label = field.closest('div').querySelector('label');
          const labelText = label ? label.textContent.trim() : field.name;
          const value = data[field.name] || '';
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          
          html += `<td style="padding:8px;vertical-align:top;width:50%;border:1px solid #eee;">
                     <strong>${escapeHtml(labelText)}:</strong><br>
                     <span style="color:#666;">${escapeHtml(displayValue)}</span>
                   </td>`;
        });
        html += '</tr>';
      }
    } else {
      // Single field (full width)
      const field = container.querySelector('input, select, textarea');
      if (field && data[field.name] !== undefined) {
        const label = container.querySelector('label');
        const labelText = label ? label.textContent.trim() : field.name;
        const value = data[field.name] || '';
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        
        // Handle textarea fields differently (more space)
        if (field.tagName.toLowerCase() === 'textarea') {
          html += `<tr>
                     <td colspan="2" style="padding:8px;border:1px solid #eee;">
                       <strong>${escapeHtml(labelText)}:</strong><br>
                       <span style="color:#666;white-space:pre-wrap;">${escapeHtml(displayValue)}</span>
                     </td>
                   </tr>`;
        } else {
          html += `<tr>
                     <td colspan="2" style="padding:8px;border:1px solid #eee;">
                       <strong>${escapeHtml(labelText)}:</strong><br>
                       <span style="color:#666;">${escapeHtml(displayValue)}</span>
                     </td>
                   </tr>`;
        }
      }
    }
  });
  
  html += '</table>';
  
  return html;
}

function pasteToCKEditor(htmlText, options) {
  try {
    // Primary method: Schoolbox CKEditor via contenteditable
    const editable = document.querySelector('.ck-editor__editable[contenteditable="true"]');
    if (editable && editable.ckeditorInstance) {
      try {
        // Get existing content and append new content
        const existing = editable.ckeditorInstance.getData() || '';
        editable.ckeditorInstance.setData(existing + htmlText);
        console.log('Pasted into Schoolbox CKEditor via editable.ckeditorInstance');
        return;
      } catch (e) {
        console.warn('Schoolbox CKEditor setData failed:', e);
      }
    }

    // Fallback: Try provided CKEditor5 instance
    if (options.ckEditor5Instance) {
      const editor = options.ckEditor5Instance;
      if (editor.model && editor.data && typeof editor.model.change === 'function') {
        try {
          const viewFragment = editor.data.processor.toView(htmlText);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.change(() => {
            editor.model.insertContent(modelFragment);
          });
          console.log('Pasted into provided CKEditor5 instance');
          return;
        } catch (e) {
          // Fallback to setData
          try {
            const existing = editor.getData() || '';
            editor.setData(existing + htmlText);
            console.log('Appended to provided CKEditor5 instance');
            return;
          } catch (e2) { /* continue to other methods */ }
        }
      }
    }
    
    // Fallback: Try to find CKEditor5 via common globals
    const editorCandidates = [
      window.myEditor, 
      window.editor, 
      window.Editor,
      window.watchdog && window.watchdog.editor
    ].filter(Boolean);
    
    for (const editor of editorCandidates) {
      try {
        if (editor.model && editor.data && typeof editor.model.change === 'function') {
          const viewFragment = editor.data.processor.toView(htmlText);
          const modelFragment = editor.data.toModel(viewFragment);
          editor.model.change(() => {
            editor.model.insertContent(modelFragment);
          });
          console.log('Pasted into CKEditor5 global instance');
          return;
        }
      } catch (e) { /* try next candidate */ }
    }
    
    // Fallback: Try CKEditor4 if available
    if (window.CKEDITOR && CKEDITOR.instances) {
      for (const instName in CKEDITOR.instances) {
        try {
          const inst = CKEDITOR.instances[instName];
          if (inst && typeof inst.getData === 'function' && typeof inst.setData === 'function') {
            const existing = inst.getData() || '';
            inst.setData(existing + htmlText);
            console.log('Pasted into CKEditor4 instance:', instName);
            return;
          }
        } catch (e) { /* try next instance */ }
      }
    }
    
    // Final fallback: Try contenteditable DOM manipulation
    if (editable) {
      try {
        editable.focus();
        const selection = document.getSelection();
        if (selection && selection.rangeCount) {
          const range = selection.getRangeAt(0);
          const fragment = range.createContextualFragment(htmlText);
          range.insertNode(fragment);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editable.innerHTML += htmlText;
        }
        editable.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('Pasted into contenteditable element via DOM');
        return;
      } catch (e) { /* ignore fallback failure */ }
    }
    
  } catch (e) {
    console.warn('CKEditor paste failed:', e);
  }
}

function copyToClipboard(plainText, htmlText) {
  // Try modern clipboard API with HTML support
  if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
    try {
      const blobHtml = new Blob([htmlText], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
      ]).then(() => {
        console.log('Data copied to clipboard (HTML + text)');
        formCloseModal();
      }).catch(() => {
        copyPlainText(plainText);
      });
      return;
    } catch (e) { /* fallback */ }
  }
  
  // Fallback to plain text clipboard
  copyPlainText(plainText);
}

function copyPlainText(plainText) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText).then(() => {
      console.log('Data copied to clipboard (text)');
      formCloseModal();
    }).catch(() => {
      legacyCopy(plainText);
      formCloseModal();
    });
  } else {
    legacyCopy(plainText);
    formCloseModal();
  }
}

function legacyCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;left:-9999px;';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, function(s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[s];
  });
}

function formCloseModal() {
  const modal = document.getElementById('formModal');
  if (modal) modal.remove();
}

// Export functions
window.formShowModal = formShowModal;
window.formCloseModal = formCloseModal;