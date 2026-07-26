const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();

const OUT = path.join(ROOT, "CABLINK_STEP7_RUNTIME_ALIGNMENT_REPORT.md");

const results = {
  activeEntrypoints: [],
  frontendScripts: [],
  frontendApiCalls: [],
  backendImports: [],
  backendRoutes: [],
  canonicalReferences: [],
  legacyReferences: [],
  runtimeRisks: [],
  missingEndpoints: [],
  syntax: []
};

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  try {
    return fs.readFileSync(path.join(ROOT, file), "utf8");
  } catch {
    return "";
  }
}

function section(title) {
  return `\n## ${title}\n`;
}

function grepFiles(pattern, dirs = []) {
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const name of fs.readdirSync(dir)) {
      if (
        [
          "node_modules",
          ".git",
          "dist",
          "archive",
          "logs",
          ".vscode",
          ".idea"
        ].includes(name)
      ) continue;

      const full = path.join(dir, name);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        walk(full);
      } else if (
        /\.(js|jsx|ts|tsx|html|json)$/.test(name)
      ) {
        const content = read(path.relative(ROOT, full));

        if (pattern.test(content)) {
          files.push(path.relative(ROOT, full));
        }
      }
    }
  }

  if (dirs.length) {
    dirs.forEach(d => walk(path.join(ROOT, d)));
  } else {
    walk(ROOT);
  }

  return [...new Set(files)];
}

function extractMatches(file, regex) {
  const content = read(file);
  const matches = [];
  let m;

  while ((m = regex.exec(content)) !== null) {
    matches.push(m[0]);
  }

  return [...new Set(matches)];
}

console.log(`
============================================================
CABLINK — STEP 7 RUNTIME ALIGNMENT AUDIT
============================================================
READ-ONLY
NO FILES WILL BE MODIFIED
============================================================
`);

// ============================================================
// 1. ACTIVE FRONTEND ENTRYPOINT
// ============================================================

console.log("1. FRONTEND ENTRYPOINT");
console.log("============================================================");

const indexFile = "frontend/index.html";

if (exists(indexFile)) {
  results.activeEntrypoints.push(indexFile);

  const html = read(indexFile);

  const scriptMatches = [
    ...html.matchAll(
      /<script[^>]+src=["']([^"']+)["']/gi
    )
  ];

  for (const match of scriptMatches) {
    results.frontendScripts.push(match[1]);
    console.log("SCRIPT:", match[1]);
  }

  console.log(
    "Inline script blocks:",
    (html.match(/<script\b/gi) || []).length
  );

} else {
  console.log("❌ frontend/index.html not found");
}

// ============================================================
// 2. FRONTEND API CALLS
// ============================================================

console.log(`
2. FRONTEND API CALLS
============================================================`);

