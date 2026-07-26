const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "CABLINK_STEP8_RUNTIME_TRUTH_REPORT.md");

const results = {
  frontendEntrypoints: [],
  frontendImports: [],
  frontendImportGraph: [],
  frontendApiCalls: [],
  backendEntrypoints: [],
  backendImports: [],
  backendMounts: [],
  backendRoutes: [],
  routeFiles: [],
  routeHandlers: [],
  canonicalComponents: [],
  canonicalLinks: [],
  dataStores: [],
  apiMatrix: [],
  reachableFiles: [],
  orphanCandidates: [],
  syntax: []
};

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "archive",
  "logs",
  ".vscode",
  ".idea",
  "backups",
  "migration_backup",
  "cablink_ride_backup_20260725_221547"
]);

const SOURCE_EXTENSIONS = /\.(js|jsx|ts|tsx|mjs|cjs)$/;

function abs(file) {
  return path.join(ROOT, file);
}

function exists(file) {
  return fs.existsSync(abs(file));
}

function read(file) {
  try {
    return fs.readFileSync(abs(file), "utf8");
  } catch {
    return "";
  }
}

function rel(file) {
  return path.relative(ROOT, file);
}

function unique(arr) {
  return [...new Set(arr)];
}

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;

  for (const name of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;

    const full = path.join(dir, name);
    let stat;

    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walk(full, callback);
    } else {
      callback(full);
    }
  }
}

function sourceFiles(rootDir = ROOT) {
  const files = [];

  walk(rootDir, full => {
    if (SOURCE_EXTENSIONS.test(full)) {
      files.push(rel(full));
    }
  });

  return files;
}

function resolveImport(fromFile, importPath) {
  if (!importPath.startsWith(".")) return null;

  const fromDir = path.dirname(abs(fromFile));
  const base = path.resolve(fromDir, importPath);

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return rel(candidate);
    }
  }

  return null;
}

function extractImports(file) {
  const content = read(file);
  const imports = [];

  const patterns = [
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }

  return unique(imports);
}

function extractApiCalls(file) {
  const content = read(file);
  const calls = [];

  const patterns = [
    /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /axios\.(?:get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g
  ];

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(content)) !== null) {
      calls.push(match[1]);
    }
  }

  return unique(calls);
}

function normalizeEndpoint(endpoint) {
  if (!endpoint) return endpoint;

  return endpoint
    .replace(/\$\{[^}]+\}/g, ":param")
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/\/[A-Za-z0-9_-]{6,}(?=\/|$)/g, "/:param");
}

function endpointMatches(frontendEndpoint, backendRoute) {
  const f = normalizeEndpoint(frontendEndpoint);
  const b = normalizeEndpoint(backendRoute);

  if (f === b) return true;

  const fParts = f.split("/").filter(Boolean);
  const bParts = b.split("/").filter(Boolean);

  if (fParts.length !== bParts.length) return false;

  return fParts.every((part, i) => {
    return (
      part === bParts[i] ||
      part.startsWith(":") ||
      bParts[i].startsWith(":")
    );
  });
}

function routeFullPath(mount, route) {
  const a = (mount || "").replace(/\/$/, "");
  const b = (route || "").startsWith("/")
    ? route
    : `/${route || ""}`;

  const result = `${a}${b}`.replace(/\/+/g, "/");

  return result === "" ? "/" : result;
}

function syntaxCheck(file) {
  try {
    execSync(
      `node --check "${abs(file)}"`,
      { stdio: "ignore" }
    );

    return "PASS";
  } catch {
    return "FAIL";
  }
}

console.log(`
============================================================
CABLINK — STEP 8 FULL RUNTIME TRUTH AUDIT
============================================================
READ-ONLY
NO APPLICATION FILES WILL BE MODIFIED
============================================================
`);

// ============================================================
// 1. FRONTEND ENTRYPOINT
// ============================================================

console.log(`
1. ACTIVE FRONTEND ENTRYPOINTS
============================================================`);

const possibleFrontendEntrypoints = [
  "frontend/index.html",
  "frontend/main.jsx",
  "frontend/main.js",
  "frontend/src/main.jsx",
  "frontend/src/main.js"
];

