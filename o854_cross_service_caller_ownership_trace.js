const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.54 — CROSS-SERVICE CALLER & DATA OWNERSHIP TRACE
========================================================
`);

const ROOT = process.cwd();

const SERVICES = [
  "backend/services/dispatch_service.js",
  "backend/services/live_ride_service.js",
  "backend/services/economy_ledger_service.js",
  "backend/services/canonical_reward_service.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/ride_completion_service.js"
];

const SEARCH_ROOTS = [
  "backend",
  "frontend"
];

function full(file) {
  return path.join(ROOT, file);
}

function exists(file) {
  return fs.existsSync(full(file));
}

function read(file) {
  try {
    return fs.readFileSync(full(file), "utf8");
  } catch {
    return "";
  }
}

function walk(dir) {
  const result = [];

  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);

    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      result.push(...walk(target));
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx|html)$/.test(entry.name)) {
      result.push(target);
    }
  }

  return result;
}

function relative(file) {
  return path.relative(ROOT, file);
}

function findLine(file, pattern) {
  const lines = read(file).split(/\r?\n/);

  const results = [];

  lines.forEach((line, i) => {
    if (pattern.test(line)) {
      results.push({
        line: i + 1,
        code: line.trim()
      });
    }
  });

  return results;
}

function serviceBase(file) {
  return path.basename(file, ".js");
}

console.log(`
========================================================
A. SERVICE EXPORT SURFACE
========================================================
`);

for (const service of SERVICES) {
  if (!exists(service)) continue;

  const content = read(service);

  console.log(`
--------------------------------------------------------
${service}
--------------------------------------------------------
`);

  const moduleExports = content.match(
    /module\.exports\s*=\s*\{[\s\S]*?\}/g
  );

  if (moduleExports) {
    moduleExports.forEach(block => {
      console.log(block);
    });
  } else if (/module\.exports\s*=/.test(content)) {
    const lines = content.split(/\r?\n/);

    lines.forEach((line, i) => {
      if (/module\.exports/.test(line)) {
        console.log(`LINE ${i + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log("NO COMMONJS EXPORT SURFACE DETECTED");
  }
}

console.log(`
========================================================
B. SERVICE CALLER TRACE
========================================================
`);

const allFiles = [];

for (const root of SEARCH_ROOTS) {
  allFiles.push(...walk(full(root)));
}

for (const service of SERVICES) {
  if (!exists(service)) continue;

  const base = serviceBase(service);
  const requirePattern = new RegExp(
    `(?:require\\(["'][^"']*${base}["']\\)|from\\s+["'][^"']*${base}["'])`
  );

  console.log(`
--------------------------------------------------------
TARGET SERVICE: ${service}
--------------------------------------------------------
`);

  let callers = 0;

  for (const file of allFiles) {
    const rel = relative(file);

    if (rel === service) continue;

    const matches = findLine(file, requirePattern);

    if (matches.length) {
      callers += matches.length;

      for (const match of matches) {
        console.log(`
${rel}:${match.line}
  ${match.code}
  -> CALLER / IMPORTER OF ${base}
`);
      }
    }
  }

  if (callers === 0) {
    console.log("NO STATIC IMPORTERS DETECTED");
  }
}

console.log(`
========================================================
C. CANONICAL ENGINE IMPORT TRACE
========================================================
`);

const enginePattern =
  /(?:require\(["'][^"']*canonical\/ride_engine["']\)|require\(["'][^"']*ride_engine["']\))/;

for (const file of allFiles) {
  const matches = findLine(file, enginePattern);

  for (const match of matches) {
    console.log(`
${relative(file)}:${match.line}
  ${match.code}
  -> CANONICAL ENGINE CONSUMER
`);
  }
}

console.log(`
========================================================
D. RIDE DATA FILE OWNERSHIP
========================================================
`);

const storagePatterns = [
  /rides\.json/,
  /live_rides\.json/,
  /ride_events\.json/,
  /requests\.json/,
  /transactions\.json/,
  /rewards/i
];

