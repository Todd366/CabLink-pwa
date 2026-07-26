const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = process.cwd();
const REPORT = path.join(ROOT, "CABLINK_RUNTIME_TRUTH_AUDIT_V3_REPORT.md");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".vercel",
  "dist",
  "build",
  "coverage"
]);

const IGNORE_FILE_PATTERNS = [
  /\.backup/i,
  /\.bak$/i,
  /\.disabled$/i,
  /\.old$/i,
  /\.tmp$/i,
  /\.log$/i
];

const results = {
  metadata: {
    generatedAt: new Date().toISOString(),
    repository: ROOT,
    readOnly: true
  },
  files: [],
  entrypoints: [],
  package: {},
  build: {},
  servers: [],
  routes: [],
  frontendApiCalls: [],
  apiMatches: [],
  apiMismatches: [],
  stateMachines: [],
  fareEngines: [],
  databases: [],
  gpsRouting: [],
  rewardPayment: [],
  duplicates: [],
  runtimeEvidence: [],
  risks: [],
  canonicalCandidates: {},
  scores: {}
};

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) walk(full, out);
      continue;
    }

    if (IGNORE_FILE_PATTERNS.some(r => r.test(entry.name))) continue;

    out.push(full);
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function addRisk(level, title, detail) {
  results.risks.push({ level, title, detail });
}

function section(title) {
  return `\n## ${title}\n`;
}

const files = walk(ROOT);
results.files = files.map(rel);

console.log("==============================================================");
console.log("CABLINK RUNTIME TRUTH & CANONICAL ARCHITECTURE AUDIT v3");
console.log("==============================================================");
console.log(`Repository: ${ROOT}`);
console.log(`Files scanned: ${files.length}`);
console.log("READ-ONLY MODE");
console.log("No application source files will be modified.");
console.log("");

/* ============================================================
   1. PACKAGE / BUILD
============================================================ */

const packageFile = path.join(ROOT, "package.json");

if (fs.existsSync(packageFile)) {
  try {
    results.package = JSON.parse(read(packageFile));
  } catch {
    addRisk("HIGH", "Invalid package.json", "package.json exists but could not be parsed.");
  }
}

const pkg = results.package || {};

results.build = {
  packageJson: exists("package.json"),
  viteConfig: exists("vite.config.js") || exists("vite.config.mjs") || exists("vite.config.ts"),
  buildScript: !!(pkg.scripts && pkg.scripts.build),
  devScript: !!(pkg.scripts && (pkg.scripts.dev || pkg.scripts.start)),
  distExists: exists("dist"),
  vercelConfig: exists("vercel.json")
};

if (!results.build.buildScript) {
  addRisk(
    "HIGH",
    "No production build script",
    "package.json does not define a build script. Production frontend reproducibility is not established."
  );
}

if (!results.build.viteConfig) {
  addRisk(
    "MEDIUM",
    "Vite configuration not detected",
    "No Vite configuration was found at the repository root."
  );
}

/* ============================================================
   2. ENTRYPOINT DISCOVERY
============================================================ */

const htmlFiles = files.filter(f => /\.html$/i.test(f));

