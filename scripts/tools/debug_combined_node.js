const fs = require('fs');
const path = require('path');

// Minimal reproduction of buildCombinedCode + loading of loader + all Functions files
function buildCombinedCode(loaderCode, functionsCode) {
  let functions = (functionsCode || '').replace(/<script>/gi, '').replace(/<\/script>/gi, '');
  const headerRegex = /\/\/\s*-+\s*(.+?)\s*-+\s*\n/g;
  const headers = [];
  let hmatch;
  while ((hmatch = headerRegex.exec(functions)) !== null) {
    headers.push({ raw: hmatch[0], file: hmatch[1], index: hmatch.index });
  }
  let functionsCombined = '';
  if (headers.length === 0) functionsCombined = functions;
  else {
    const preamble = functions.slice(0, headers[0].index);
    const constRegex = /(^\s*const\s+[a-zA-Z0-9_]+\s*=([\s\S]*?)?;\s*)/gm;
    const preVars = [];
    let vmatch;
    while ((vmatch = constRegex.exec(preamble)) !== null) preVars.push(vmatch[0]);
    const sections = [];
    for (let i = 0; i < headers.length; i++) {
      const start = headers[i].index + headers[i].raw.length;
      const end = i + 1 < headers.length ? headers[i + 1].index : functions.length;
      const content = functions.slice(start, end);
      sections.push({ file: headers[i].file, content });
    }
    const varsBySection = {};
    sections.forEach(s => { varsBySection[s.file] = []; });
    const remainingVars = [];
    preVars.forEach(v => {
      const nameMatch = v.match(/const\s+([a-zA-Z0-9_]+)\s*=/);
      if (!nameMatch) { remainingVars.push(v); return; }
      const name = nameMatch[1];
      let assigned = false;
      for (const s of sections) {
        const base = s.file.replace(/^.*[\\\\/]/, '').replace(/\.js$/, '');
        if (name === base || name.startsWith(base + '_') || name.toLowerCase().includes(base.toLowerCase())) {
          varsBySection[s.file].push(v); assigned = true; break;
        }
      }
      if (!assigned) remainingVars.push(v);
    });
    const preambleNoVars = preamble.replace(constRegex, '').trim();
    if (preambleNoVars) functionsCombined += preambleNoVars + '\n\n';
    if (remainingVars.length) functionsCombined += remainingVars.join('') + '\n';
    sections.forEach(s => {
      functionsCombined += `// ----- ${s.file} -----\n`;
      if (varsBySection[s.file] && varsBySection[s.file].length) functionsCombined += varsBySection[s.file].join('') + '\n';
      functionsCombined += s.content.trim() + '\n\n';
    });
  }
  let combined = (loaderCode || '') + '\n' + functionsCombined;
  combined = combined.replace(/<script>/gi, '').replace(/<\/script>/gi, '');
  combined = combined.replace(/\n{3,}/g, '\n\n').trim();
  try { new Function(combined); console.log('No syntax errors detected.'); }
  catch (e) {
    console.error('\nSYNTAX ERROR:', e.message, '\n---- snippet (first 200 lines) ----');
    const lines = combined.split('\n').slice(0,200);
    lines.forEach((ln,i) => console.error(`${String(i+1).padStart(4,' ')}: ${ln}`));
    process.exitCode = 2;
  }
}

// Build loaderCode: read scripts/loader.js and prefix protective vars (with real newlines)
const repoRoot = path.resolve(__dirname, '..', '..');
const loaderPath = path.join(repoRoot, 'CodeGenerator', 'scripts', 'loader.js');
let loaderCode = '';
try {
  const loaderContent = fs.readFileSync(loaderPath, 'utf8');
  const loaderPrefix = "if (typeof JavaScriptURL === 'undefined') { var JavaScriptURL = ''; }\nconst COMBINED_GENERATED = true;\n";
  // Short-circuit DOMContentLoaded in the loader content same as generator does
  const safeLoaderContent = loaderContent.replace(/document\.addEventListener\(\s*['\"]DOMContentLoaded['\"]\s*,\s*\(\)\s*=>\s*{/, "document.addEventListener('DOMContentLoaded', () => { if (typeof COMBINED_GENERATED !== 'undefined' && COMBINED_GENERATED) { console.log('Combined mode: skipping external loader actions'); return; } ");
  loaderCode = '<script>\n' + loaderPrefix + '\n' + safeLoaderContent + '\n</script>';
} catch (e) { loaderCode = `// ERROR loading loader.js: ${e.message}\n`; }

// Assemble functions: read all Files under CodeGenerator/Functions recursively
function gatherFunctions() {
  const baseDir = path.join(repoRoot, 'CodeGenerator', 'Functions');
  const files = [];
  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p); else if (ent.isFile() && ent.name.endsWith('.js')) files.push(p);
    });
  }
  walk(baseDir);
  let functionsCode = '';
  files.sort();
  files.forEach(f => {
    const rel = path.relative(path.join(repoRoot, 'CodeGenerator'), f).replace(/\\/g,'/');
    functionsCode += `\n// ----- ${path.basename(f)} -----\n` + fs.readFileSync(f, 'utf8') + '\n';
  });
  return functionsCode;
}

const functionsCode = gatherFunctions();
buildCombinedCode(loaderCode, functionsCode);
