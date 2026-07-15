#!/usr/bin/env node
/**
 * ============================================================
 *  CABLINK REALITY ORCHESTRATOR AUDIT
 *  cablink_reality_doctor.js
 * ============================================================
 *
 * Purpose: discover the REAL runtime architecture of CabLink —
 * which functions are actually loaded, which are dead/duplicate,
 * which frontend calls actually reach a real backend route, and
 * which code paths are still fake/simulated — without adding any
 * new patches, bridges, or features.
 *
 * Usage:
 *   node cablink_reality_doctor.js scan          -> static code audit
 *   node cablink_reality_doctor.js diagnose       -> scan + live API health test
 *   node cablink_reality_doctor.js fix-report      -> scan + diagnose + write reports
 *   node cablink_reality_doctor.js all             -> same as fix-report
 *
 * Outputs (written to CWD):
 *   CABLINK_REALITY_GRAPH.json
 *   CABLINK_DEAD_CODE_REPORT.json
 *   CABLINK_TRUTH_REPORT.md
 *
 * No external dependencies. Node core only (fs, path, http).
 * This tool never assumes something works — it only reports what
 * it can actually verify from the files and (optionally) a live
 * backend on http://localhost:3000.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = process.cwd();
const MODE = (process.argv[2] || 'scan').toLowerCase();

// ---------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------

const TARGET_FUNCTIONS = [
  'bookRide',
  'toggleDriverMode',
  'simulateRide',
  'addDriverRequest',
  'pollForRideRequests',
  'createRide',
  'acceptRide',
  'completeRide',
  'calculateFare'
];

const FAKE_PATTERNS = [
  { key: 'simulate', re: /\bsimulate\w*/gi },
  { key: 'setTimeout', re: /\bsetTimeout\s*\(/gi },
  { key: 'Math.random', re: /Math\.random\s*\(/gi },
  { key: 'mock', re: /\bmock\w*/gi },
  { key: 'fake', re: /\bfake\w*/gi },
  { key: 'demo', re: /\bdemo\w*/gi },
  { key: 'test mode', re: /test\s*mode/gi },
  { key: 'localStorage', re: /\blocalStorage\b/gi }
];

const REQUIRED_ENDPOINTS = [
  { method: 'GET', p: '/api/health' },
  { method: 'POST', p: '/api/rides' },
  { method: 'GET', p: '/api/rides' },
  { method: 'POST', p: '/api/drivers/online' },
  { method: 'POST', p: '/api/drivers/offline' },
  { method: 'GET', p: '/api/drivers/online' }
];

const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.html']);

// Directories we never walk into. Deliberately NOT ignoring
// backend/ frontend/ config/ database/ scripts/ etc. — those are
// exactly the places truth lives.
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'archive', 'logs',
  'migration_backup', '.vscode', '.idea'
]);

const DEAD_CODE_NAME_HINTS = /^(cablink_phase\d|cablink_.*_(install|patch|bridge|engine|fix|audit|test|report|repair|cleanup|doctor)|install_|cleanup_|repair_)/i;
const BACKUP_FILE_HINTS = /(\.backup_|_backup|backup_before|index_before_|\.bak)/i;

// ---------------------------------------------------------------
// FILESYSTEM WALK
// ---------------------------------------------------------------

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      const ext = path.extname(entry.name);
      if (SCAN_EXTENSIONS.has(ext)) {
        out.push(full);
      }
    }
  }
  return out;
}

