// Utilities to build form schema JS from a fields array
/* Usage:
   const code = buildFormSchemaCode(fields, 'My Form');
   // or automatically place into textarea with id 'output'
   outputFormToTextarea(fields, 'My Form');
*/

function buildFormSchemaCode(fields, formName) {
  const cleaned = (Array.isArray(fields) ? fields : []).map(f => {
    const out = { type: f.type, label: f.label, name: f.name };
    if (Array.isArray(f.options) && f.options.length) out.options = f.options.slice();
    if (f.halfWidth) out.halfWidth = true;
    if (f.required) out.required = true;
    return out;
  });

  const schema = {};
  if (formName && String(formName).trim()) schema.formName = String(formName).trim();
  schema.fields = cleaned;

  // Produce a self-contained form script compatible with the combined loader
  const nameKey = schema.formName || `Form_${Date.now()}`;
  const safeId = nameKey.replace(/[^a-zA-Z0-9_\-]/g, '_');
  // Create a unique variable name based on the form name
  const variableName = safeId.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') + 'Schema';
  const jsLines = [];
  jsLines.push(`// Generated NCCD Form: ${nameKey}`);
  // Produce a short variable that contains the schema only. The modal can consume
  // this by calling `formShowModal(${variableName})` or you can register it manually.
  jsLines.push(`const ${variableName} = ${JSON.stringify(schema, null, 2)};`);
  jsLines.push(`// Usage: pass the schema object to formShowModal(${variableName}) to preview or embed.`);
    // Also register the schema in the global registry so existing embedding
    // code that looks up `window.GeneratedForms[...]` continues to work.
    jsLines.push(`window.GeneratedForms = window.GeneratedForms || {};`);
    jsLines.push(`window.GeneratedForms[${JSON.stringify(nameKey)}] = { schema: ${variableName} };`);

  return jsLines.join('\n') + '\n';
}

function outputFormToTextarea(fields, formName, textareaId = 'output') {
  const code = buildFormSchemaCode(fields, formName);
  try {
    const ta = document.getElementById(textareaId);
    if (ta) ta.value = code;
  } catch (e) {
    // ignore
  }
  return code;
}

window.buildFormSchemaCode = buildFormSchemaCode;
window.outputFormToTextarea = outputFormToTextarea;

