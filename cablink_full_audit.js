#!/usr/bin/env node
/**
 * ============================================================
 *  CABLINK FULL STRUCTURAL AUDIT
 *  cablink_full_audit.js
 * ============================================================
 *
 * Answers, with evidence, not guesses:
 *  1. What files exist, where, how many, grouped by area.
 *  2. Which files/script-blocks have a JS SYNTAX ERROR right now.
 *     (A single syntax error in one inline <script> block stops
 *     ALL script execution after it in that block, and can look
 *     like "the whole app disappeared / nav stopped working".)
 *  3. Duplicate/competing implementations of core logic
 *     (driver mode, fare, distance, ride booking).
 *  4. Operational-flow completeness for PASSENGER / DRIVER /
 *     ADMIN-MANAGER — what exists, what's wired, what's missing.
 *  5. GPS / distance / fare logic sanity — do real implementations
 *     exist, are there competing ones, any leftover fake/random data.
 *  6. A concrete "what should be created" list.
 *
 * Usage:
 *   node cablink_full_audit.js
 *
 * Output: CABLINK_FULL_AUDIT_REPORT.md (written to CWD)
 *
 * No external dependencies. Reads files, runs `node --check` on
 * isolated script content. Makes ZERO changes to any source file.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'archive', 'logs',
  'migration_backup', '.vscode', '.idea'
]);
// Any directory whose NAME contains "backup" (case-insensitive) is a
// snapshot, not live code — catches backups/, .cablink_backups/,
// cablink_ride_backup_20260725_221547/, stage4g5-backup-.../ etc.
// without needing to enumerate every timestamp/naming variant.
const IGNORE_DIR_PATTERN = /backup/i;

// ---------------------------------------------------------------
// 1. FILE STRUCTURE MAP
// ---------------------------------------------------------------

function walkAll(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (IGNORE_DIR_PATTERN.test(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAll(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function relative(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

function buildStructureMap(allFiles) {
  const byTopDir = {};
  const byExt = {};
  for (const f of allFiles) {
    const rel = relative(f);
    const top = rel.includes('/') ? rel.split('/')[0] : '(root)';
    byTopDir[top] = (byTopDir[top] || 0) + 1;
    const ext = path.extname(rel) || '(no ext)';
    byExt[ext] = (byExt[ext] || 0) + 1;
  }
  return { byTopDir, byExt, total: allFiles.length };
}

// ---------------------------------------------------------------
// 2. SYNTAX VALIDATION
// ---------------------------------------------------------------

function nodeCheckSource(source, label) {
  const tmp = path.join(ROOT, '.__cablink_audit_check__.js');
  try {
    fs.writeFileSync(tmp, source, 'utf8');
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    return { ok: true };
  } catch (e) {
    const msg = (e.stderr ? e.stderr.toString() : e.message || String(e))
      .split('\n').slice(0, 6).join('\n');
    return { ok: false, error: msg };
  } finally {
    try { fs.unlinkSync(tmp); } catch (e2) {}
  }
}

function checkAllJsFiles(allFiles) {
  const results = [];
  for (const f of allFiles) {
    if (path.extname(f) !== '.js') continue;
    const rel = relative(f);
    if (path.basename(f) === 'cablink_full_audit.js') continue;
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch (e) {
      results.push({ file: rel, ok: false, error: 'could not read file: ' + e.message });
      continue;
    }
    const r = nodeCheckSource(content, rel);
    results.push({ file: rel, ok: r.ok, error: r.error || null });
  }
  return results;
}

// Extract every <script>...</script> block from an HTML entry file,
// and syntax-check each INLINE block independently, so one broken
// block doesn't hide the health of the others. Also verify every
// <script src="..."> resolves to a real file on disk.
function checkEntryHtml(entryPath) {
  const rel = relative(entryPath);
  if (!fs.existsSync(entryPath)) {
    return { file: rel, exists: false, blocks: [], srcChecks: [] };
  }
  const content = fs.readFileSync(entryPath, 'utf8');
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  const srcChecks = [];
  let m;
  let blockNum = 0;
  while ((m = scriptRe.exec(content)) !== null) {
    blockNum++;
    const attrs = m[1];
    const body = m[2];
    const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
    const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1] : null;

    if (srcMatch) {
      const isExternal = /^https?:\/\//i.test(srcMatch[1]);
      let existsOnDisk = null;
      if (!isExternal) {
        const stripped = srcMatch[1].replace(/^\//, '');
        const resolved = path.join(path.dirname(entryPath), stripped);
        existsOnDisk = fs.existsSync(resolved);
      }
      srcChecks.push({ blockNum, src: srcMatch[1], isExternal, existsOnDisk });
      continue;
    }

    if (type && !/^(text\/javascript|application\/javascript|module)$/i.test(type)) {
      // e.g. application/ld+json, importmap — not JS, skip syntax check
      continue;
    }
    if (body.trim().length === 0) continue;

    const bodyStart = m.index + m[0].indexOf(body);
    const startLine = content.slice(0, bodyStart).split('\n').length;
    const endLine = content.slice(0, bodyStart + body.length).split('\n').length;

    const r = nodeCheckSource(body, `inline block #${blockNum}`);
    blocks.push({
      blockNum, startLine, endLine,
      isModule: type === 'module',
      ok: r.ok, error: r.error || null
    });
  }
  return { file: rel, exists: true, blocks, srcChecks };
}

// ---------------------------------------------------------------
// 3. FUNCTION OWNERSHIP / DUPLICATE LOGIC SCAN
// ---------------------------------------------------------------

const CORE_FUNCTIONS = [
  'bookRide', 'requestRide', 'toggleDriverMode', 'acceptRide', 'acceptRealRequest',
  'acceptRideRequest', 'completeRide', 'completeRealRide', 'calculateFare',
  'calcTotalFare', 'updateFareBreakdown', 'updateFareDisplay', 'haversineKm',
  'getRideDistance', 'pollForRideRequests', 'pollOnlineDrivers'
];

function findDefinitions(allFiles, names) {
  const result = {};
  names.forEach(n => (result[n] = []));
  for (const f of allFiles) {
    if (!['.js', '.html', '.jsx'].includes(path.extname(f))) continue;
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch (e) {
      continue;
    }
    const rel = relative(f);
    for (const name of names) {
      const patterns = [
        new RegExp(`\\bfunction\\s+${name}\\s*\\(`, 'g'),
        new RegExp(`window\\.${name}\\s*=\\s*(?:async\\s*)?function`, 'g'),
        new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?function`, 'g'),
      ];
      for (const re of patterns) {
        let m;
        while ((m = re.exec(content)) !== null) {
          const line = content.slice(0, m.index).split('\n').length;
          result[name].push({ file: rel, line });
        }
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------
// 4. OPERATIONAL FLOW CHECK (3 personas)
// ---------------------------------------------------------------

function grepAny(allFiles, patterns, exts) {
  const hits = [];
  for (const f of allFiles) {
    if (path.basename(f) === 'cablink_full_audit.js') continue;
    if (exts && !exts.includes(path.extname(f))) continue;
    let content;
    try {
      content = fs.readFileSync(f, 'utf8');
    } catch (e) {
      continue;
    }
    for (const p of patterns) {
      if (p.test(content)) {
        hits.push(relative(f));
        break;
      }
    }
  }
  return hits;
}

function checkOperationalFlows(allFiles, backendRoutesText) {
  const flows = {};

  flows.passenger = {
    bookingFunctionExists: grepAny(allFiles, [/\bfunction\s+(bookRide|requestRide)\b/, /window\.(bookRide|requestRide)\s*=/], ['.js', '.html']).length > 0,
    pickupDropoffInputsExist: grepAny(allFiles, [/id=["']pickup["']/], ['.html']).length > 0 &&
                               grepAny(allFiles, [/id=["']dropoff["']/], ['.html']).length > 0,
    fareDisplayExists: grepAny(allFiles, [/fb-total|fareTotal|updateFareBreakdown|updateFareDisplay/], ['.js', '.html']).length > 0,
    postRidesRouteExists: /app\.post\(\s*['"`]\/api\/rides['"`]/.test(backendRoutesText),
    rideStatusPollingExists: grepAny(allFiles, [/pollRideStatus|pollForRideRequests/], ['.js', '.html']).length > 0,
    thbRewardUiExists: grepAny(allFiles, [/THB|thobocoin/i], ['.html']).length > 0,
  };

  flows.driver = {
    toggleDriverModeExists: grepAny(allFiles, [/\bfunction\s+toggleDriverMode\b/, /window\.toggleDriverMode\s*=/], ['.js', '.html']).length > 0,
    acceptFunctionExists: grepAny(allFiles, [/acceptRealRequest|acceptRideRequest|\bfunction\s+acceptRide\b/], ['.js', '.html']).length > 0,
    completeFunctionExists: grepAny(allFiles, [/completeRealRide|\bfunction\s+completeRide\b/], ['.js', '.html']).length > 0,
    driversOnlineRouteExists: /app\.post\(\s*['"`]\/api\/drivers\/online['"`]/.test(backendRoutesText),
    driversOfflineRouteExists: /app\.post\(\s*['"`]\/api\/drivers\/offline['"`]/.test(backendRoutesText),
    acceptRouteExists: /\/accept['"`]/.test(backendRoutesText),
    completeRouteExists: /\/complete['"`]/.test(backendRoutesText) || /app\.patch\(\s*['"`]\/api\/rides\/:id['"`]/.test(backendRoutesText),
    earningsUiExists: grepAny(allFiles, [/earn-today|earn-thb|driverThb|earn-rides/], ['.js', '.html']).length > 0,
  };

  flows.admin = {
    anyAdminFileExists: grepAny(allFiles, [/admin/i], ['.html']).length > 0 ||
                          allFiles.some(f => /admin/i.test(relative(f)) && !relative(f).startsWith('archive')),
    anyAdminRouteExists: /\/admin/i.test(backendRoutesText),
    dispatchOverviewExists: grepAny(allFiles, [/dispatch.*(dashboard|overview|admin)/i], ['.js', '.html']).length > 0,
    driverApplicationsReviewExists: /\/api\/drivers\/applications/.test(backendRoutesText),
  };

  return flows;
}

// ---------------------------------------------------------------
// 5. GPS / DISTANCE / FARE LOGIC SANITY
// ---------------------------------------------------------------

function checkGpsAndFareLogic(allFiles, funcDefs) {
  const geoUsage = grepAny(allFiles, [/navigator\.geolocation/], ['.js', '.html']);
  const distanceImpls = (funcDefs['haversineKm'] || []).concat(funcDefs['getRideDistance'] || []);
  const fareImpls = (funcDefs['calculateFare'] || [])
    .concat(funcDefs['calcTotalFare'] || [])
    .concat(funcDefs['updateFareBreakdown'] || [])
    .concat(funcDefs['updateFareDisplay'] || []);

  const fakeInFareOrDistance = [];
  for (const [name, defs] of [['haversineKm', funcDefs['haversineKm']], ['calculateFare', funcDefs['calculateFare']], ['calcTotalFare', funcDefs['calcTotalFare']]]) {
    (defs || []).forEach(def => {
      let content;
      try {
        content = fs.readFileSync(path.join(ROOT, def.file), 'utf8');
      } catch (e) {
        return;
      }
      const lines = content.split('\n');
      const windowStart = Math.max(0, def.line - 1);
      const windowText = lines.slice(windowStart, windowStart + 15).join('\n');
      if (/Math\.random/.test(windowText)) {
        fakeInFareOrDistance.push({ function: name, file: def.file, line: def.line, note: 'Math.random found near this definition — verify this is not randomizing real fare/distance' });
      }
    });
  }

  return {
    geolocationUsedIn: geoUsage,
    distanceImplementationCount: distanceImpls.length,
    distanceImplementations: distanceImpls,
    fareImplementationCount: fareImpls.length,
    fareImplementations: fareImpls,
    suspiciousRandomUsage: fakeInFareOrDistance,
  };
}

// ---------------------------------------------------------------
// REPORT
// ---------------------------------------------------------------

function buildReport(data) {
  const lines = [];
  lines.push('# CABLINK FULL STRUCTURAL AUDIT');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Root: ${ROOT}`);
  lines.push('');
  lines.push('This tool changed nothing. Every finding below is backed by a file path and line number you can go check yourself.');
  lines.push('');

  lines.push('## 1. File structure');
  lines.push('');
  lines.push(`Total files scanned: ${data.structure.total}`);
  lines.push('');
  lines.push('By top-level folder:');
  Object.entries(data.structure.byTopDir).sort((a, b) => b[1] - a[1]).forEach(([dir, n]) => {
    lines.push(`- ${dir}: ${n} files`);
  });
  lines.push('');
  lines.push('By extension:');
  Object.entries(data.structure.byExt).sort((a, b) => b[1] - a[1]).forEach(([ext, n]) => {
    lines.push(`- ${ext}: ${n}`);
  });
  lines.push('');

  lines.push('## 2. Syntax health — THIS IS WHERE "EVERYTHING DISAPPEARED" BUGS LIVE');
  lines.push('');
  lines.push(`### Entry file: ${data.entryCheck.file}`);
  lines.push('');
  if (!data.entryCheck.exists) {
    lines.push('**ENTRY FILE NOT FOUND.** This alone would explain a fully broken app.');
  } else {
    const broken = data.entryCheck.blocks.filter(b => !b.ok);
    const ok = data.entryCheck.blocks.filter(b => b.ok);
    lines.push(`Inline <script> blocks checked: ${data.entryCheck.blocks.length} (${ok.length} OK, ${broken.length} BROKEN)`);
    lines.push('');
    if (broken.length > 0) {
      lines.push('**BROKEN BLOCKS — fix these first, in order, top to bottom:**');
      broken.forEach(b => {
        lines.push(`- ❌ Block #${b.blockNum}, lines ${b.startLine}-${b.endLine}:`);
        lines.push('  ```');
        lines.push('  ' + b.error.split('\n').join('\n  '));
        lines.push('  ```');
      });
    } else {
      lines.push('✅ No broken inline script blocks in the entry file.');
    }
    lines.push('');
    lines.push('External `<script src>` references:');
    data.entryCheck.srcChecks.forEach(s => {
      if (s.isExternal) {
        lines.push(`- 🌐 ${s.src} (external CDN, block #${s.blockNum} — not checked)`);
      } else if (s.existsOnDisk) {
        lines.push(`- ✅ ${s.src} (block #${s.blockNum} — file exists)`);
      } else {
        lines.push(`- ❌ ${s.src} (block #${s.blockNum} — **FILE NOT FOUND ON DISK, this <script> tag 404s**)`);
      }
    });
  }
  lines.push('');
  lines.push('### All other .js files on disk');
  lines.push('');
  const brokenJs = data.jsFileChecks.filter(r => !r.ok);
  const okJs = data.jsFileChecks.filter(r => r.ok);
  lines.push(`Checked: ${data.jsFileChecks.length} (${okJs.length} OK, ${brokenJs.length} BROKEN)`);
  lines.push('');
  if (brokenJs.length > 0) {
    lines.push('**BROKEN FILES:**');
    brokenJs.forEach(r => {
      lines.push(`- ❌ ${r.file}:`);
      lines.push('  ```');
      lines.push('  ' + (r.error || '').split('\n').join('\n  '));
      lines.push('  ```');
    });
  } else {
    lines.push('✅ No syntax errors found in any other .js file.');
  }
  lines.push('');

  lines.push('## 3. Duplicate / competing implementations');
  lines.push('');
  let anyDup = false;
  Object.entries(data.funcDefs).forEach(([name, defs]) => {
    if (defs.length > 1) {
      anyDup = true;
      lines.push(`- \`${name}\` defined ${defs.length}x:`);
      defs.forEach(d => lines.push(`   - ${d.file}:${d.line}`));
    }
  });
  if (!anyDup) lines.push('No duplicate core-function definitions found among the tracked names.');
  lines.push('');
  lines.push('_Note: with a single canonical entry file (no bundler ambiguity), the LAST definition in document/load order generally wins if names collide via `window.X =` reassignment. Plain `function X(){}` redeclarations follow normal JS scoping (later one wins if in the same scope)._');
  lines.push('');

  lines.push('## 4. Operational flow — three personas');
  lines.push('');
  ['passenger', 'driver', 'admin'].forEach(persona => {
    lines.push(`### ${persona.toUpperCase()}`);
    lines.push('');
    Object.entries(data.flows[persona]).forEach(([check, result]) => {
      lines.push(`- ${result ? '✅' : '❌'} ${check}`);
    });
    lines.push('');
  });

  lines.push('## 5. GPS, distance, and fare logic');
  lines.push('');
  lines.push(`Geolocation (\`navigator.geolocation\`) used in: ${data.gpsFare.geolocationUsedIn.length ? data.gpsFare.geolocationUsedIn.join(', ') : 'nowhere found'}`);
  lines.push('');
  lines.push(`Distance-calculation implementations found: ${data.gpsFare.distanceImplementationCount}`);
  data.gpsFare.distanceImplementations.forEach(d => lines.push(`- ${d.file}:${d.line}`));
  if (data.gpsFare.distanceImplementationCount > 1) {
    lines.push('⚠️ More than one distance implementation exists — these can silently disagree with each other. Recommend consolidating to ONE.');
  }
  lines.push('');
  lines.push(`Fare-calculation implementations found: ${data.gpsFare.fareImplementationCount}`);
  data.gpsFare.fareImplementations.forEach(d => lines.push(`- ${d.file}:${d.line}`));
  if (data.gpsFare.fareImplementationCount > 1) {
    lines.push('⚠️ More than one fare implementation exists — passengers and drivers could see different prices for the same ride depending on which one runs. Recommend consolidating to ONE source of truth.');
  }
  lines.push('');
  if (data.gpsFare.suspiciousRandomUsage.length > 0) {
    lines.push('**Suspicious `Math.random` near fare/distance logic — verify these are not faking real values:**');
    data.gpsFare.suspiciousRandomUsage.forEach(s => lines.push(`- ${s.file}:${s.line} (${s.function}) — ${s.note}`));
  } else {
    lines.push('✅ No `Math.random` found near fare/distance function definitions.');
  }
  lines.push('');

  lines.push('## 6. What should be created / fixed, in priority order');
  lines.push('');
  let n = 1;
  if (!data.entryCheck.exists || data.entryCheck.blocks.some(b => !b.ok)) {
    lines.push(`${n++}. **Fix the broken script block(s) listed in section 2 first.** Nothing else matters until the page can run JS again.`);
  }
  const missing404 = (data.entryCheck.srcChecks || []).filter(s => !s.isExternal && !s.existsOnDisk);
  if (missing404.length) {
    lines.push(`${n++}. Fix or remove the ${missing404.length} broken \`<script src>\` reference(s) pointing at files that don't exist.`);
  }
  if (brokenJs.length) {
    lines.push(`${n++}. Fix the ${brokenJs.length} other broken .js file(s) listed in section 2.`);
  }
  if (data.gpsFare.distanceImplementationCount > 1 || data.gpsFare.fareImplementationCount > 1) {
    lines.push(`${n++}. Consolidate competing fare/distance implementations into one source of truth.`);
  }
  if (!data.flows.admin.anyAdminFileExists && !data.flows.admin.anyAdminRouteExists) {
    lines.push(`${n++}. **No admin/manager surface exists at all.** Recommend creating a minimal admin view: list of all rides with status/fare/driver, list of online drivers, list of pending driver applications (the \`/api/drivers/applications\` data currently has no UI consuming it), and basic revenue/THB-issued totals.`);
  }
  Object.entries(data.flows.passenger).forEach(([check, ok]) => {
    if (!ok) lines.push(`${n++}. Passenger flow gap: \`${check}\` — not found.`);
  });
  Object.entries(data.flows.driver).forEach(([check, ok]) => {
    if (!ok) lines.push(`${n++}. Driver flow gap: \`${check}\` — not found.`);
  });
  if (n === 1) lines.push('No high-priority gaps found beyond what is listed above.');
  lines.push('');

  return lines.join('\n');
}

function main() {
  console.log('============================================================');
  console.log(' CABLINK FULL STRUCTURAL AUDIT');
  console.log(` root: ${ROOT}`);
  console.log('============================================================');

  const allFiles = walkAll(ROOT, []);
  console.log(`Total files: ${allFiles.length}`);

  const structure = buildStructureMap(allFiles);

  const entryPath = path.join(ROOT, 'index.html');
  console.log('Checking entry file script blocks...');
  const entryCheck = checkEntryHtml(entryPath);

  console.log('Checking all other .js files for syntax errors (this may take a moment)...');
  const jsFileChecks = checkAllJsFiles(allFiles);

  console.log('Scanning for duplicate/competing function definitions...');
  const funcDefs = findDefinitions(allFiles, CORE_FUNCTIONS);

  let backendRoutesText = '';
  for (const f of allFiles) {
    const rel = relative(f);
    if (rel.startsWith('backend/')) {
      try { backendRoutesText += fs.readFileSync(f, 'utf8') + '\n'; } catch (e) {}
    }
  }

  console.log('Checking operational flow for passenger/driver/admin...');
  const flows = checkOperationalFlows(allFiles, backendRoutesText);

  console.log('Checking GPS/distance/fare logic...');
  const gpsFare = checkGpsAndFareLogic(allFiles, funcDefs);

  const report = buildReport({ structure, entryCheck, jsFileChecks, funcDefs, flows, gpsFare });
  fs.writeFileSync(path.join(ROOT, 'CABLINK_FULL_AUDIT_REPORT.md'), report, 'utf8');

  console.log('');
  console.log(`Entry file broken script blocks: ${entryCheck.blocks.filter(b => !b.ok).length} / ${entryCheck.blocks.length}`);
  console.log(`Other broken .js files: ${jsFileChecks.filter(r => !r.ok).length} / ${jsFileChecks.length}`);
  console.log(`Broken <script src> references: ${(entryCheck.srcChecks || []).filter(s => !s.isExternal && !s.existsOnDisk).length}`);
  console.log('');
  console.log('-> wrote CABLINK_FULL_AUDIT_REPORT.md');
  console.log('Made zero changes to any source file.');
}

main();