function relative(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function lineNumberAt(content, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

// Given content and an index pointing at (or before) a function
// signature, find the matching closing brace for the FIRST `{`
// that appears at or after that index. Returns [startIdx, endIdx]
// (endIdx exclusive, points just after the matching `}`), or null.
function extractBraceBody(content, fromIndex) {
  const openIdx = content.indexOf('{', fromIndex);
  if (openIdx === -1) return null;
  let depth = 0;
  for (let i = openIdx; i < content.length; i++) {
    const c = content[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        return [openIdx, i + 1];
      }
    }
  }
  return [openIdx, content.length]; // unbalanced — return to EOF
}

// ---------------------------------------------------------------
// STEP 1: FUNCTION OWNERSHIP SCAN
// ---------------------------------------------------------------

function findFunctionDefinitions(files) {
  // name -> [ {file, line, kind, bodyRange:[s,e]} ]
  const result = {};
  TARGET_FUNCTIONS.forEach(n => (result[n] = []));

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    const relFile = relative(file);

    for (const name of TARGET_FUNCTIONS) {
      const patterns = [
        { re: new RegExp(`\\bfunction\\s+${name}\\s*\\(`, 'g'), kind: 'declaration' },
        { re: new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*async\\s*function`, 'g'), kind: 'const-async-function' },
        { re: new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*function`, 'g'), kind: 'const-function' },
        { re: new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*async\\s*\\(`, 'g'), kind: 'const-async-arrow' },
        { re: new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>`, 'g'), kind: 'const-arrow' },
        { re: new RegExp(`window\\.${name}\\s*=\\s*async\\s*function`, 'g'), kind: 'window-override-async' },
        { re: new RegExp(`window\\.${name}\\s*=\\s*function`, 'g'), kind: 'window-override' }
      ];

      for (const { re, kind } of patterns) {
        let m;
        re.lastIndex = 0;
        while ((m = re.exec(content)) !== null) {
          const line = lineNumberAt(content, m.index);
          const bodyRange = extractBraceBody(content, m.index);
          result[name].push({
            file: relFile,
            line,
            kind,
            isWindowOverride: kind.startsWith('window-override'),
            bodyRange
          });
        }
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------
// STEP 1b: SCRIPT LOAD ORDER (from index.html <script> tags)
// ---------------------------------------------------------------

function getScriptLoadOrder() {
  const indexPath = path.join(ROOT, 'index.html');
  if (!fs.existsSync(indexPath)) return { order: [], inlineRanges: [] };
  const content = fs.readFileSync(indexPath, 'utf8');
  const order = [];
  const inlineRanges = [];
  const scriptTagRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  let idx = 0;
  while ((m = scriptTagRe.exec(content)) !== null) {
    const attrs = m[1];
    const body = m[2];
    const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      order.push({ order: idx, type: 'src', src: srcMatch[1] });
    } else if (body.trim().length > 0) {
      const bodyStart = m.index + m[0].indexOf(body);
      order.push({
        order: idx,
        type: 'inline',
        startLine: lineNumberAt(content, bodyStart),
        endLine: lineNumberAt(content, bodyStart + body.length)
      });
      inlineRanges.push([bodyStart, bodyStart + body.length]);
    }
    idx++;
  }
  return { order, inlineRanges };
}

// Resolve whether a given definition (file + line, for index.html
// specifically) is inline-loaded, and give every definition a
// "load position" number so we can say which one wins (JS: last
// assignment wins for reassignments; for plain function
// declarations, the LAST <script> to define window.NAME wins if
// there's any reassignment, otherwise hoisting means the physically
// last `function NAME(){}` in the same scope wins on redeclare).
function annotateLoadOrder(defsByName, scriptOrder) {
  // Build a lookup: for src-referenced files, their position in load order.
  const srcOrderMap = {};
  scriptOrder.order.forEach(entry => {
    if (entry.type === 'src') {
      // normalize path a bit (strip leading ./ )
      const norm = entry.src.replace(/^\.\//, '');
      srcOrderMap[norm] = entry.order;
    }
  });

  const annotated = {};
  for (const name of Object.keys(defsByName)) {
    annotated[name] = defsByName[name].map(def => {
      let loadOrder = null;
      let loadedInBrowser = null; // true/false/null(unknown - not html-related file)
      if (def.file === 'index.html') {
        loadOrder = 0.5; // inline script(s); refine by line if needed
        loadedInBrowser = true;
      } else if (srcOrderMap[def.file] !== undefined) {
        loadOrder = srcOrderMap[def.file];
        loadedInBrowser = true;
      } else if (def.file.endsWith('.html')) {
        loadOrder = null;
        loadedInBrowser = null;
      } else if (def.file.startsWith('backend/')) {
        loadOrder = null;
        loadedInBrowser = false; // backend files never load in browser
      } else {
        loadOrder = null;
        loadedInBrowser = false; // .js file not referenced by any <script src> in index.html
      }
      return Object.assign({}, def, { loadOrder, loadedInBrowser });
    });

    // Determine the "active" (winning) version among browser-loaded defs:
    // last one in document/script order wins (rough but honest JS rule).
    const loaded = annotated[name].filter(d => d.loadedInBrowser);
    loaded.sort((a, b) => {
      if (a.loadOrder !== b.loadOrder) return a.loadOrder - b.loadOrder;
      return a.line - b.line;
    });
    const active = loaded.length ? loaded[loaded.length - 1] : null;
    annotated[name].forEach(d => {
      d.isActive = active
        ? d.file === active.file && d.line === active.line && d.kind === active.kind
        : false;
    });
  }
  return annotated;
}

// ---------------------------------------------------------------
// STEP 2: FAKE ENGINE DETECTION
// ---------------------------------------------------------------

function scanFakePatterns(files, defsByName) {
  // Build quick lookup of "production" body ranges per file (from
  // bookRide/toggleDriverMode/createRide/acceptRide/completeRide/
  // pollForRideRequests/calculateFare — i.e. everything except
  // simulateRide, which is explicitly allowed to be fake).
  const PRODUCTION_FN = TARGET_FUNCTIONS.filter(n => n !== 'simulateRide');

  const findings = []; // {file, line, pattern, snippet, classification, context}

  for (const file of files) {
    const relFile = relative(file);
    if (path.basename(file) === 'cablink_reality_doctor.js') continue;
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    const isSimFile = /simulat|mock|fake|demo/i.test(path.basename(file));

    // production ranges present in THIS file
    const prodRanges = [];
    for (const fn of PRODUCTION_FN) {
      (defsByName[fn] || []).forEach(def => {
        if (def.file === relFile && def.bodyRange) prodRanges.push(def.bodyRange);
      });
    }
    // simulateRide ranges present in this file (explicitly test-only)
    const simRanges = [];
    (defsByName['simulateRide'] || []).forEach(def => {
      if (def.file === relFile && def.bodyRange) simRanges.push(def.bodyRange);
    });

    for (const { key, re } of FAKE_PATTERNS) {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(content)) !== null) {
        const idx = m.index;
        const inProd = prodRanges.some(([s, e]) => idx >= s && idx < e);
        const inSim = simRanges.some(([s, e]) => idx >= s && idx < e);

        let classification;
        if (inProd) classification = 'RED';
        else if (inSim) classification = 'GREEN';
        else if (isSimFile) classification = 'GREEN';
        else classification = 'YELLOW';

        findings.push({
          file: relFile,
          line: lineNumberAt(content, idx),
          pattern: key,
          classification,
          note: inProd
            ? 'inside a production function body'
            : inSim
            ? 'inside simulateRide() — acceptable test path'
            : isSimFile
            ? 'file name indicates test/demo utility'
            : 'context unclear — verify manually'
        });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------
// STEP 3: BACKEND ROUTE SCAN
// ---------------------------------------------------------------

function scanBackendRoutes(files) {
  const routeRe = /\b(app|router)\.(get|post|put|delete|patch)\s*\(\s*(['"`])([^'"`]+)\3/gi;
  const routes = [];
  for (const file of files) {
    const relFile = relative(file);
    if (!relFile.startsWith('backend/') && !relFile.includes('/routes/') && relFile !== 'backend/server.js') {
      // still scan any file, but we only really expect routes under backend/
      if (!/route/i.test(relFile) && !relFile.startsWith('backend')) continue;
    }
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    let m;
    routeRe.lastIndex = 0;
    while ((m = routeRe.exec(content)) !== null) {
      routes.push({
        file: relFile,
        line: lineNumberAt(content, m.index),
        method: m[2].toUpperCase(),
        path: m[4]
      });
    }
  }
  return routes;
}

function checkRequiredEndpoints(routes) {
  return REQUIRED_ENDPOINTS.map(req => {
    const match = routes.find(r => r.method === req.method && r.path === req.p);
    return {
      method: req.method,
      path: req.p,
      status: match ? 'PRESENT' : 'MISSING',
      definedAt: match ? `${match.file}:${match.line}` : null
    };
  });
}

// ---------------------------------------------------------------
// STEP 4: FRONTEND FETCH / API CALL SCAN
// ---------------------------------------------------------------

// Given content and the index of the "(" that opens a call, return the
// index just after its matching ")" (simple depth counter; ignores
// parens inside string literals, which is an acceptable approximation
// for this audit's purposes).
function findMatchingParenEnd(content, openParenIdx) {
  let depth = 0;
  for (let i = openParenIdx; i < content.length; i++) {
    const c = content[i];
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return content.length;
}

function scanFrontendFetches(files, defsByName) {
  const fetchStartRe = /fetch\s*\(/g;
  const calls = [];

  // build reverse lookup: for a given file, list of {name, bodyRange}
  const fnRangesByFile = {};
  for (const name of Object.keys(defsByName)) {
    for (const def of defsByName[name]) {
      if (!def.bodyRange) continue;
      fnRangesByFile[def.file] = fnRangesByFile[def.file] || [];
      fnRangesByFile[def.file].push({ name, range: def.bodyRange });
    }
  }

  for (const file of files) {
    const relFile = relative(file);
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    let m;
    fetchStartRe.lastIndex = 0;
    while ((m = fetchStartRe.exec(content)) !== null) {
      const idx = m.index;
      const openParenIdx = idx + m[0].length - 1;
      const endIdx = findMatchingParenEnd(content, openParenIdx);
      const callText = content.slice(idx, endIdx);

      const urlMatch = callText.match(/^fetch\s*\(\s*(['"`])([^'"`]*)\1/);
      if (!urlMatch || !urlMatch[2].includes('/api/')) continue;
      const endpoint = urlMatch[2];

      const methodMatch = callText.match(/method\s*:\s*['"`](\w+)['"`]/i);
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

      let callerFn = null;
      const ranges = fnRangesByFile[relFile] || [];
      for (const r of ranges) {
        if (idx >= r.range[0] && idx < r.range[1]) {
          callerFn = r.name;
          break;
        }
      }

      calls.push({
        file: relFile,
        line: lineNumberAt(content, idx),
        endpoint,
        method,
        calledFromFunction: callerFn
      });
    }
  }
  return calls;
}

// ---------------------------------------------------------------
// STEP 5: RUNTIME CONNECTION MAP
// ---------------------------------------------------------------

function buildConnectionMap(fetchCalls, backendRoutes) {
  const flow = [
    { step: 'bookRide() -> POST /api/rides', fn: 'bookRide', method: 'POST', p: '/api/rides' },
    { step: 'createRide() -> POST /api/rides', fn: 'createRide', method: 'POST', p: '/api/rides' },
    { step: 'toggleDriverMode() -> POST /api/drivers/online', fn: 'toggleDriverMode', method: 'POST', p: '/api/drivers/online' },
    { step: 'pollForRideRequests() -> GET /api/rides', fn: 'pollForRideRequests', method: 'GET', p: '/api/rides' },
    { step: 'acceptRide() -> ride acceptance endpoint', fn: 'acceptRide', method: null, p: null },
    { step: 'completeRide() -> ride completion / reward trigger', fn: 'completeRide', method: null, p: null }
  ];

  return flow.map(step => {
    const frontendCall = fetchCalls.find(c => c.calledFromFunction === step.fn &&
      (step.p ? c.endpoint.includes(step.p) : true) &&
      (step.method ? c.method === step.method : true));
    const backendMatch = step.p
      ? backendRoutes.find(r => r.method === step.method && r.path === step.p)
      : null;

    let status;
    if (frontendCall && backendMatch) status = 'GREEN';
    else if (frontendCall || backendMatch) status = 'YELLOW';
    else status = 'RED';

    return {
      step: step.step,
      frontendCall: frontendCall || null,
      backendRoute: backendMatch || null,
      status
    };
  });
}

// ---------------------------------------------------------------
// STEP 6: DEAD CODE DETECTION
// ---------------------------------------------------------------

function scanDeadCode(allProjectFiles, scriptOrder) {
  const referencedSrc = new Set(
    scriptOrder.order.filter(e => e.type === 'src').map(e => e.src.replace(/^\.\//, ''))
  );

  // also check backend require() references
  const requiredByBackend = new Set();
  for (const file of allProjectFiles) {
    const relFile = relative(file);
    if (!relFile.startsWith('backend/') && relFile !== 'backend/server.js') continue;
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    const reqRe = /require\s*\(\s*['"`](\.[^'"`]+)['"`]\s*\)/g;
    let m;
    while ((m = reqRe.exec(content)) !== null) {
      let resolved = path.normalize(path.join(path.dirname(relFile), m[1]));
      if (!path.extname(resolved)) resolved += '.js';
      requiredByBackend.add(resolved.split(path.sep).join('/'));
    }
  }

  const candidates = [];
  for (const file of allProjectFiles) {
    const relFile = relative(file);
    const base = path.basename(relFile);
    if (relFile === 'index.html' || relFile === 'backend/server.js') continue;
    if (base === 'cablink_reality_doctor.js') continue;

    const looksLikePhaseOrInstaller = DEAD_CODE_NAME_HINTS.test(base);
    const looksLikeBackup = BACKUP_FILE_HINTS.test(base);
    if (!looksLikePhaseOrInstaller && !looksLikeBackup) continue;

    const referenced = referencedSrc.has(relFile) || requiredByBackend.has(relFile);
    candidates.push({
      file: relFile,
      reason: looksLikeBackup ? 'backup/snapshot file' : 'phase installer / one-off audit script',
      referencedByIndexHtml: referencedSrc.has(relFile),
      requiredByBackend: requiredByBackend.has(relFile),
      recommendation: referenced
        ? 'still wired in — verify before touching'
        : 'not referenced by index.html <script> tags or backend require() — safe to archive (do not delete outright)'
    });
  }
  return candidates;
}

// ---------------------------------------------------------------
// STEP 7: LIVE API HEALTH TEST
// ---------------------------------------------------------------

function httpGetJson(pathName, port = 3000, timeoutMs = 2000) {
  return new Promise(resolve => {
    const req = http.get({ host: 'localhost', port, path: pathName, timeout: timeoutMs }, res => {
      let body = '';
      res.on('data', d => (body += d));
      res.on('end', () => {
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: body.slice(0, 500) });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: null, error: 'timeout' });
    });
    req.on('error', err => {
      resolve({ ok: false, status: null, error: err.code || err.message });
    });
  });
}

async function runLiveHealthTests() {
  const targets = [
    { method: 'GET', p: '/api/health' },
    { method: 'GET', p: '/api/rides' },
    { method: 'GET', p: '/api/drivers/online' }
  ];
  const results = [];
  for (const t of targets) {
    const r = await httpGetJson(t.p);
    results.push({
      method: t.method,
      path: t.p,
      result: r.ok ? 'PASS' : 'FAIL',
      httpStatus: r.status,
      error: r.error || null,
      bodyPreview: r.body || null
    });
  }
  return results;
}

// ---------------------------------------------------------------
// REPORT WRITERS
// ---------------------------------------------------------------

function writeJson(filename, data) {
  fs.writeFileSync(path.join(ROOT, filename), JSON.stringify(data, null, 2), 'utf8');
  console.log(`  -> wrote ${filename}`);
}

function classifySummaryColor(list) {
  if (list.some(x => x.status === 'RED')) return 'RED';
  if (list.some(x => x.status === 'YELLOW')) return 'YELLOW';
  return 'GREEN';
}

function buildTruthReportMarkdown(graph) {
  const lines = [];
  lines.push('# CABLINK TRUTH REPORT');
  lines.push('');
  lines.push(`Generated: ${graph.meta.generatedAt}`);
  lines.push(`Mode: ${graph.meta.mode}`);
  lines.push('');

  lines.push('## 1. What is real');
  lines.push('');
  lines.push('Backend routes actually found on disk:');
  if (graph.backend.routes.length === 0) {
    lines.push('- none found');
  } else {
    graph.backend.routes.forEach(r => lines.push(`- \`${r.method} ${r.path}\` — ${r.file}:${r.line}`));
  }
  lines.push('');
  lines.push('Required endpoint check:');
  graph.backend.requiredEndpointStatus.forEach(e => {
    lines.push(`- ${e.status === 'PRESENT' ? '✅' : '❌'} \`${e.method} ${e.path}\`${e.definedAt ? ' — ' + e.definedAt : ''}`);
  });
  lines.push('');

  lines.push('## 2. What is fake');
  lines.push('');
  const redFakes = graph.fakeEngine.findings.filter(f => f.classification === 'RED');
  const yellowFakes = graph.fakeEngine.findings.filter(f => f.classification === 'YELLOW');
  lines.push(`RED (fake code sitting inside a production function): ${redFakes.length}`);
  redFakes.slice(0, 30).forEach(f => lines.push(`- ${f.file}:${f.line} — \`${f.pattern}\` (${f.note})`));
  lines.push('');
  lines.push(`YELLOW (unclear / needs manual look): ${yellowFakes.length}`);
  yellowFakes.slice(0, 30).forEach(f => lines.push(`- ${f.file}:${f.line} — \`${f.pattern}\` (${f.note})`));
  lines.push('');

  lines.push('## 3. What is connected');
  lines.push('');
  graph.connectionMap.forEach(c => {
    const icon = c.status === 'GREEN' ? '✅' : c.status === 'YELLOW' ? '⚠️' : '❌';
    lines.push(`- ${icon} ${c.step}`);
    if (c.frontendCall) lines.push(`   - frontend: ${c.frontendCall.file}:${c.frontendCall.line} calls \`${c.frontendCall.method} ${c.frontendCall.endpoint}\``);
    else lines.push('   - frontend: no matching fetch() call found');
    if (c.backendRoute) lines.push(`   - backend: ${c.backendRoute.file}:${c.backendRoute.line} defines \`${c.backendRoute.method} ${c.backendRoute.path}\``);
    else lines.push('   - backend: no matching route found');
  });
  lines.push('');

  lines.push('## 4. What is broken');
  lines.push('');
  const brokenSteps = graph.connectionMap.filter(c => c.status !== 'GREEN');
  if (brokenSteps.length === 0) lines.push('- No broken links detected in the static scan.');
  else brokenSteps.forEach(c => lines.push(`- ${c.step} — status ${c.status}`));
  lines.push('');
  lines.push('Duplicate function definitions (JS "last one wins" risk):');
  Object.keys(graph.functionOwnership).forEach(name => {
    const defs = graph.functionOwnership[name];
    if (defs.length > 1) {
      lines.push(`- \`${name}\` defined ${defs.length}x:`);
      defs.forEach(d => {
        const tag = d.isActive ? ' [ACTIVE — this one wins at runtime]' : d.loadedInBrowser === false ? ' [not loaded in browser]' : '';
        lines.push(`   - ${d.file}:${d.line} (${d.kind})${tag}`);
      });
    }
  });
  lines.push('');
  if (graph.liveApi) {
    lines.push('Live API health test:');
    graph.liveApi.forEach(r => {
      lines.push(`- ${r.result === 'PASS' ? '✅' : '❌'} ${r.method} ${r.path} — ${r.result}${r.error ? ' (' + r.error + ')' : ''}`);
    });
    lines.push('');
  }

  lines.push('## 5. Exact fixes required');
  lines.push('');
  let fixNum = 1;
  graph.backend.requiredEndpointStatus.filter(e => e.status === 'MISSING').forEach(e => {
    lines.push(`${fixNum++}. Add backend route \`${e.method} ${e.path}\` — currently missing.`);
  });
  Object.keys(graph.functionOwnership).forEach(name => {
    const defs = graph.functionOwnership[name];
    const dupesLoaded = defs.filter(d => d.loadedInBrowser);
    if (dupesLoaded.length > 1) {
      const dead = dupesLoaded.filter(d => !d.isActive);
      lines.push(`${fixNum++}. \`${name}\` has ${dupesLoaded.length} browser-loaded definitions. Keep the one at ${dupesLoaded.find(d => d.isActive) ? dupesLoaded.find(d => d.isActive).file + ':' + dupesLoaded.find(d => d.isActive).line : 'unknown'}; remove/consolidate: ${dead.map(d => d.file + ':' + d.line).join(', ')}.`);
    }
  });
  graph.connectionMap.filter(c => c.status === 'RED').forEach(c => {
    lines.push(`${fixNum++}. Wire up: ${c.step} — no working link found in either frontend or backend.`);
  });
  if (fixNum === 1) lines.push('- No high-priority fixes identified by the static scan.');
  lines.push('');

  lines.push('## 6. Production readiness score');
  lines.push('');
  const total = graph.connectionMap.length;
  const green = graph.connectionMap.filter(c => c.status === 'GREEN').length;
  const yellow = graph.connectionMap.filter(c => c.status === 'YELLOW').length;
  const score = Math.round(((green + yellow * 0.5) / total) * 100);
  lines.push(`**${score}/100** — based on ${green}/${total} core ride-lifecycle links fully connected, ${yellow}/${total} partially connected.`);
  lines.push('');
  lines.push('This score reflects only what this static/live scan could verify. It is not a substitute for an actual end-to-end manual ride test.');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------

async function main() {
  console.log('============================================================');
  console.log(' CABLINK REALITY ORCHESTRATOR AUDIT');
  console.log(` mode: ${MODE}   root: ${ROOT}`);
  console.log('============================================================');

  const files = walk(ROOT, []);
  console.log(`Scanned file count: ${files.length}`);

  const scriptOrder = getScriptLoadOrder();
  const rawDefs = findFunctionDefinitions(files);
  const functionOwnership = annotateLoadOrder(rawDefs, scriptOrder);

  const fakeFindings = scanFakePatterns(files, functionOwnership);
  const backendRoutes = scanBackendRoutes(files);
  const requiredEndpointStatus = checkRequiredEndpoints(backendRoutes);
  const fetchCalls = scanFrontendFetches(files, functionOwnership);
  const connectionMap = buildConnectionMap(fetchCalls, backendRoutes);
  const deadCode = scanDeadCode(files, scriptOrder);

  const graph = {
    meta: {
      generatedAt: new Date().toISOString(),
      mode: MODE,
      root: ROOT,
      filesScanned: files.length
    },
    frontend: {
      scriptLoadOrder: scriptOrder.order,
      fetchCalls
    },
    backend: {
      routes: backendRoutes,
      requiredEndpointStatus
    },
    functionOwnership,
    fakeEngine: {
      findings: fakeFindings,
      summary: {
        RED: fakeFindings.filter(f => f.classification === 'RED').length,
        YELLOW: fakeFindings.filter(f => f.classification === 'YELLOW').length,
        GREEN: fakeFindings.filter(f => f.classification === 'GREEN').length
      }
    },
    connectionMap,
    deadCodeCandidates: deadCode,
    recommendedFixes: [] // filled in report generation; kept here for schema completeness
  };

  if (MODE === 'diagnose' || MODE === 'fix-report' || MODE === 'all') {
    console.log('Running live API health tests against http://localhost:3000 ...');
    graph.liveApi = await runLiveHealthTests();
    graph.liveApi.forEach(r => console.log(`  ${r.result} ${r.method} ${r.path} ${r.error ? '(' + r.error + ')' : ''}`));
  }

  console.log('');
  console.log(`Function ownership: ${TARGET_FUNCTIONS.length} tracked functions`);
  Object.keys(functionOwnership).forEach(name => {
    const n = functionOwnership[name].length;
    if (n > 1) console.log(`  DUPLICATE: ${name} defined ${n}x`);
  });
  console.log(`Fake-pattern findings: RED=${graph.fakeEngine.summary.RED} YELLOW=${graph.fakeEngine.summary.YELLOW} GREEN=${graph.fakeEngine.summary.GREEN}`);
  console.log(`Backend routes found: ${backendRoutes.length}`);
  requiredEndpointStatus.forEach(e => console.log(`  ${e.status === 'PRESENT' ? '✅' : '❌'} ${e.method} ${e.path}`));
  console.log(`Dead code candidates: ${deadCode.length}`);

  if (MODE === 'fix-report' || MODE === 'all') {
    console.log('');
    console.log('Writing reports...');
    writeJson('CABLINK_REALITY_GRAPH.json', graph);
    writeJson('CABLINK_DEAD_CODE_REPORT.json', { generatedAt: graph.meta.generatedAt, candidates: deadCode });
    const md = buildTruthReportMarkdown(graph);
    fs.writeFileSync(path.join(ROOT, 'CABLINK_TRUTH_REPORT.md'), md, 'utf8');
    console.log('  -> wrote CABLINK_TRUTH_REPORT.md');
  } else if (MODE === 'scan') {
    writeJson('CABLINK_REALITY_GRAPH.json', graph);
  }

  console.log('');
  console.log('Done. This tool only reports what it could verify from files');
  console.log('(and, in diagnose/fix-report mode, a live localhost:3000 check).');
  console.log('It made zero changes to any source file.');
}

main().catch(err => {
  console.error('cablink_reality_doctor.js crashed:', err);
  process.exit(1);
});