for (const file of possibleFrontendEntrypoints) {
  if (exists(file)) {
    results.frontendEntrypoints.push(file);
    console.log("FOUND:", file);
  }
}

// Extract script sources from HTML.
for (const file of results.frontendEntrypoints.filter(x => x.endsWith(".html"))) {
  const html = read(file);

  const matches = [
    ...html.matchAll(
      /<script[^>]+src=["']([^"']+)["']/gi
    )
  ];

  for (const match of matches) {
    console.log(
      "HTML SCRIPT:",
      file,
      "→",
      match[1]
    );
  }
}

// ============================================================
// 2. FRONTEND IMPORT GRAPH
// ============================================================

console.log(`
2. FRONTEND IMPORT GRAPH
============================================================`);

const frontendSourceFiles = [];

walk(path.join(ROOT, "frontend"), full => {
  const relative = rel(full);

  if (
    SOURCE_EXTENSIONS.test(full) &&
    !relative.includes("node_modules")
  ) {
    frontendSourceFiles.push(relative);
  }
});

for (const file of frontendSourceFiles) {

  const imports = extractImports(file);

  for (const importPath of imports) {

    const resolved = resolveImport(file, importPath);

    results.frontendImports.push({
      from: file,
      importPath,
      resolved
    });

    if (resolved) {
      results.frontendImportGraph.push({
        from: file,
        to: resolved
      });
    }

    console.log(
      file,
      "→",
      importPath,
      resolved ? `→ ${resolved}` : "→ EXTERNAL/UNRESOLVED"
    );
  }
}

// ============================================================
// 3. FRONTEND API INVENTORY
// ============================================================

console.log(`
3. FRONTEND API CALL INVENTORY
============================================================`);

for (const file of frontendSourceFiles) {

  const calls = extractApiCalls(file);

  for (const endpoint of calls) {

    results.frontendApiCalls.push({
      file,
      endpoint
    });

    console.log(
      file,
      "→",
      endpoint
    );
  }
}

