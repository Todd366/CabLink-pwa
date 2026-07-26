const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const OUT = path.join(ROOT, "CABLINK_STEP8_1_RUNTIME_TRUTH_CORRECTED_REPORT.md");

const SOURCE_EXTENSIONS = /\.(js|jsx|mjs|cjs|ts|tsx)$/i;

const results = {
  frontendEntrypoints: [],
  frontendReachability: [],
  frontendImports: [],
  frontendApiCalls: [],
  backendEntrypoints: [],
  backendImports: [],
  backendMounts: [],
  backendRoutes: [],
  backendDependencyGraph: [],
  canonicalPath: [],
  dataStores: [],
  dataStoreReferences: [],
  apiMatrix: [],
  syntax: [],
  build: null,
  warnings: []
};

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function rel(full) {
  return path.relative(ROOT, full).replace(/\\/g, "/");
}

function unique(arr) {
  return [...new Set(arr)];
}

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (
      item.name === "node_modules" ||
      item.name === ".git" ||
      item.name === "dist" ||
      item.name === "build"
    ) {
      continue;
    }

    if (item.isDirectory()) {
      walk(full, callback);
    } else {
      callback(full);
    }
  }
}

function resolveImport(fromFile, importPath) {

  if (!importPath) return null;

  if (
    !importPath.startsWith(".") &&
    !importPath.startsWith("/")
  ) {
    return null;
  }

  const fromDir = path.dirname(path.join(ROOT, fromFile));

  let base;

  if (importPath.startsWith("/")) {
    base = path.join(ROOT, importPath);
  } else {
    base = path.resolve(fromDir, importPath);
  }

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.mjs"),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return rel(candidate);
    }
  }

  return null;
}

function extractImports(file) {

  if (!exists(file)) return [];

  const content = read(file);
  const imports = [];

  const patterns = [
    /import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const regex of patterns) {
    for (const match of content.matchAll(regex)) {
      imports.push(match[1]);
    }
  }

  return unique(imports);
}