const frontendFiles = grepFiles(
  /fetch\s*\(|axios|\/api\/rides/,
  ["frontend"]
);

for (const file of frontendFiles) {

  const content = read(file);

  const matches = [
    ...content.matchAll(
      /(?:fetch|axios\.(?:get|post|patch|put|delete))\s*\(\s*['"`]([^'"`]+)['"`]/g
    )
  ];

  if (matches.length) {

    console.log(`\n${file}`);

    for (const match of matches) {
      const endpoint = match[1];

      results.frontendApiCalls.push({
        file,
        endpoint
      });

      console.log("  →", endpoint);
    }
  }
}

// ============================================================
// 3. BACKEND ENTRYPOINT IMPORT GRAPH
// ============================================================

console.log(`
3. BACKEND ENTRYPOINT
============================================================`);

const backendEntry = "backend/server.js";

if (exists(backendEntry)) {

  const content = read(backendEntry);

  const imports = [
    ...content.matchAll(
      /require\s*\(\s*["']([^"']+)["']\s*\)/g
    )
  ];

  for (const match of imports) {

    results.backendImports.push({
      file: backendEntry,
      import: match[1]
    });

    console.log(
      backendEntry,
      "→",
      match[1]
    );
  }
}

// ============================================================
// 4. ACTIVE SERVER APP ROUTES
// ============================================================

console.log(`
4. ACTIVE BACKEND ROUTES
============================================================`);

const appFile = "backend/server/app.js";

if (exists(appFile)) {

  const content = read(appFile);

  const routeMatches = [
    ...content.matchAll(
      /app\.(get|post|patch|put|delete)\s*\(\s*["']([^"']+)["']/gi
    )
  ];

  for (const match of routeMatches) {

    results.backendRoutes.push({
      method: match[1].toUpperCase(),
      route: match[2]
    });

    console.log(
      match[1].toUpperCase(),
      match[2]
    );
  }

  const mountMatches = [
    ...content.matchAll(
      /app\.use\s*\(\s*["']([^"']+)["']\s*,\s*([A-Za-z0-9_]+)/g
    )
  ];

  for (const match of mountMatches) {

    console.log(
      "MOUNT",
      match[1],
      "→",
      match[2]
    );
  }
}

// ============================================================
// 5. CANONICAL RIDE REFERENCES
// ============================================================

console.log(`
5. CANONICAL RIDE REFERENCES
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

  results.canonicalReferences.push(file);

  console.log("CANONICAL:", file);
}

// ============================================================
// 6. LEGACY RIDE SYSTEM REFERENCES
// ============================================================

console.log(`
6. LEGACY RIDE SYSTEM REFERENCES
============================================================`);

const legacyPatterns = [
  /DRIVER_FOUND/,
  /DRIVER_ACCEPTED/,
  /TRIP_STARTED/,
  /TRIP_COMPLETED/,
  /SEARCHING/,
  /\/api\/rides\/request/,
  /\/api\/rides\/[^"'` ]+\/accept/
];

const legacyFiles = grepFiles(
  new RegExp(
    legacyPatterns
      .map(r => r.source)
      .join("|")
  )
);

for (const file of legacyFiles) {

  if (
    file.includes("CABLINK_STEP7") ||
    file.includes("node_modules")
  ) continue;

  results.legacyReferences.push(file);

  console.log(
    "LEGACY REFERENCE:",
    file
  );
}

// ============================================================
// 7. ENDPOINT COMPATIBILITY CHECK
// ============================================================

console.log(`
7. ENDPOINT COMPATIBILITY
============================================================`);

const canonicalEndpoints = new Set([
  "POST /api/rides",
  "GET /api/rides",
  "GET /api/rides/:id",
  "PATCH /api/rides/:id"
]);

const knownLegacyEndpoints = [
  "/api/rides/request",
  "/api/rides/:id/accept",
  "/api/rides/:id/complete"
];

for (const item of results.frontendApiCalls) {

  const endpoint = item.endpoint;

  if (
    knownLegacyEndpoints.some(
      legacy =>
        endpoint.includes(
          legacy
            .replace(":id", "")
        )
    )
  ) {

    results.missingEndpoints.push({
      file: item.file,
      endpoint
    });

    console.log(
      "⚠️ POSSIBLE NON-CANONICAL ENDPOINT:",
      item.file,
      endpoint
    );
  }
}

// ============================================================
// 8. RIDE STORE INVENTORY
// ============================================================

console.log(`
8. RIDE DATA STORE INVENTORY
============================================================`);

const stores = [
  "backend/data/rides.json",
  "backend/database/rides.json",
  "backend/storage/cablink_db.json",
  "backend/data/dispatch_requests.json",
  "backend/data/ride_events.json",
  "backend/data/economy_ledger.json"
];

for (const file of stores) {

  if (exists(file)) {

    let count = 0;

    try {

      const data =
        JSON.parse(read(file));

      if (Array.isArray(data)) {
        count = data.length;
      } else if (data && typeof data === "object") {
        count = Object.keys(data).length;
      }

    } catch {}

    console.log(
      file,
      "→",
      count,
      "top-level records"
    );
  }
}

// ============================================================
// 9. RUNTIME SYNTAX CHECK
// ============================================================

console.log(`
9. RUNTIME SYNTAX CHECK
============================================================`);

const syntaxFiles = [
  "backend/server.js",
  "backend/server/app.js",
  "backend/routes/rides.js",
  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js",
  "frontend/js/app_core.js",
  "frontend/js/ride_engine.js",
  "frontend/js/operations_core.js",
  "frontend/js/simulation_engine.js",
  "frontend/js/driver/driverDispatchBridge.js",
  "frontend/js/rides/rideController.js",
  "frontend/js/rides/rideStateMachine.js"
];

for (const file of syntaxFiles) {

  if (!exists(file)) {

    results.syntax.push({
      file,
      status: "SKIP"
    });

    continue;
  }

  try {

    execSync(
      `node --check "${path.join(ROOT, file)}"`,
      {
        stdio: "ignore"
      }
    );

    results.syntax.push({
      file,
      status: "PASS"
    });

    console.log("PASS", file);

  } catch {

    results.syntax.push({
      file,
      status: "FAIL"
    });

    console.log("FAIL", file);
  }
}

// ============================================================
// 10. REPORT
// ============================================================

let report = `# CABLINK STEP 7 — RUNTIME ALIGNMENT AUDIT

Generated: ${new Date().toISOString()}

Status: READ-ONLY AUDIT

No application files were modified by this audit.

---

${section("1. ACTIVE FRONTEND ENTRYPOINT")}

${results.activeEntrypoints.map(x => `- ${x}`).join("\n") || "- None found"}

### Scripts loaded by frontend/index.html

${results.frontendScripts.map(x => `- ${x}`).join("\n") || "- No external scripts found"}

---

${section("2. FRONTEND API CALLS")}

${results.frontendApiCalls.map(x =>
  `- **${x.file}** → \`${x.endpoint}\``
).join("\n") || "- None detected"}

---

${section("3. BACKEND IMPORTS FROM SERVER ENTRYPOINT")}

${results.backendImports.map(x =>
  `- \`${x.file}\` → \`${x.import}\``
).join("\n") || "- None detected"}

---

${section("4. ACTIVE BACKEND ROUTES")}

${results.backendRoutes.map(x =>
  `- \`${x.method} ${x.route}\``
).join("\n") || "- No direct routes detected in app.js"}

---

${section("5. CANONICAL RIDE COMPONENTS")}

${results.canonicalReferences.map(x =>
  `- ${x}`
).join("\n")}

---

${section("6. LEGACY RIDE REFERENCES")}

${results.legacyReferences.map(x =>
  `- ${x}`
).join("\n") || "- None detected"}

---

${section("7. POSSIBLE NON-CANONICAL ENDPOINTS")}

${results.missingEndpoints.map(x =>
  `- **${x.file}** → \`${x.endpoint}\``
).join("\n") || "- None detected"}

---

${section("8. RIDE DATA STORES")}

${stores
  .filter(exists)
  .map(x => `- ${x}`)
  .join("\n") || "- None found"}

---

${section("9. SYNTAX CHECK")}

${results.syntax.map(x =>
  `- ${x.status} — ${x.file}`
).join("\n")}

---

${section("10. STEP 7 INTERPRETATION")}

The purpose of this audit is to determine:

1. Which frontend entrypoint is actually active.
2. Which JavaScript files are loaded by the active frontend.
3. Which backend entrypoint is actually active.
4. Which backend modules are imported by the active server.
5. Which ride API endpoints are actually called by frontend code.
6. Which legacy ride states and systems remain referenced.
7. Whether frontend calls match the canonical backend API.
8. How many competing ride data stores remain.
9. Whether the inspected runtime JavaScript passes syntax validation.

This report is evidence for the next canonical runtime alignment phase.

`;

fs.writeFileSync(
  OUT,
  report,
  "utf8"
);

console.log(`
============================================================
STEP 7 RUNTIME ALIGNMENT AUDIT COMPLETE
============================================================

REPORT:
${OUT}

NO FILES WERE MODIFIED.
============================================================
`);