// Also inspect HTML inline JavaScript.
if (exists("frontend/index.html")) {

  const html = read("frontend/index.html");

  const inlineCalls = [
    ...html.matchAll(
      /fetch\s*\(\s*["'`]([^"'`]+)["'`]/g
    )
  ];

  for (const match of inlineCalls) {

    results.frontendApiCalls.push({
      file: "frontend/index.html",
      endpoint: match[1]
    });

    console.log(
      "frontend/index.html",
      "→",
      match[1]
    );
  }
}

// ============================================================
// 4. BACKEND ENTRYPOINT
// ============================================================

console.log(`
4. BACKEND ENTRYPOINT
============================================================`);

const backendEntry = "backend/server.js";

if (exists(backendEntry)) {

  results.backendEntrypoints.push(backendEntry);

  const imports = extractImports(backendEntry);

  for (const importPath of imports) {

    const resolved = resolveImport(
      backendEntry,
      importPath
    );

    results.backendImports.push({
      from: backendEntry,
      importPath,
      resolved
    });

    console.log(
      backendEntry,
      "→",
      importPath,
      resolved ? `→ ${resolved}` : "→ EXTERNAL/UNRESOLVED"
    );
  }
}

// ============================================================
// 5. BACKEND APP MOUNTS
// ============================================================

console.log(`
5. BACKEND ROUTER MOUNTS
============================================================`);

const appFile = "backend/server/app.js";

if (exists(appFile)) {

  const content = read(appFile);

  const mounts = [
    ...content.matchAll(
      /app\.use\s*\(\s*["']([^"']+)["']\s*,\s*([A-Za-z0-9_]+)/g
    )
  ];

  for (const match of mounts) {

    results.backendMounts.push({
      mount: match[1],
      router: match[2]
    });

    console.log(
      "MOUNT:",
      match[1],
      "→",
      match[2]
    );
  }

  const directRoutes = [
    ...content.matchAll(
      /app\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi
    )
  ];

  for (const match of directRoutes) {

    results.backendRoutes.push({
      method: match[1].toUpperCase(),
      route: match[2],
      source: appFile,
      fullPath: match[2]
    });

    console.log(
      match[1].toUpperCase(),
      match[2]
    );
  }
}

// ============================================================
// 6. ROUTER FILE DISCOVERY
// ============================================================

console.log(`
6. BACKEND ROUTER FILES
============================================================`);

const backendSourceFiles = [];

walk(path.join(ROOT, "backend"), full => {
  if (SOURCE_EXTENSIONS.test(full)) {
    backendSourceFiles.push(rel(full));
  }
});

for (const file of backendSourceFiles) {

  const content = read(file);

  const routeMatches = [
    ...content.matchAll(
      /router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/gi
    )
  ];

  if (routeMatches.length) {

    results.routeFiles.push(file);

    for (const match of routeMatches) {

      results.routeHandlers.push({
        method: match[1].toUpperCase(),
        route: match[2],
        source: file
      });

      console.log(
        file,
        "→",
        match[1].toUpperCase(),
        match[2]
      );
    }
  }
}

// ============================================================
// 7. BUILD FULL BACKEND ROUTE MAP
// ============================================================

console.log(`
7. FULL BACKEND ROUTE MAP
============================================================`);

for (const handler of results.routeHandlers) {

  let mount = "";

  const likelyRouterName = path.basename(
    handler.source,
    path.extname(handler.source)
  );

  const mountMatch = results.backendMounts.find(
    x =>
      x.router.toLowerCase().includes(
        likelyRouterName.toLowerCase()
      )
  );

  if (mountMatch) {
    mount = mountMatch.mount;
  }

  const fullPath = routeFullPath(
    mount,
    handler.route
  );

  results.backendRoutes.push({
    method: handler.method,
    route: handler.route,
    source: handler.source,
    fullPath
  });

  console.log(
    handler.method,
    fullPath,
    "FROM",
    handler.source
  );
}

// ============================================================
// 8. CANONICAL RIDE PATH
// ============================================================

console.log(`
8. CANONICAL RIDE PATH
============================================================`);

const canonicalFiles = [
  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js",
  "backend/routes/rides.js",
  "backend/server/app.js",
  "backend/server.js"
];

for (const file of canonicalFiles) {

  if (!exists(file)) continue;

  results.canonicalComponents.push(file);

  console.log(
    "CANONICAL:",
    file
  );
}

for (const file of [
  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js",
  "backend/routes/rides.js"
]) {

  if (!exists(file)) continue;

  for (const importPath of extractImports(file)) {

    const resolved = resolveImport(
      file,
      importPath
    );

    results.canonicalLinks.push({
      from: file,
      importPath,
      resolved
    });

    console.log(
      file,
      "→",
      importPath,
      resolved ? `→ ${resolved}` : ""
    );
  }
}

// ============================================================
// 9. DATA STORE MAP
// ============================================================

console.log(`
9. RIDE DATA STORE MAP
============================================================`);

const dataCandidates = [
  "backend/data/rides.json",
  "backend/database/rides.json",
  "backend/storage/cablink_db.json",
  "backend/data/dispatch_requests.json",
  "backend/data/ride_events.json",
  "backend/data/economy_ledger.json"
];

for (const file of dataCandidates) {

  if (!exists(file)) continue;

  let records = "UNKNOWN";

  try {

    const data = JSON.parse(
      read(file)
    );

    if (Array.isArray(data)) {
      records = data.length;
    } else if (
      data &&
      typeof data === "object"
    ) {
      records = Object.keys(data).length;
    }

  } catch {}

  results.dataStores.push({
    file,
    records
  });

  console.log(
    file,
    "→",
    records,
    "top-level records"
  );
}

// ============================================================
// 10. API COMPATIBILITY MATRIX
// ============================================================

console.log(`
10. FRONTEND ↔ BACKEND API COMPATIBILITY
============================================================`);

const uniqueApiCalls = unique(
  results.frontendApiCalls.map(
    x => x.endpoint
  )
);

const uniqueBackendRoutes = unique(
  results.backendRoutes
    .filter(x => x.fullPath)
    .map(
      x => x.fullPath
    )
);

for (const endpoint of uniqueApiCalls) {

  const match = uniqueBackendRoutes.find(
    route =>
      endpointMatches(
        endpoint,
        route
      )
  );

  const status = match
    ? "MATCH"
    : "NO_MATCH";

  results.apiMatrix.push({
    endpoint,
    status,
    backendMatch: match || null
  });

  console.log(
    status,
    endpoint,
    match
      ? `→ ${match}`
      : "→ NO BACKEND ROUTE FOUND"
  );
}

// ============================================================
// 11. ACTIVE RUNTIME REACHABILITY
// ============================================================

console.log(`
11. ACTIVE RUNTIME REACHABILITY
============================================================`);

const reachable = new Set();

function trace(file) {

  if (!file) return;

  if (reachable.has(file)) return;

  reachable.add(file);

  for (const edge of results.frontendImportGraph) {

    if (edge.from === file) {
      trace(edge.to);
    }
  }
}

// Start from likely frontend roots.
for (const entry of [
  "frontend/main.jsx",
  "frontend/main.js",
  "frontend/src/main.jsx",
  "frontend/src/main.js"
]) {

  if (exists(entry)) {
    trace(entry);
  }
}

results.reachableFiles = [
  ...reachable
];

for (const file of results.reachableFiles) {
  console.log(
    "REACHABLE:",
    file
  );
}

// ============================================================
// 12. ORPHAN CANDIDATES
// ============================================================

console.log(`
12. POSSIBLE ORPHAN / UNREACHABLE RIDE FILES
============================================================`);

const rideCandidates = [
  "frontend/js/ride_engine.js",
  "frontend/js/operations_core.js",
  "frontend/js/simulation_engine.js",
  "frontend/services/ride_service.js",
  "frontend/js/rides/rideService.js",
  "frontend/js/rides/rideController.js",
  "frontend/js/rides/rideStateMachine.js",
  "backend/rides/ride_engine.js",
  "backend/rides/ride_state_engine.js",
  "backend/services/rideService.js",
  "backend/services/live_ride_service.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/ride_state_service.js",
  "backend/services/dispatch_service.js",
  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js",
  "backend/routes/rides.js"
];

for (const file of rideCandidates) {

  if (!exists(file)) continue;

  const reachableFrontend =
    results.reachableFiles.includes(file);

  const importedByBackend =
    results.backendImports.some(
      x => x.resolved === file
    );

  const status =
    reachableFrontend ||
    importedByBackend
      ? "REACHABLE/REFERENCED"
      : "POSSIBLE_ORPHAN";

  results.orphanCandidates.push({
    file,
    status
  });

  console.log(
    status,
    file
  );
}

// ============================================================
// 13. SYNTAX VALIDATION
// ============================================================

console.log(`
13. SYNTAX VALIDATION
============================================================`);

const syntaxCandidates = unique([
  ...results.frontendEntrypoints
    .filter(x => SOURCE_EXTENSIONS.test(x)),
  ...frontendSourceFiles,
  ...backendSourceFiles
]);

for (const file of syntaxCandidates) {

  const status = syntaxCheck(file);

  results.syntax.push({
    file,
    status
  });

  if (status === "FAIL") {
    console.log(
      "FAIL:",
      file
    );
  }
}

// ============================================================
// 14. REPORT
// ============================================================

const apiMatchCount =
  results.apiMatrix.filter(
    x => x.status === "MATCH"
  ).length;

const apiNoMatchCount =
  results.apiMatrix.filter(
    x => x.status === "NO_MATCH"
  ).length;

const syntaxFailCount =
  results.syntax.filter(
    x => x.status === "FAIL"
  ).length;

const report = `# CABLINK STEP 8 — FULL RUNTIME TRUTH AUDIT

Generated: ${new Date().toISOString()}

Status: READ-ONLY

No application files were modified by this audit.

---

## 1. EXECUTIVE SUMMARY

### Frontend entrypoints discovered

${results.frontendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

### Backend entrypoints discovered

${results.backendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

### Frontend API endpoints detected

- Total unique endpoints: ${uniqueApiCalls.length}
- Backend matches: ${apiMatchCount}
- No backend match: ${apiNoMatchCount}

### Syntax validation

- Files checked: ${results.syntax.length}
- Syntax failures: ${syntaxFailCount}

---

## 2. FRONTEND ENTRYPOINTS

${results.frontendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

---

## 3. FRONTEND IMPORT GRAPH

${results.frontendImportGraph.map(x =>
  `- \`${x.from}\` → \`${x.to}\``
).join("\n") || "- No resolved local imports detected"}

---

## 4. FRONTEND API CALLS

${results.frontendApiCalls.map(x =>
  `- **${x.file}** → \`${x.endpoint}\``
).join("\n") || "- None detected"}

---

## 5. BACKEND ENTRYPOINT IMPORTS

${results.backendImports.map(x =>
  `- \`${x.from}\` → \`${x.importPath}\` → ${x.resolved || "UNRESOLVED/EXTERNAL"}`
).join("\n") || "- None detected"}

---

## 6. BACKEND ROUTER MOUNTS

${results.backendMounts.map(x =>
  `- \`${x.mount}\` → \`${x.router}\``
).join("\n") || "- None detected"}

---

## 7. FULL BACKEND ROUTE MAP

${results.backendRoutes.map(x =>
  `- \`${x.method} ${x.fullPath || x.route}\` — ${x.source}`
).join("\n") || "- No routes detected"}

---

## 8. CANONICAL RIDE COMPONENTS

${results.canonicalComponents.map(x =>
  `- ${x}`
).join("\n") || "- None found"}

---

## 9. CANONICAL RIDE IMPORT LINKS

${results.canonicalLinks.map(x =>
  `- \`${x.from}\` → \`${x.importPath}\` → ${x.resolved || "UNRESOLVED/EXTERNAL"}`
).join("\n") || "- No canonical links detected"}

---

## 10. RIDE DATA STORES

${results.dataStores.map(x =>
  `- ${x.file} — ${x.records} top-level records`
).join("\n") || "- None found"}

---

## 11. FRONTEND ↔ BACKEND API COMPATIBILITY MATRIX

| Frontend Endpoint | Status | Backend Match |
|---|---|---|
${results.apiMatrix.map(x =>
  `| \`${x.endpoint}\` | **${x.status}** | ${x.backendMatch ? `\`${x.backendMatch}\`` : "—"} |`
).join("\n") || "| — | — | — |"}

---

## 12. ACTIVE FRONTEND REACHABILITY

${results.reachableFiles.map(x =>
  `- ${x}`
).join("\n") || "- No frontend entrypoint import graph could be resolved"}

---

## 13. RIDE ARCHITECTURE REACHABILITY

| File | Classification |
|---|---|
${results.orphanCandidates.map(x =>
  `| \`${x.file}\` | **${x.status}** |`
).join("\n") || "| — | — |"}

---

## 14. SYNTAX VALIDATION

${results.syntax.map(x =>
  `- ${x.status} — ${x.file}`
).join("\n")}

---

## 15. STEP 8 INTERPRETATION

This audit establishes the runtime truth required before any destructive cleanup or migration.

The next phase must use this report to:

1. Identify the single active frontend application entrypoint.
2. Identify the complete active frontend import graph.
3. Identify the single active backend entrypoint.
4. Identify all mounted backend routers.
5. Expand all backend route handlers.
6. Compare every frontend API call against an actual backend route.
7. Trace the canonical ride engine and repository.
8. Identify which ride data store is actually used by the active backend.
9. Separate active code from unreachable, legacy, backup, and migration code.
10. Only then perform surgical runtime alignment.

### IMPORTANT

This report is evidence for architectural alignment.

It is NOT authorization to delete legacy files.

No application files were modified by this audit.
`;

fs.writeFileSync(
  OUT,
  report,
  "utf8"
);

console.log(`
============================================================
STEP 8 FULL RUNTIME TRUTH AUDIT COMPLETE
============================================================

REPORT:
${OUT}

API MATCHES:
${apiMatchCount}

API NO-MATCHES:
${apiNoMatchCount}

SYNTAX FAILURES:
${syntaxFailCount}

NO APPLICATION FILES WERE MODIFIED.
============================================================
`);