function extractApiCalls(file) {

  if (!exists(file)) return [];

  const content = read(file);
  const endpoints = [];

  const patterns = [
    /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]/g,
    /axios\.(get|post|put|patch|delete)\s*\(\s*[`'"]([^`'"]+)[`'"]/gi,
    /axios\s*\(\s*\{[\s\S]*?url\s*:\s*[`'"]([^`'"]+)[`'"]/gi
  ];

  for (const match of content.matchAll(patterns[0])) {
    endpoints.push({
      method: "UNKNOWN",
      endpoint: match[1]
    });
  }

  for (const match of content.matchAll(patterns[1])) {
    endpoints.push({
      method: match[1].toUpperCase(),
      endpoint: match[2]
    });
  }

  for (const match of content.matchAll(patterns[2])) {
    endpoints.push({
      method: "UNKNOWN",
      endpoint: match[1]
    });
  }

  return endpoints;
}

function extractRouteHandlers(file) {

  if (!exists(file)) return [];

  const content = read(file);
  const routes = [];

  const regex =
    /(?:router|app)\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi;

  for (const match of content.matchAll(regex)) {

    routes.push({
      method: match[1].toUpperCase(),
      route: match[2]
    });
  }

  return routes;
}

function normalizePath(value) {

  if (!value) return "/";

  let result = value
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("?")[0]
    .split("#")[0];

  if (!result.startsWith("/")) {
    result = "/" + result;
  }

  result = result.replace(/\/+/g, "/");

  if (result.length > 1) {
    result = result.replace(/\/$/, "");
  }

  return result;
}

function joinPaths(a, b) {

  const left = a || "";
  const right = b || "";

  if (right === "/") {
    return normalizePath(left || "/");
  }

  return normalizePath(
    `${left}/${right}`
  );
}

function routeMatches(frontendEndpoint, frontendMethod, backendPath, backendMethod) {

  if (
    frontendMethod !== "UNKNOWN" &&
    frontendMethod !== backendMethod
  ) {
    return false;
  }

  const a = normalizePath(frontendEndpoint);
  const b = normalizePath(backendPath);

  const aParts = a.split("/").filter(Boolean);
  const bParts = b.split("/").filter(Boolean);

  if (aParts.length !== bParts.length) {
    return false;
  }

  for (let i = 0; i < aParts.length; i++) {

    const x = aParts[i];
    const y = bParts[i];

    if (
      x.startsWith(":") ||
      y.startsWith(":")
    ) {
      continue;
    }

    if (
      x.toLowerCase() !==
      y.toLowerCase()
    ) {
      return false;
    }
  }

  return true;
}

function syntaxCheck(file) {

  if (!exists(file)) {
    return "MISSING";
  }

  const ext = path.extname(file).toLowerCase();

  try {

    if (ext === ".jsx" || ext === ".tsx") {

      if (
        exists("node_modules/.bin/vite") &&
        exists("package.json")
      ) {
        return "DEFERRED_TO_VITE_BUILD";
      }

      return "JSX_DEFERRED";
    }

    execSync(
      `node --check ${JSON.stringify(file)}`,
      {
        cwd: ROOT,
        stdio: "pipe"
      }
    );

    return "PASS";

  } catch (error) {

    return "FAIL";
  }
}

function packageScript(name) {

  if (!exists("package.json")) return null;

  try {

    const pkg = JSON.parse(
      read("package.json")
    );

    return pkg.scripts?.[name] || null;

  } catch {

    return null;
  }
}

function findFrontendEntrypoints() {

  const candidates = [
    "frontend/main.jsx",
    "frontend/main.js",
    "frontend/src/main.jsx",
    "frontend/src/main.js",
    "frontend/src/main.tsx",
    "frontend/index.html"
  ];

  for (const file of candidates) {

    if (exists(file)) {

      results.frontendEntrypoints.push(file);
    }
  }
}

function traceFrontend(file, visited = new Set()) {

  if (!file) return;

  if (visited.has(file)) return;

  visited.add(file);

  results.frontendReachability.push(file);

  for (const importPath of extractImports(file)) {

    const resolved =
      resolveImport(
        file,
        importPath
      );

    results.frontendImports.push({
      from: file,
      importPath,
      to: resolved
    });

    if (resolved) {

      traceFrontend(
        resolved,
        visited
      );
    }
  }
}

function buildBackendDependencyGraph(file, visited = new Set()) {

  if (!file) return;

  if (visited.has(file)) return;

  visited.add(file);

  for (const importPath of extractImports(file)) {

    const resolved =
      resolveImport(
        file,
        importPath
      );

    results.backendDependencyGraph.push({
      from: file,
      importPath,
      to: resolved
    });

    if (resolved) {

      buildBackendDependencyGraph(
        resolved,
        visited
      );
    }
  }
}

console.log(`
============================================================
CABLINK — STEP 8.1 RUNTIME TRUTH CORRECTION AUDIT
============================================================
READ-ONLY
NO APPLICATION FILES WILL BE MODIFIED
============================================================
`);

console.log(`
1. FRONTEND ENTRYPOINT DISCOVERY
============================================================
`);

findFrontendEntrypoints();

for (const file of results.frontendEntrypoints) {

  console.log(
    "FOUND:",
    file
  );
}

if (exists("frontend/main.jsx")) {

  console.log(
    "TRACING ACTIVE FRONTEND FROM frontend/main.jsx"
  );

  traceFrontend(
    "frontend/main.jsx"
  );
}

console.log(`
2. ACTIVE FRONTEND REACHABILITY
============================================================
`);

for (const file of unique(results.frontendReachability)) {

  console.log(
    "ACTIVE/REACHABLE:",
    file
  );
}

console.log(`
3. FRONTEND API CALL INVENTORY
============================================================
`);

const frontendSourceFiles = [];

walk(
  path.join(ROOT, "frontend"),
  full => {

    if (SOURCE_EXTENSIONS.test(full)) {

      frontendSourceFiles.push(
        rel(full)
      );
    }
  }
);

for (const file of frontendSourceFiles) {

  for (const call of extractApiCalls(file)) {

    results.frontendApiCalls.push({
      file,
      method: call.method,
      endpoint: call.endpoint
    });

    console.log(
      call.method,
      file,
      "→",
      call.endpoint
    );
  }
}

console.log(`
4. BACKEND ENTRYPOINT
============================================================
`);

if (exists("backend/server.js")) {

  results.backendEntrypoints.push(
    "backend/server.js"
  );

  console.log(
    "ENTRYPOINT:",
    "backend/server.js"
  );

  buildBackendDependencyGraph(
    "backend/server.js"
  );
}

console.log(`
5. BACKEND ROUTER MOUNTS
============================================================
`);

const appFile =
  "backend/server/app.js";

if (exists(appFile)) {

  const content =
    read(appFile);

  const mountRegex =
    /app\.use\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*([A-Za-z0-9_]+)/g;

  for (const match of content.matchAll(mountRegex)) {

    results.backendMounts.push({
      mount: normalizePath(match[1]),
      router: match[2]
    });

    console.log(
      "MOUNT:",
      normalizePath(match[1]),
      "→",
      match[2]
    );
  }

  const directRoutes =
    extractRouteHandlers(
      appFile
    );

  for (const route of directRoutes) {

    results.backendRoutes.push({
      method: route.method,
      route: route.route,
      fullPath: normalizePath(route.route),
      source: appFile
    });
  }
}

console.log(`
6. BACKEND ROUTE RESOLUTION
============================================================
`);

const backendSourceFiles = [];

walk(
  path.join(ROOT, "backend"),
  full => {

    if (SOURCE_EXTENSIONS.test(full)) {

      backendSourceFiles.push(
        rel(full)
      );
    }
  }
);

for (const file of backendSourceFiles) {

  const routes =
    extractRouteHandlers(file);

  if (!routes.length) continue;

  const base =
    path.basename(
      file,
      path.extname(file)
    );

  let mount = "";

  const mountMatch =
    results.backendMounts.find(
      x =>
        x.router
          .toLowerCase()
          .includes(
            base.toLowerCase()
          )
    );

  if (mountMatch) {

    mount =
      mountMatch.mount;
  }

  for (const route of routes) {

    const fullPath =
      joinPaths(
        mount,
        route.route
      );

    results.backendRoutes.push({
      method: route.method,
      route: route.route,
      fullPath,
      source: file
    });

    console.log(
      route.method,
      fullPath,
      "FROM",
      file
    );
  }
}

console.log(`
7. COMPLETE BACKEND DEPENDENCY GRAPH
============================================================
`);

for (
  const edge of
  results.backendDependencyGraph
) {

  console.log(
    edge.from,
    "→",
    edge.importPath,
    edge.to
      ? `→ ${edge.to}`
      : "→ EXTERNAL/UNRESOLVED"
  );
}

console.log(`
8. CANONICAL RIDE PATH
============================================================
`);

const canonicalTargets = [
  "backend/server.js",
  "backend/server/app.js",
  "backend/routes/rides.js",
  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js"
];

const canonicalReachable =
  new Set();

function markCanonical(file) {

  if (!file) return;

  if (canonicalReachable.has(file)) {
    return;
  }

  canonicalReachable.add(file);

  for (
    const edge of
    results.backendDependencyGraph
  ) {

    if (
      edge.from === file &&
      edge.to
    ) {

      markCanonical(
        edge.to
      );
    }
  }
}

markCanonical(
  "backend/server.js"
);

for (const file of canonicalTargets) {

  const status =
    canonicalReachable.has(file)
      ? "REACHABLE_FROM_BACKEND_ENTRYPOINT"
      : "NOT_PROVEN_REACHABLE";

  results.canonicalPath.push({
    file,
    status
  });

  console.log(
    status,
    file
  );
}

console.log(`
9. DATA STORE REFERENCE ANALYSIS
============================================================
`);

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

    const data =
      JSON.parse(
        read(file)
      );

    if (Array.isArray(data)) {

      records =
        data.length;

    } else if (
      data &&
      typeof data === "object"
    ) {

      records =
        Object.keys(data).length;
    }

  } catch {}

  results.dataStores.push({
    file,
    records
  });

  console.log(
    "STORE:",
    file,
    "→",
    records,
    "top-level records"
  );
}

for (const file of backendSourceFiles) {

  const content =
    read(file);

  for (const candidate of dataCandidates) {

    const basename =
      path.basename(candidate);

    if (
      content.includes(basename)
    ) {

      results.dataStoreReferences.push({
        source: file,
        store: candidate,
        reference: "DIRECT_FILENAME_REFERENCE"
      });

      console.log(
        "REFERENCE:",
        file,
        "→",
        candidate
      );
    }
  }
}

console.log(`
10. CORRECT FRONTEND ↔ BACKEND API MATRIX
============================================================
`);

const uniqueFrontendCalls = [];

for (
  const call of
  results.frontendApiCalls
) {

  const key =
    `${call.method} ${normalizePath(call.endpoint)}`;

  if (
    !uniqueFrontendCalls.some(
      x => x.key === key
    )
  ) {

    uniqueFrontendCalls.push({
      ...call,
      key
    });
  }
}

const uniqueBackendRoutes = [];

for (
  const route of
  results.backendRoutes
) {

  const key =
    `${route.method} ${normalizePath(route.fullPath)}`;

  if (
    !uniqueBackendRoutes.some(
      x => x.key === key
    )
  ) {

    uniqueBackendRoutes.push({
      ...route,
      key
    });
  }
}

for (
  const call of
  uniqueFrontendCalls
) {

  const matches =
    uniqueBackendRoutes.filter(
      route =>
        routeMatches(
          call.endpoint,
          call.method,
          route.fullPath,
          route.method
        )
    );

  const status =
    matches.length
      ? "MATCH"
      : "NO_MATCH";

  results.apiMatrix.push({
    method: call.method,
    endpoint: normalizePath(call.endpoint),
    status,
    backendMatches:
      matches.map(
        x => ({
          method: x.method,
          path: x.fullPath,
          source: x.source
        })
      )
  });

  console.log(
    status,
    call.method,
    normalizePath(call.endpoint),
    matches.length
      ? `→ ${matches.map(x => `${x.method} ${x.fullPath}`).join(", ")}`
      : "→ NO EXACT BACKEND ROUTE"
  );
}

console.log(`
11. RIDE FILE REACHABILITY
============================================================
`);

const rideCandidates = [];

walk(
  path.join(ROOT, "frontend"),
  full => {

    const r =
      rel(full);

    if (
      /ride/i.test(r) &&
      SOURCE_EXTENSIONS.test(r)
    ) {

      rideCandidates.push(r);
    }
  }
);

walk(
  path.join(ROOT, "backend"),
  full => {

    const r =
      rel(full);

    if (
      /ride/i.test(r) &&
      SOURCE_EXTENSIONS.test(r)
    ) {

      rideCandidates.push(r);
    }
  }
);

const frontendReachable =
  new Set(
    results.frontendReachability
  );

const backendReachable =
  new Set();

for (
  const edge of
  results.backendDependencyGraph
) {

  if (edge.to) {

    backendReachable.add(
      edge.to
    );
  }

  backendReachable.add(
    edge.from
  );
}

for (
  const file of
  unique(rideCandidates)
) {

  let status =
    "NOT_PROVEN_REACHABLE";

  if (
    file.startsWith("frontend/") &&
    frontendReachable.has(file)
  ) {

    status =
      "FRONTEND_REACHABLE";

  } else if (
    file.startsWith("backend/") &&
    backendReachable.has(file)
  ) {

    status =
      "BACKEND_REACHABLE";
  }

  console.log(
    status,
    file
  );
}

console.log(`
12. SYNTAX / BUILD VALIDATION
============================================================
`);

for (const file of unique([
  ...frontendSourceFiles,
  ...backendSourceFiles
])) {

  const status =
    syntaxCheck(file);

  results.syntax.push({
    file,
    status
  });
}

const packageScripts = [
  "build",
  "check",
  "lint"
];

for (const script of packageScripts) {

  const command =
    packageScript(script);

  if (!command) continue;

  console.log(
    `PACKAGE SCRIPT FOUND: ${script} → ${command}`
  );
}

if (
  packageScript("build")
) {

  console.log(
    "RUNNING READ-ONLY BUILD VALIDATION..."
  );

  try {

    execSync(
      "npm run build",
      {
        cwd: ROOT,
        stdio: "pipe"
      }
    );

    results.build = {
      status: "PASS"
    };

    console.log(
      "BUILD: PASS"
    );

  } catch (error) {

    results.build = {
      status: "FAIL",
      output:
        (
          error.stdout?.toString() ||
          ""
        ) +
        (
          error.stderr?.toString() ||
          ""
        )
    };

    console.log(
      "BUILD: FAIL"
    );
  }
} else {

  results.build = {
    status: "NO_BUILD_SCRIPT"
  };

  console.log(
    "BUILD: NO BUILD SCRIPT"
  );
}

const apiMatches =
  results.apiMatrix.filter(
    x => x.status === "MATCH"
  ).length;

const apiNoMatches =
  results.apiMatrix.filter(
    x => x.status === "NO_MATCH"
  ).length;

const syntaxFails =
  results.syntax.filter(
    x => x.status === "FAIL"
  ).length;

const canonicalReachableCount =
  results.canonicalPath.filter(
    x =>
      x.status ===
      "REACHABLE_FROM_BACKEND_ENTRYPOINT"
  ).length;

const report = `# CABLINK STEP 8.1 — CORRECTED RUNTIME TRUTH AUDIT

Generated: ${new Date().toISOString()}

Status: READ-ONLY

No application files were modified by this audit.

---

# 1. EXECUTIVE SUMMARY

## Frontend Entrypoints

${results.frontendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

## Proven Active Frontend Reachability

${unique(results.frontendReachability).map(x => `- ${x}`).join("\n") || "- None"}

## Backend Entrypoints

${results.backendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

## API Compatibility

- Unique frontend API calls: ${uniqueFrontendCalls.length}
- Exact method/path matches: ${apiMatches}
- No exact backend match: ${apiNoMatches}

## Canonical Backend Reachability

- Canonical components proven reachable from backend entrypoint: ${canonicalReachableCount}/${canonicalTargets.length}

## Syntax

- Files checked: ${results.syntax.length}
- Node syntax failures: ${syntaxFails}

## Build

- Status: ${results.build?.status || "UNKNOWN"}

---

# 2. ACTIVE FRONTEND

${unique(results.frontendReachability).map(x => `- ${x}`).join("\n") || "- None"}

---

# 3. FRONTEND IMPORT GRAPH

${results.frontendImports.map(x =>
  `- \`${x.from}\` → \`${x.importPath}\` → ${x.to || "EXTERNAL/UNRESOLVED"}`
).join("\n") || "- None"}

