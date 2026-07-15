#!/usr/bin/env node
/**
 * CABLINK OMNISYSTEM AUDITOR v2
 * Fixes: (1) folder-based classification now wins over filename keywords,
 * (2) tracks ALL index.html entrypoints separately instead of overwriting.
 * Read-only. Usage: node cablink_doctor.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'logs', 'archive', 'migration_backup']);

const REAL_SIGNALS = [
  { re: /\bfetch\s*\(/g, tag: 'fetch()' },
  { re: /\baxios\.\w+\s*\(/g, tag: 'axios' },
  { re: /new\s+XMLHttpRequest/g, tag: 'XMLHttpRequest' },
  { re: /app\.(get|post|put|delete|patch)\s*\(/g, tag: 'express-route' },
  { re: /router\.(get|post|put|delete|patch)\s*\(/g, tag: 'express-router' },
  { re: /new\s+ethers\.Contract/g, tag: 'ethers-contract' },
  { re: /\.transfer\s*\(/g, tag: 'onchain-transfer' },
  { re: /tx\.wait\s*\(/g, tag: 'onchain-wait' },
  { re: /\bio\.emit\s*\(|\bsocket\.emit\s*\(/g, tag: 'websocket-emit' },
  { re: /mongoose\.model|new\s+sqlite3|db\.query|db\.collection/g, tag: 'database' },
];

const FAKE_SIGNALS = [
  { re: /function\s+simulate\w*\s*\(/gi, tag: 'simulate-function' },
  { re: /Math\.random\(\)/g, tag: 'math-random' },
  { re: /setTimeout\s*\(/g, tag: 'setTimeout' },
  { re: /localStorage\.(setItem|getItem)/g, tag: 'localStorage' },
  { re: /\bfake\b/gi, tag: 'literal-fake' },
  { re: /\bmock\b/gi, tag: 'literal-mock' },
  { re: /\bdummy\b/gi, tag: 'literal-dummy' },
];

const KEY_FUNCTIONS = [
  'bookRide', 'simulateRide', 'completeRide', 'claimReward',
  'toggleDriverMode', 'addDriverRequest', 'acceptRequest',
  'cancelRide', 'showArrived', 'connectWallet',
];

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return out; }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
function readSafe(file) { try { return fs.readFileSync(file, 'utf8'); } catch (e) { return null; } }
function countMatches(content, re) { const m = content.match(re); return m ? m.length : 0; }

// FIX: folder location checked BEFORE filename keywords
function classifyFile(relPath) {
  const base = path.basename(relPath).toLowerCase();
  const sep = path.sep;
  if (relPath.includes(`${sep}backend${sep}`) || relPath.startsWith('backend' + sep)) return 'backend';
  if (relPath.includes(`${sep}frontend${sep}`) || relPath.startsWith('frontend' + sep)) {
    if (base === 'index.html') return 'entrypoint';
    return 'frontend-module';
  }
  if (base === 'index.html') return 'entrypoint';
  if (/\.html\.backup/.test(base) || /^index_before|^index_backup|^index_react_backup/.test(base)) return 'html-backup';
  if (base.startsWith('cablink_phase')) return 'phase-script';
  if (base.startsWith('cablink_real') || base.startsWith('cablink_reality')) return 'reality-bridge';
  if (base.includes('bridge')) return 'bridge-script';
  if (base.includes('driver')) return 'driver-script';
  if (base.includes('dispatch')) return 'dispatch-script';
  if (base.includes('audit') || base.includes('report') || base.includes('certif')) return 'audit-report-script';
  if (/\.(js)$/.test(base)) return 'other-script';
  if (/\.(json)$/.test(base)) return 'data';
  return 'other';
}

function scanSignals(content) {
  const found = { real: {}, fake: {} };
  for (const s of REAL_SIGNALS) { const n = countMatches(content, s.re); if (n > 0) found.real[s.tag] = n; }
  for (const s of FAKE_SIGNALS) { const n = countMatches(content, s.re); if (n > 0) found.fake[s.tag] = n; }
  return found;
}
function extractFunctions(content) {
  const fns = []; const re = /function\s+(\w+)\s*\(/g; let m;
  while ((m = re.exec(content))) fns.push(m[1]);
  return fns;
}
function extractScriptTags(htmlContent) {
  const tags = []; const re = /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/g; let m;
  while ((m = re.exec(htmlContent))) tags.push(m[1]);
  return tags;
}
function extractApiRoutesDeclared(content) {
  const routes = []; const re = /(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g; let m;
  while ((m = re.exec(content))) routes.push({ method: m[2].toUpperCase(), path: m[3] });
  return routes;
}
function extractApiCallsMade(content) {
  const calls = []; const re = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g; let m;
  while ((m = re.exec(content))) calls.push(m[1]);
  return calls;
}
function extractKeyFunctionVerdicts(content) {
  const results = [];
  for (const fnName of KEY_FUNCTIONS) {
    const re = new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
    const m = content.match(re);
    if (m) {
      const bodySignals = scanSignals(m[1]);
      results.push({
        fn: fnName,
        verdict: Object.keys(bodySignals.real).length > 0 ? 'REAL' : 'FAKE/LOCAL-ONLY',
        realSignals: Object.keys(bodySignals.real),
        fakeSignals: Object.keys(bodySignals.fake),
      });
    }
  }
  return results;
}

console.log('CABLINK OMNISYSTEM AUDITOR v2 — scanning', ROOT, '...\n');

const allFiles = walk(ROOT).filter(f => /\.(js|html|jsx|json)$/.test(f) && !f.includes('.min.js'));

const registry = {
  entrypoint: [], 'html-backup': [], 'phase-script': [], 'reality-bridge': [],
  'bridge-script': [], 'driver-script': [], 'dispatch-script': [], 'audit-report-script': [],
  backend: [], 'frontend-module': [], 'other-script': [], data: [], other: [],
};

const functionRegistry = {};
let backendRoutesDeclared = [];
const entrypoints = {}; // rel path -> { scriptTags, apiCalls, keyFunctions }

for (const file of allFiles) {
  const rel = path.relative(ROOT, file);
  const category = classifyFile(rel);
  const content = readSafe(file);
  if (content == null) continue;

  const signals = scanSignals(content);
  const fns = extractFunctions(content);
  registry[category].push({ file: rel, category, signals, functionCount: fns.length, sizeKB: +(content.length / 1024).toFixed(1) });

  for (const fn of fns) {
    if (!functionRegistry[fn]) functionRegistry[fn] = [];
    functionRegistry[fn].push(rel);
  }

  if (category === 'backend') {
    backendRoutesDeclared = backendRoutesDeclared.concat(
      extractApiRoutesDeclared(content).map(r => ({ ...r, file: rel }))
    );
  }
  if (category === 'entrypoint') {
    entrypoints[rel] = {
      scriptTags: extractScriptTags(content),
      apiCalls: extractApiCallsMade(content),
      keyFunctions: extractKeyFunctionVerdicts(content),
      sizeKB: +(content.length / 1024).toFixed(1),
    };
  }
}

const duplicateFunctions = Object.entries(functionRegistry)
  .filter(([name, files]) => new Set(files).size > 1 && name.length > 3) // skip 1-3 char noise
  .map(([name, files]) => ({ name, definedIn: [...new Set(files)] }))
  .filter(d => d.definedIn.length <= 6); // hide mega-generic collisions, keep meaningful ones

// per-entrypoint connectivity
const entrypointConnectivity = {};
for (const [ep, data] of Object.entries(entrypoints)) {
  const connected = [];
  const disconnected = [];
  for (const call of data.apiCalls) {
    const match = backendRoutesDeclared.find(r => call.includes(r.path) || r.path.includes(call));
    if (match) connected.push({ call, matchedRoute: `${match.method} ${match.path} (${match.file})` });
    else disconnected.push(call);
  }
  entrypointConnectivity[ep] = {
    sizeKB: data.sizeKB,
    scriptTagsLoaded: data.scriptTags,
    apiCallsFound: data.apiCalls,
    connectedToBackend: connected,
    disconnectedCalls: disconnected,
    keyFunctionVerdicts: data.keyFunctions,
  };
}

const orphanBackendRoutes = backendRoutesDeclared.filter(r =>
  !Object.values(entrypoints).some(ep => ep.apiCalls.some(call => call.includes(r.path) || r.path.includes(call)))
);

fs.writeFileSync('runtime_dependency_graph.json', JSON.stringify({
  entrypoints_found: Object.keys(entrypoints),
  entrypoint_connectivity: entrypointConnectivity,
  duplicate_function_definitions: duplicateFunctions,
}, null, 2));

const realityScore = {
  entrypoints_found: Object.keys(entrypoints),
  backend_routes_declared_total: backendRoutesDeclared.length,
  backend_routes_by_file: backendRoutesDeclared.reduce((acc, r) => {
    acc[r.file] = (acc[r.file] || 0) + 1; return acc;
  }, {}),
  backend_routes_orphaned: orphanBackendRoutes.length,
  orphaned_route_list: orphanBackendRoutes.map(r => `${r.method} ${r.path} (${r.file})`),
  rewards_layer_verdict: Object.values(entrypoints).some(ep => ep.keyFunctions.some(k => k.fn === 'claimReward' && k.verdict === 'REAL'))
    ? 'REAL — on-chain transfer detected in claimReward()' : 'FAKE/UNVERIFIED',
  duplicate_function_definitions_meaningful: duplicateFunctions.length,
  note: 'Compare entrypoint_connectivity per file in runtime_dependency_graph.json to find which index.html (if any) actually talks to the backend.',
};
fs.writeFileSync('CABLINK_REALITY_SCORE.json', JSON.stringify(realityScore, null, 2));

const md = [];
md.push('# CabLink Health Report v2\n');
md.push(`## Entrypoints found (${Object.keys(entrypoints).length})`);
for (const [ep, data] of Object.entries(entrypointConnectivity)) {
  md.push(`\n### ${ep} (${data.sizeKB} KB)`);
  md.push(`- Scripts loaded: ${data.scriptTagsLoaded.join(', ') || '(inline only)'}`);
  md.push(`- fetch() calls found: ${data.apiCallsFound.length} — ${data.apiCallsFound.join(', ') || 'none'}`);
  md.push(`- Connected to a real backend route: ${data.connectedToBackend.length}`);
  md.push(`- Key function verdicts:`);
  for (const k of data.keyFunctionVerdicts) md.push(`  - ${k.fn} → ${k.verdict}`);
}
md.push(`\n## Backend routes (${backendRoutesDeclared.length} total, real files)`);
for (const r of backendRoutesDeclared) md.push(`- ${r.method} ${r.path} — ${r.file}`);
md.push(`\n## Orphaned routes (declared, never called by ANY entrypoint): ${orphanBackendRoutes.length}`);
for (const r of orphanBackendRoutes) md.push(`- ${r.method} ${r.path} (${r.file})`);
md.push(`\n## Meaningful duplicate functions (≤6 files, likely real collisions): ${duplicateFunctions.length}`);
for (const d of duplicateFunctions) md.push(`- **${d.name}**: ${d.definedIn.join(' | ')}`);

fs.writeFileSync('CABLINK_HEALTH_REPORT.md', md.join('\n'));
console.log('Done. Wrote runtime_dependency_graph.json, CABLINK_REALITY_SCORE.json, CABLINK_HEALTH_REPORT.md');