for (const file of allFiles) {
  const matches = [];

  const fileLines = read(file).split(/\r?\n/);

  fileLines.forEach((line, i) => {
    if (storagePatterns.some(pattern => pattern.test(line))) {
      matches.push({
        line: i + 1,
        code: line.trim()
      });
    }
  });

  if (matches.length) {
    console.log(`
--------------------------------------------------------
${relative(file)}
--------------------------------------------------------
`);

    matches.forEach(match => {
      console.log(
        `${relative(file)}:${match.line}
  ${match.code}`
      );
    });
  }
}

console.log(`
========================================================
E. DISPATCH STATE OWNERSHIP
========================================================
`);

const dispatch = "backend/services/dispatch_service.js";

if (exists(dispatch)) {
  const lines = read(dispatch).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (
      /request\.status\s*=/.test(line) ||
      /request\.acceptedAt\s*=/.test(line) ||
      /db\.requests\.push/.test(line)
    ) {
      console.log(`
${dispatch}:${i + 1}
  ${line.trim()}
  -> DISPATCH-OWNED STATE CANDIDATE
`);
    }
  });
}

console.log(`
========================================================
F. ECONOMY DATA OWNERSHIP
========================================================
`);

const economy = "backend/services/economy_ledger_service.js";

if (exists(economy)) {
  const lines = read(economy).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (
      /db\.rides\.push/.test(line) ||
      /db\.transactions\.push/.test(line) ||
      /rides\.filter/.test(line) ||
      /transactions\.filter/.test(line)
    ) {
      console.log(`
${economy}:${i + 1}
  ${line.trim()}
  -> ECONOMY DATA OPERATION
`);
    }
  });
}

console.log(`
========================================================
G. REWARD DATA OWNERSHIP
========================================================
`);

const reward = "backend/services/canonical_reward_service.js";

if (exists(reward)) {
  const lines = read(reward).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (
      /ledger\.transactions\.push/.test(line) ||
      /writeFile/.test(line) ||
      /JSON\.stringify/.test(line)
    ) {
      console.log(`
${reward}:${i + 1}
  ${line.trim()}
  -> REWARD / LEDGER DATA OPERATION
`);
    }
  });
}

console.log(`
========================================================
H. ORCHESTRATOR AUTHORITY CHECK
========================================================
`);

const orchestrator = "backend/services/ride_orchestrator_service.js";

if (exists(orchestrator)) {
  const content = read(orchestrator);
  const lines = content.split(/\r?\n/);

  console.log(`
CANONICAL ENGINE IMPORT:
${/ride_engine/.test(content) ? "YES" : "NO"}

DIRECT STATUS MUTATION:
${/\.status\s*=/.test(content) ? "YES" : "NO"}

DIRECT RIDE PERSISTENCE:
${/rides\.json|writeFile|writeFileSync/.test(content) ? "YES" : "NO"}

REPOSITORY IMPORT:
${/ride_repository/.test(content) ? "YES" : "NO"}
`);

  lines.forEach((line, i) => {
    if (
      /status\s*=/.test(line) ||
      /writeFile/.test(line) ||
      /repository/.test(line) ||
      /ride_engine/.test(line)
    ) {
      console.log(`${orchestrator}:${i + 1}
  ${line.trim()}`);
    }
  });
}

console.log(`
========================================================
I. O.8.54 CLASSIFICATION
========================================================

The purpose of this audit is to distinguish:

1. TRUE RIDE AUTHORITY
2. DERIVED RIDE READ MODEL
3. DISPATCH STATE
4. FINANCIAL LEDGER STATE
5. REWARD LEDGER STATE
6. LEGACY RIDE STATE
7. ORCHESTRATION ONLY

NO FILES WILL BE MODIFIED.

NO FILES WILL BE DELETED.

========================================================
O.8.54 COMPLETE
========================================================
`);