---

# 4. FRONTEND API CALLS

${results.frontendApiCalls.map(x =>
  `- **${x.method} ${x.endpoint}** — ${x.file}`
).join("\n") || "- None"}

---

# 5. BACKEND ENTRYPOINT

${results.backendEntrypoints.map(x => `- ${x}`).join("\n") || "- None"}

---

# 6. BACKEND ROUTER MOUNTS

${results.backendMounts.map(x =>
  `- \`${x.mount}\` → \`${x.router}\``
).join("\n") || "- None"}

---

# 7. FULL BACKEND ROUTE MAP

${results.backendRoutes.map(x =>
  `- \`${x.method} ${x.fullPath}\` — ${x.source}`
).join("\n") || "- None"}

---

# 8. COMPLETE BACKEND DEPENDENCY GRAPH

${results.backendDependencyGraph.map(x =>
  `- \`${x.from}\` → \`${x.importPath}\` → ${x.to || "EXTERNAL/UNRESOLVED"}`
).join("\n") || "- None"}

---

# 9. CANONICAL RIDE PATH

${results.canonicalPath.map(x =>
  `- \`${x.file}\` — **${x.status}**`
).join("\n")}

---

# 10. DATA STORES

${results.dataStores.map(x =>
  `- \`${x.file}\` — ${x.records} top-level records`
).join("\n") || "- None"}

