const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.55 — RUNTIME REACHABILITY & DUAL REPOSITORY TRACE
========================================================
`);

const ROOT = process.cwd();

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
    } else if (
      entry.isFile() &&
      /\.(js|jsx|ts|tsx|html)$/.test(entry.name)
    ) {
      result.push(target);
    }
  }

  return result;
}

function rel(file) {
  return path.relative(ROOT, file);
}

function printMatch(file, line, type, code, meaning) {
  console.log(`
${rel(file)}:${line}
  [${type}]
  ${code.trim()}
  -> ${meaning}`);
}

const files = [
  ...walk(full("backend")),
  ...walk(full("frontend"))
];

console.log(`
========================================================
A. ALL RIDE-RELATED ROUTE IMPORTS
========================================================
`);

const routeFiles = files.filter(file =>
  /routes|server|app\.js$/.test(rel(file))
);

const serviceNames = [
  "dispatch_service",
  "live_ride_service",
  "economy_ledger_service",
  "canonical_reward_service",
  "ride_orchestrator_service",
  "ride_completion_service",
  "ride_engine",
  "ride_repository"
];

for (const file of routeFiles) {
  const lines = read(file).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (
      serviceNames.some(name =>
        line.includes(name)
      )
    ) {
      printMatch(
        file,
        i + 1,
        "RIDE DEPENDENCY REFERENCE",
        line,
        "Potential runtime dependency from route/server layer"
      );
    }
  });
}

console.log(`
========================================================
B. DYNAMIC MODULE LOADING TRACE
========================================================
`);

const dynamicPatterns = [
  /require\s*\(/,
  /import\s*\(/,
  /require\.resolve/,
  /module\.require/,
  /eval\s*\(/
];

for (const file of files) {
  const lines = read(file).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (
      /require\s*\(\s*[^"'`]/.test(line) ||
      /import\s*\(\s*[^"'`]/.test(line)
    ) {
      printMatch(
        file,
        i + 1,
        "DYNAMIC MODULE REFERENCE",
        line,
        "Potential runtime dependency not captured by static filename search"
      );
    }
  });
}

console.log(`
========================================================
C. SERVICE FUNCTION NAME REFERENCES
========================================================
`);

const functionNames = [
  "createRequest",
  "dispatch",
  "accept",
  "list",
  "createRide",
  "assignDriver",
  "driverArrived",
  "startTrip",
  "finishTrip",
  "completeRide",
  "recordRide",
  "recordReward",
  "updateRideStatus",
  "driverHistory",
  "driverEconomy",
  "createRewardForCompletedRide"
];

for (const file of files) {
  const lines = read(file).split(/\r?\n/);

  lines.forEach((line, i) => {
    const found = functionNames.filter(name => {
      const regex = new RegExp(`\\b${name}\\s*\\(`);
      return regex.test(line);
    });

    if (found.length) {
      printMatch(
        file,
        i + 1,
        "SERVICE FUNCTION REFERENCE",
        line,
        `Possible runtime call: ${found.join(", ")}`
      );
    }
  });
}

console.log(`
========================================================
D. REPOSITORY IMPLEMENTATION INVENTORY
========================================================
`);

const repositoryFiles = files.filter(file =>
  /ride_repository\.js$/.test(rel(file))
);

if (repositoryFiles.length === 0) {
  console.log("NO ride_repository.js FILES FOUND");
}

for (const file of repositoryFiles) {
  const content = read(file);

  console.log(`
--------------------------------------------------------
REPOSITORY
${rel(file)}
--------------------------------------------------------

FILE EXISTS: YES

USES rides.json:
${/rides\.json/.test(content) ? "YES" : "NO"}

USES writeFile:
${/writeFile(?:Sync)?/.test(content) ? "YES" : "NO"}

USES readFile:
${/readFile(?:Sync)?/.test(content) ? "YES" : "NO"}

USES create:
${/\bcreate\s*\(/.test(content) ? "YES" : "NO"}

USES update:
${/\bupdate\s*\(/.test(content) ? "YES" : "NO"}

USES delete:
${/\bdelete\s*\(/.test(content) ? "YES" : "NO"}
`);
}

console.log(`
========================================================
E. REPOSITORY PATH COMPARISON
========================================================
`);

const repoTargets = [
  "backend/canonical/ride_repository.js",
  "backend/database/ride_repository.js"
];

for (const repo of repoTargets) {
  if (!exists(repo)) {
    console.log(`
${repo}
  STATUS: NOT FOUND
`);
    continue;
  }

  const content = read(repo);

  console.log(`
${repo}
  STATUS: FOUND
  rides.json: ${/rides\.json/.test(content) ? "YES" : "NO"}
  writeFile: ${/writeFile/.test(content) ? "YES" : "NO"}
  readFile: ${/readFile/.test(content) ? "YES" : "NO"}
  create(): ${/\bcreate\s*\(/.test(content) ? "YES" : "NO"}
  update(): ${/\bupdate\s*\(/.test(content) ? "YES" : "NO"}
`);
}

console.log(`
========================================================
F. RUNTIME ROUTE REGISTRATION
========================================================
`);

const appFiles = files.filter(file =>
  /backend\/server\/app\.js$|backend\/server\.js$/.test(rel(file))
);

for (const file of appFiles) {
  const lines = read(file).split(/\r?\n/);

  lines.forEach((line, i) => {
    if (/app\.use\s*\(/.test(line)) {
      printMatch(
        file,
        i + 1,
        "ACTIVE ROUTE REGISTRATION",
        line,
        "Potential runtime HTTP entry point"
      );
    }
  });
}

console.log(`
========================================================
G. EXPORT / IMPORT GRAPH SUMMARY
========================================================
`);

const targets = [
  "dispatch_service",
  "live_ride_service",
  "economy_ledger_service",
  "canonical_reward_service",
  "ride_orchestrator_service",
  "ride_completion_service",
  "canonical/ride_engine",
  "canonical/ride_repository",
  "database/ride_repository"
];

for (const target of targets) {
  let found = false;

  console.log(`
TARGET: ${target}
`);

  for (const file of files) {
    const lines = read(file).split(/\r?\n/);

    lines.forEach((line, i) => {
      if (
        line.includes(target) &&
        !rel(file).includes(target)
      ) {
        found = true;

        printMatch(
          file,
          i + 1,
          "REFERENCE",
          line,
          "Potential dependency edge"
        );
      }
    });
  }

  if (!found) {
    console.log("NO REFERENCES FOUND");
  }
}

console.log(`
========================================================
H. O.8.55 VERDICT
========================================================

This trace determines whether the following are:

1. RUNTIME ACTIVE
2. RUNTIME REACHABLE THROUGH ROUTES
3. DYNAMICALLY REACHABLE
4. ORPHANED / UNUSED
5. DUPLICATE REPOSITORY AUTHORITY
6. LEGACY BUT STILL REACHABLE

NO FILES WILL BE MODIFIED.

NO FILES WILL BE DELETED.

========================================================
O.8.55 COMPLETE
========================================================
`);