for (const file of htmlFiles) {
  const content = read(file);

  results.entrypoints.push({
    file: rel(file),
    hasRootMount:
      /id\s*=\s*["']root["']/i.test(content) ||
      /id\s*=\s*["']app["']/i.test(content),
    moduleScripts: [...content.matchAll(/<script[^>]+type=["']module["'][^>]*src=["']([^"']+)/gi)]
      .map(m => m[1]),
    localScripts: [...content.matchAll(/<script[^>]+src=["']([^"']+)/gi)]
      .map(m => m[1]),
    inlineScripts: (content.match(/<script(?![^>]+src=)/gi) || []).length,
    referencesReact:
      /react/i.test(content) ||
      /main\.jsx/i.test(content) ||
      /App\.jsx/i.test(content),
    referencesVite:
      /@vite/i.test(content) ||
      /main\.jsx/i.test(content)
  });
}

if (results.entrypoints.length > 1) {
  addRisk(
    "HIGH",
    "Multiple HTML entry candidates",
    `${results.entrypoints.length} HTML files exist. Runtime truth must establish which one is actually served in production.`
  );
}

/* ============================================================
   3. FRONTEND ENTRY CHAIN
============================================================ */

const frontendCandidates = [
  "frontend/main.jsx",
  "frontend/App.jsx",
  "frontend/index.html",
  "index.html",
  "launcher.html"
];

results.canonicalCandidates.frontend = frontendCandidates
  .filter(exists)
  .map(f => ({
    file: f,
    contentSize: read(path.join(ROOT, f)).length
  }));

/* ============================================================
   4. BACKEND SERVER DISCOVERY
============================================================ */

const serverCandidates = files.filter(f =>
  /(^|\/)(server|app|index)\.(js|mjs|cjs)$/i.test(f) ||
  /backend\/.*server.*\.(js|mjs|cjs)$/i.test(f)
);

for (const file of serverCandidates) {
  const content = read(file);

  const listens =
    /\.listen\s*\(/i.test(content) ||
    /createServer\s*\(/i.test(content);

  const usesExpress =
    /express\s*\(/i.test(content) ||
    /require\s*\(\s*["']express["']\s*\)/i.test(content) ||
    /from\s+["']express["']/i.test(content);

  if (listens || usesExpress) {
    results.servers.push({
      file: rel(file),
      listens,
      usesExpress,
      listenPorts: [...content.matchAll(/listen\s*\(\s*([^,\)]+)/gi)]
        .map(m => m[1].trim()),
      mounts: [...content.matchAll(/(?:app|router)\.use\s*\(\s*["']([^"']+)/gi)]
        .map(m => m[1])
    });
  }
}

if (results.servers.length > 1) {
  addRisk(
    "HIGH",
    "Multiple backend server candidates",
    `${results.servers.length} server-like files contain server startup or Express logic.`
  );
}

/* ============================================================
   5. ACTIVE ROUTE INVENTORY
============================================================ */

for (const file of files.filter(f => /\.(js|mjs|cjs)$/i.test(f))) {
  const content = read(file);

  const routeRegex =
    /(?:app|router)\.(get|post|put|patch|delete|use)\s*\(\s*["'`]([^"'`]+)["'`]/gi;

  for (const match of content.matchAll(routeRegex)) {
    results.routes.push({
      file: rel(file),
      method: match[1].toUpperCase(),
      path: match[2]
    });
  }
}

/* ============================================================
   6. FRONTEND API CALL FORENSICS
============================================================ */

for (const file of files.filter(f => /\.(js|jsx|ts|tsx|html)$/i.test(f))) {
  const content = read(file);

  const patterns = [
    /fetch\s*\(\s*["'`]([^"'`]+)["'`]/gi,
    /axios\.(get|post|put|patch|delete)\s*\(\s*["'`]([^"'`]+)["'`]/gi
  ];

  for (const regex of patterns) {
    for (const match of content.matchAll(regex)) {
      const isFetch = regex.source.startsWith("fetch");
      const method = isFetch ? "GET/POST?" : match[1].toUpperCase();
      const endpoint = isFetch ? match[1] : match[2];

      if (
        endpoint.startsWith("/api") ||
        endpoint.startsWith("http://") ||
        endpoint.startsWith("https://")
      ) {
        results.frontendApiCalls.push({
          file: rel(file),
          method,
          endpoint
        });
      }
    }
  }
}

function normalizeEndpoint(endpoint) {
  return endpoint
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\$\{[^}]+\}/g, ":param")
    .replace(/\/+$/, "") || "/";
}

function routeMatches(endpoint, routePath) {
  const a = normalizeEndpoint(endpoint);
  const b = normalizeEndpoint(routePath);

  if (a === b) return true;

  const aParts = a.split("/");
  const bParts = b.split("/");

  if (aParts.length !== bParts.length) return false;

  return aParts.every((part, i) => {
    return (
      part === bParts[i] ||
      part.startsWith(":") ||
      bParts[i].startsWith(":") ||
      part === ":param"
    );
  });
}

for (const call of results.frontendApiCalls) {
  const matches = results.routes.filter(route =>
    routeMatches(call.endpoint, route.path) ||
    routeMatches(
      call.endpoint.replace(/^\/api/, ""),
      route.path
    )
  );

  if (matches.length) {
    results.apiMatches.push({
      call,
      routes: matches
    });
  } else {
    results.apiMismatches.push(call);
  }
}

if (results.apiMismatches.length) {
  addRisk(
    "HIGH",
    "Frontend API calls without detected backend matches",
    `${results.apiMismatches.length} frontend API calls could not be mapped to detected backend routes.`
  );
}

/* ============================================================
   7. RIDE STATE MACHINE FORENSICS
============================================================ */

const rideStateWords = [
  "REQUESTED",
  "SEARCHING_DRIVER",
  "DRIVER_ASSIGNED",
  "DRIVER_ACCEPTED",
  "DRIVER_EN_ROUTE",
  "DRIVER_ARRIVED",
  "RIDE_STARTED",
  "RIDE_IN_PROGRESS",
  "RIDE_COMPLETED",
  "COMPLETED",
  "FARE_FINALIZED",
  "PAYMENT_SETTLED",
  "REWARD_ELIGIBLE",
  "REWARD_CLAIMED",
  "CANCELLED",
  "REJECTED",
  "NO_DRIVER",
  "FAILED"
];

for (const file of files.filter(f => /\.(js|jsx|ts|tsx)$/i.test(f))) {
  const content = read(file);

  const states = rideStateWords.filter(state =>
    new RegExp(`\\b${state}\\b`).test(content)
  );

  if (states.length) {
    results.stateMachines.push({
      file: rel(file),
      states
    });
  }
}

const stateMachineFiles = results.stateMachines
  .filter(x =>
    /state|lifecycle|ride_engine|rideService|orchestrator/i.test(x.file)
  );

if (stateMachineFiles.length > 1) {
  addRisk(
    "HIGH",
    "Multiple ride state implementations",
    `${stateMachineFiles.length} files contain ride-state logic. A single authoritative state machine must be verified.`
  );
}

/* ============================================================
   8. FARE ENGINE FORENSICS
============================================================ */

const fareKeywords = [
  "calculateFare",
  "calcTotalFare",
  "fare",
  "distanceRate",
  "baseFare",
  "fuel",
  "petrol",
  "commission"
];

for (const file of files.filter(f => /\.(js|jsx|ts|tsx)$/i.test(f))) {
  const content = read(file);

  const hits = fareKeywords.filter(k =>
    new RegExp(`\\b${k}\\b`, "i").test(content)
  );

  if (hits.length >= 2) {
    results.fareEngines.push({
      file: rel(file),
      hits
    });
  }
}

if (results.fareEngines.length > 5) {
  addRisk(
    "HIGH",
    "Fare logic is distributed across multiple files",
    `${results.fareEngines.length} files contain significant fare-related logic.`
  );
}

/* ============================================================
   9. DATABASE / STORAGE FORENSICS
============================================================ */

const storagePatterns = [
  /firebase/i,
  /firestore/i,
  /supabase/i,
  /mongodb/i,
  /mongoose/i,
  /postgres/i,
  /mysql/i,
  /sqlite/i,
  /jsonfile/i,
  /readFileSync/i,
  /writeFileSync/i,
  /database/i,
  /repository/i,
  /store/i
];

for (const file of files.filter(f => /\.(js|jsx|ts|tsx|json)$/i.test(f))) {
  const content = read(file);

  const hits = storagePatterns.filter(regex => regex.test(content));

  if (hits.length >= 2) {
    results.databases.push({
      file: rel(file),
      hits: hits.map(x => x.toString())
    });
  }
}

const storageSystems = [
  "Firebase",
  "Firestore",
  "Supabase",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "JSON storage"
];

for (const system of storageSystems) {
  const found = files.some(file => {
    const content = read(file);
    return new RegExp(system.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(content);
  });

  if (found) results.canonicalCandidates[system] = "DETECTED";
}

if (results.databases.length > 10) {
  addRisk(
    "HIGH",
    "Multiple competing storage implementations",
    "The repository contains substantial evidence of multiple database/storage strategies."
  );
}

/* ============================================================
   10. GPS / ROUTING FORENSICS
============================================================ */

const geoKeywords = [
  "navigator.geolocation",
  "geolocation",
  "watchPosition",
  "getCurrentPosition",
  "haversine",
  "distance",
  "routing",
  "route",
  "ETA",
  "maps",
  "leaflet",
  "Mapbox",
  "Google Maps",
  "OpenStreetMap",
  "OSRM"
];

for (const file of files.filter(f => /\.(js|jsx|ts|tsx|html)$/i.test(f))) {
  const content = read(file);

  const hits = geoKeywords.filter(k =>
    new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(content)
  );

  if (hits.length >= 2) {
    results.gpsRouting.push({
      file: rel(file),
      hits
    });
  }
}

const hasHaversine = results.gpsRouting.some(x =>
  x.hits.some(h => /haversine/i.test(h))
);

const hasRoadRouting = results.gpsRouting.some(x =>
  x.hits.some(h => /routing|OSRM|Mapbox|Google Maps/i.test(h))
);

if (hasHaversine && !hasRoadRouting) {
  addRisk(
    "HIGH",
    "Straight-line distance may be used without verified road routing",
    "Haversine logic was detected but no clear road-routing provider was verified."
  );
}

/* ============================================================
   11. PAYMENT / REWARD FORENSICS
============================================================ */

const paymentRewardKeywords = [
  "payment",
  "settlement",
  "commission",
  "reward",
  "THB",
  "wallet",
  "blockchain",
  "transaction",
  "claim"
];

for (const file of files.filter(f => /\.(js|jsx|ts|tsx)$/i.test(f))) {
  const content = read(file);

  const hits = paymentRewardKeywords.filter(k =>
    new RegExp(`\\b${k}\\b`, "i").test(content)
  );

  if (hits.length >= 3) {
    results.rewardPayment.push({
      file: rel(file),
      hits
    });
  }
}

/* ============================================================
   12. DUPLICATE CORE FUNCTIONS
============================================================ */

const functionDefinitions = {};

for (const file of files.filter(f => /\.(js|jsx|ts|tsx)$/i.test(f))) {
  const content = read(file);

  const patterns = [
    /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g,
    /([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?function\s*\(/g
  ];

  for (const regex of patterns) {
    for (const match of content.matchAll(regex)) {
      const name = match[1];

      if (!functionDefinitions[name]) {
        functionDefinitions[name] = [];
      }

      functionDefinitions[name].push(rel(file));
    }
  }
}

for (const [name, locations] of Object.entries(functionDefinitions)) {
  const unique = [...new Set(locations)];

  if (unique.length > 1) {
    results.duplicates.push({
      function: name,
      locations: unique
    });
  }
}

const criticalNames = [
  "bookRide",
  "requestRide",
  "toggleDriverMode",
  "acceptRealRequest",
  "completeRide",
  "calculateFare",
  "calcTotalFare",
  "updateFareDisplay",
  "haversineKm",
  "pollForRideRequests"
];

for (const name of criticalNames) {
  if (functionDefinitions[name] && functionDefinitions[name].length > 1) {
    addRisk(
      "HIGH",
      `Duplicate critical function: ${name}`,
      `Found in ${[...new Set(functionDefinitions[name])].length} files. Runtime authority is unresolved.`
    );
  }
}

/* ============================================================
   13. CANONICAL CANDIDATE SCORING
============================================================ */

function scoreFile(file, keywords) {
  const content = read(path.join(ROOT, file));
  let score = 0;

  for (const keyword of keywords) {
    if (new RegExp(keyword, "i").test(content)) score++;
  }

  return score;
}

const backendCandidates = serverCandidates
  .map(file => ({
    file: rel(file),
    score: scoreFile(rel(file), [
      "\\.listen",
      "express",
      "app\\.use",
      "app\\.get",
      "app\\.post"
    ])
  }))
  .sort((a, b) => b.score - a.score);

const frontendCandidatesScored = results.canonicalCandidates.frontend
  .map(x => ({
    file: x.file,
    score: scoreFile(x.file, [
      "root",
      "main\\.jsx",
      "App\\.jsx",
      "react",
      "vite"
    ])
  }))
  .sort((a, b) => b.score - a.score);

results.canonicalCandidates.backend = backendCandidates;
results.canonicalCandidates.frontendRanked = frontendCandidatesScored;

if (backendCandidates.length) {
  results.canonicalCandidates.backendTop = backendCandidates[0];
}

if (frontendCandidatesScored.length) {
  results.canonicalCandidates.frontendTop = frontendCandidatesScored[0];
}

/* ============================================================
   14. RUNTIME COMMAND EVIDENCE
============================================================ */

const commandsToCheck = [
  ["npm", ["run", "build"]],
  ["npm", ["run", "dev"]]
];

for (const [cmd, args] of commandsToCheck) {
  try {
    const result = cp.spawnSync(cmd, args, {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 120000
    });

    results.runtimeEvidence.push({
      command: `${cmd} ${args.join(" ")}`,
      exitCode: result.status,
      stdout: (result.stdout || "").slice(-3000),
      stderr: (result.stderr || "").slice(-3000)
    });
  } catch (e) {
    results.runtimeEvidence.push({
      command: `${cmd} ${args.join(" ")}`,
      error: e.message
    });
  }
}

/* ============================================================
   15. SCORING
============================================================ */

const totalApi = results.frontendApiCalls.length;
const matchedApi = results.apiMatches.length;

const apiScore = totalApi
  ? Math.round((matchedApi / totalApi) * 100)
  : 0;

const buildScore =
  (results.build.packageJson ? 25 : 0) +
  (results.build.viteConfig ? 25 : 0) +
  (results.build.buildScript ? 25 : 0) +
  (results.build.distExists ? 25 : 0);

const architectureScore = Math.max(
  0,
  100 -
  results.risks.filter(x => x.level === "HIGH").length * 15 -
  results.risks.filter(x => x.level === "MEDIUM").length * 5
);

results.scores = {
  frontendBackendApiMatch: apiScore,
  buildReadiness: buildScore,
  architectureIntegrity: architectureScore
};

/* ============================================================
   REPORT GENERATION
============================================================ */

let report = "";

report += `# CABLINK RUNTIME TRUTH & CANONICAL ARCHITECTURE AUDIT v3\n\n`;
report += `Generated: ${results.metadata.generatedAt}\n`;
report += `Repository: ${ROOT}\n`;
report += `Mode: READ-ONLY\n\n`;

report += `> This audit attempts to determine what CabLink actually runs, what connects, and where canonical ownership is unresolved. It does not modify application source files.\n`;

report += section("EXECUTIVE SUMMARY");

report += `- Files scanned: **${files.length}**\n`;
report += `- HTML entry candidates: **${results.entrypoints.length}**\n`;
report += `- Backend server candidates: **${results.servers.length}**\n`;
report += `- Backend route definitions detected: **${results.routes.length}**\n`;
report += `- Frontend API calls detected: **${results.frontendApiCalls.length}**\n`;
report += `- Frontend API calls with detected matches: **${results.apiMatches.length}**\n`;
report += `- Frontend API calls without detected matches: **${results.apiMismatches.length}**\n`;
report += `- Ride state-machine candidates: **${stateMachineFiles.length}**\n`;
report += `- Fare-related implementations: **${results.fareEngines.length}**\n`;
report += `- Duplicate functions across files: **${results.duplicates.length}**\n`;

report += section("CANONICALITY SCORES");

report += `- Frontend ↔ Backend API Match: **${apiScore}%**\n`;
report += `- Build Readiness: **${buildScore}%**\n`;
report += `- Architecture Integrity Heuristic: **${architectureScore}%**\n`;

report += section("CANONICAL FRONTEND CANDIDATES");

for (const item of frontendCandidatesScored) {
  report += `- ${item.file} — score ${item.score}\n`;
}

if (results.canonicalCandidates.frontendTop) {
  report += `\n**Highest-scoring frontend candidate:** ${results.canonicalCandidates.frontendTop.file}\n`;
}

report += section("CANONICAL BACKEND CANDIDATES");

for (const item of backendCandidates) {
  report += `- ${item.file} — score ${item.score}\n`;
}

if (results.canonicalCandidates.backendTop) {
  report += `\n**Highest-scoring backend candidate:** ${results.canonicalCandidates.backendTop.file}\n`;
}

report += section("HTML ENTRYPOINT INVENTORY");

for (const item of results.entrypoints) {
  report += `### ${item.file}\n`;
  report += `- Root/App mount: ${item.hasRootMount ? "YES" : "NO"}\n`;
  report += `- React/Vite indicators: ${item.referencesReact ? "YES" : "NO"}\n`;
  report += `- Module scripts: ${item.moduleScripts.join(", ") || "NONE"}\n`;
  report += `- Local scripts: ${item.localScripts.join(", ") || "NONE"}\n`;
  report += `- Inline scripts: ${item.inlineScripts}\n\n`;
}

report += section("BACKEND SERVER CANDIDATES");

for (const item of results.servers) {
  report += `### ${item.file}\n`;
  report += `- Express detected: ${item.usesExpress}\n`;
  report += `- Server listen detected: ${item.listens}\n`;
  report += `- Ports/arguments: ${item.listenPorts.join(", ") || "UNKNOWN"}\n`;
  report += `- Mounted prefixes: ${item.mounts.join(", ") || "NONE DETECTED"}\n\n`;
}

report += section("UNMATCHED FRONTEND API CALLS");

if (!results.apiMismatches.length) {
  report += `✅ No unmatched frontend API calls detected by static route comparison.\n`;
} else {
  for (const item of results.apiMismatches) {
    report += `- ❌ ${item.method} ${item.endpoint} — ${item.file}\n`;
  }
}

report += section("RIDE STATE MACHINE FORENSICS");

for (const item of stateMachineFiles) {
  report += `### ${item.file}\n`;
  report += `States: ${item.states.join(", ")}\n\n`;
}

report += section("FARE ENGINE FORENSICS");

for (const item of results.fareEngines) {
  report += `- ${item.file} — ${item.hits.join(", ")}\n`;
}

report += section("DATABASE / STORAGE FORENSICS");

for (const item of results.databases) {
  report += `- ${item.file} — ${item.hits.join(", ")}\n`;
}

report += section("GPS / ROUTING FORENSICS");

for (const item of results.gpsRouting) {
  report += `- ${item.file} — ${item.hits.join(", ")}\n`;
}

report += section("PAYMENT / SETTLEMENT / REWARD FORENSICS");

for (const item of results.rewardPayment) {
  report += `- ${item.file} — ${item.hits.join(", ")}\n`;
}

report += section("DUPLICATE FUNCTION FORENSICS");

for (const item of results.duplicates) {
  report += `### ${item.function}\n`;
  report += item.locations.map(x => `- ${x}`).join("\n");
  report += "\n\n";
}

report += section("BUILD / RUNTIME EVIDENCE");

for (const item of results.runtimeEvidence) {
  report += `### ${item.command}\n`;
  report += `- Exit code: ${item.exitCode ?? "UNKNOWN"}\n`;

  if (item.error) {
    report += `- Error: ${item.error}\n`;
  }

  if (item.stdout) {
    report += `\nSTDOUT:\n\`\`\`\n${item.stdout}\n\`\`\`\n`;
  }

  if (item.stderr) {
    report += `\nSTDERR:\n\`\`\`\n${item.stderr}\n\`\`\`\n`;
  }
}

report += section("RISK REGISTER");

if (!results.risks.length) {
  report += `✅ No major static risks detected.\n`;
} else {
  for (const risk of results.risks) {
    report += `### ${risk.level} — ${risk.title}\n`;
    report += `${risk.detail}\n\n`;
  }
}

report += section("FINAL CANONICALITY VERDICT");

report += `
The purpose of this audit is to answer five questions:

1. Which frontend is actually canonical?
2. Which backend server is actually canonical?
3. Which API contracts actually connect?
4. Which ride/fare/location implementations are authoritative?
5. Which parts of CabLink remain duplicated, conflicting, or unverified?

### Classification Rules

🟢 VERIFIED LIVE
- Runtime evidence confirms the component is active and connected.

🟡 PRESENT BUT UNVERIFIED
- Code exists but runtime execution was not proven.

🟠 CONFLICTING
- Multiple competing implementations exist.

🔴 BROKEN
- Runtime or static evidence shows a failed dependency or disconnected contract.

⚫ DEAD / UNUSED
- No active runtime path could be established.

### IMPORTANT

This audit is intentionally conservative.

The existence of a function, route, database adapter, or UI component does NOT prove that it is part of the production runtime.

The final source of truth must be established from:

- package scripts
- actual Vite entry chain
- actual backend startup
- actual mounted routes
- API request/response contracts
- runtime build results
- real end-to-end smoke tests

No source files were modified by this audit.
`;

fs.writeFileSync(REPORT, report, "utf8");

console.log("");
console.log("==============================================================");
console.log("RUNTIME TRUTH AUDIT v3 COMPLETE");
console.log("==============================================================");
console.log(`Files scanned: ${files.length}`);
console.log(`HTML entry candidates: ${results.entrypoints.length}`);
console.log(`Backend server candidates: ${results.servers.length}`);
console.log(`Frontend API calls: ${results.frontendApiCalls.length}`);
console.log(`Matched API calls: ${results.apiMatches.length}`);
console.log(`Unmatched API calls: ${results.apiMismatches.length}`);
console.log(`Ride state candidates: ${stateMachineFiles.length}`);
console.log(`Fare implementations: ${results.fareEngines.length}`);
console.log(`Duplicate functions: ${results.duplicates.length}`);
console.log(`HIGH risks: ${results.risks.filter(x => x.level === "HIGH").length}`);
console.log("");
console.log(`REPORT: ${REPORT}`);
console.log("");
console.log("No application source files were modified.");
console.log("==============================================================");