---

# 11. DATA STORE REFERENCES

${results.dataStoreReferences.map(x =>
  `- \`${x.source}\` → \`${x.store}\``
).join("\n") || "- No direct filename references detected"}

---

# 12. CORRECT FRONTEND ↔ BACKEND API MATRIX

| Frontend Method | Frontend Endpoint | Status | Backend Match |
|---|---|---|---|
${results.apiMatrix.map(x =>
  `| ${x.method} | \`${x.endpoint}\` | **${x.status}** | ${
    x.backendMatches.length
      ? x.backendMatches.map(m => `\`${m.method} ${m.path}\``).join("<br>")
      : "—"
  } |`
).join("\n") || "| — | — | — | — |"}

---

# 13. RIDE FILE REACHABILITY

${unique(rideCandidates).map(file => {

  let status = "NOT_PROVEN_REACHABLE";

  if (
    file.startsWith("frontend/") &&
    frontendReachable.has(file)
  ) {
    status = "FRONTEND_REACHABLE";
  }

  if (
    file.startsWith("backend/") &&
    backendReachable.has(file)
  ) {
    status = "BACKEND_REACHABLE";
  }

  return `- \`${file}\` — **${status}**`;

}).join("\n") || "- None"}

---

# 14. SYNTAX VALIDATION

${results.syntax.map(x =>
  `- ${x.status} — ${x.file}`
).join("\n")}

---

# 15. BUILD VALIDATION

Status: **${results.build?.status || "UNKNOWN"}**

${
  results.build?.output
    ? `\n\`\`\`\n${results.build.output.slice(-12000)}\n\`\`\``
    : ""
}

---

# 16. STEP 8.1 INTERPRETATION

This corrected audit is intended to establish runtime truth before destructive cleanup.

The audit distinguishes:

1. Frontend files reachable from the actual frontend entrypoint.
2. Backend files reachable from the backend entrypoint through recursive imports.
3. Exact frontend API method/path compatibility.
4. Canonical ride component reachability.
5. Direct data-store filename references.
6. Node syntax validation.
7. Actual project build validation.

IMPORTANT:

A file marked NOT_PROVEN_REACHABLE is NOT automatically safe to delete.

A file marked REACHABLE is NOT automatically the correct architecture.

No application files were modified.

---

# 17. NEXT DECISION GATE

The next repair decision should be based on:

- The actual frontend build result.
- The exact active React component chain.
- The exact backend dependency chain.
- The exact API mismatch list.
- The actual ride repository data-store reference.
- Any runtime errors produced after starting the backend and frontend.

No cleanup or deletion should occur until those findings are reviewed.
`;

fs.writeFileSync(
  OUT,
  report,
  "utf8"
);

console.log(`
============================================================
STEP 8.1 CORRECTED RUNTIME TRUTH AUDIT COMPLETE
============================================================

REPORT:
${OUT}

EXACT API MATCHES:
${apiMatches}

EXACT API NO-MATCHES:
${apiNoMatches}

NODE SYNTAX FAILURES:
${syntaxFails}

CANONICAL COMPONENTS REACHABLE:
${canonicalReachableCount}/${canonicalTargets.length}

BUILD STATUS:
${results.build?.status || "UNKNOWN"}

NO APPLICATION FILES WERE MODIFIED.
============================================================
`);
