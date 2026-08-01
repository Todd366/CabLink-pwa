const fs = require("fs");
const path = require("path");

console.log(`
========================================================
CABLINK O.8.53 — RUNTIME RIDE WRITE AUTHORITY TRACE
========================================================
`);

const ROOT = process.cwd();

const TARGETS = [
  "backend/server/app.js",
  "backend/routes/rides.js",
  "backend/routes/completion_api.js",
  "backend/routes/live_ride_api.js",

  "backend/services/live_ride_service.js",
  "backend/services/dispatch_service.js",
  "backend/services/ride_completion_service.js",
  "backend/services/canonical_reward_service.js",
  "backend/services/economy_ledger_service.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/ride_event_service.js",

  "backend/canonical/ride_engine.js",
  "backend/canonical/ride_repository.js"
];

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

function lines(file) {
  return read(file).split(/\r?\n/);
}

function report(file, line, type, code, meaning) {
  console.log(`
${file}:${line}
  [${type}]
  ${code.trim()}
  -> ${meaning}`);
}

console.log(`
========================================================
A. ACTIVE HTTP RIDE ROUTES
========================================================
`);

const app = read("backend/server/app.js");

if (app.includes('app.use("/api/rides",rideRoutes)') ||
    app.includes("app.use('/api/rides',rideRoutes)")) {
  report(
    "backend/server/app.js",
    lines("backend/server/app.js").findIndex(x => x.includes("rideRoutes")) + 1,
    "CANONICAL RIDE ROUTE",
    "app.use('/api/rides', rideRoutes)",
    "Requests enter canonical ride API"
  );
}

if (app.includes("completionRoutes")) {
  report(
    "backend/server/app.js",
    lines("backend/server/app.js").findIndex(x => x.includes("completionRoutes")) + 1,
    "COMPLETION ROUTE",
    "app.use('/api', completionRoutes)",
    "Ride completion endpoint is active"
  );
}

if (app.includes("liveRideRoutes")) {
  report(
    "backend/server/app.js",
    lines("backend/server/app.js").findIndex(x => x.includes("liveRideRoutes")) + 1,
    "LEGACY LIVE RIDE ROUTE",
    "app.use('/api', liveRideRoutes)",
    "Legacy live-ride API remains runtime reachable"
  );
}

console.log(`
========================================================
B. CANONICAL ENGINE WRITE PATHS
========================================================
`);

const engineLines = lines("backend/canonical/ride_engine.js");

engineLines.forEach((line, i) => {
  if (
    /repository\.(create|update|save|delete)\s*\(/.test(line) ||
    /transition\s*\(/.test(line)
  ) {
    report(
      "backend/canonical/ride_engine.js",
      i + 1,
      "CANONICAL RIDE WRITE / TRANSITION",
      line,
      "Ride lifecycle or persistence operation occurs through canonical engine"
    );
  }
});

console.log(`
========================================================
C. DIRECT RIDE STATE MUTATIONS
========================================================
`);

const directTargets = [
  "backend/services/dispatch_service.js",
  "backend/services/live_ride_service.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/ride_completion_service.js",
  "backend/services/economy_ledger_service.js",
  "backend/services/canonical_reward_service.js"
];

const mutationPatterns = [
  /(?:ride|request|r)\.status\s*=/,
  /(?:ride|request|r)\[['"]status['"]\]\s*=/,
  /(?:ride|request|r)\.(?:acceptedAt|completedAt|startedAt|cancelledAt|driverId|passengerId)\s*=/,
  /\.push\s*\(/,
  /\.splice\s*\(/,
  /\.filter\s*\(/,
  /JSON\.stringify\s*\(/,
  /writeFile(?:Sync)?\s*\(/,
  /appendFile(?:Sync)?\s*\(/
];

for (const file of directTargets) {
  if (!exists(file)) continue;

  lines(file).forEach((line, i) => {
    if (mutationPatterns.some(pattern => pattern.test(line))) {
      let type = "POTENTIAL DIRECT RIDE MUTATION";

      if (/writeFile|appendFile|JSON\.stringify/.test(line)) {
        type = "DIRECT PERSISTENCE OPERATION";
      }

      if (/\.filter\s*\(/.test(line)) {
        type = "POTENTIAL READ / COLLECTION OPERATION";
      }

      report(
        file,
        i + 1,
        type,
        line,
        "Requires authority classification"
      );
    }
  });
}

console.log(`
========================================================
D. LEGACY LIVE-RIDE STORAGE PATH
========================================================
`);

const legacy = "backend/services/live_ride_service.js";

if (exists(legacy)) {
  const legacyLines = lines(legacy);

  legacyLines.forEach((line, i) => {
    if (
      /live_rides\.json/.test(line) ||
      /writeFile(?:Sync)?/.test(line) ||
      /readFile(?:Sync)?/.test(line) ||
      /JSON\.stringify/.test(line)
    ) {
      report(
        legacy,
        i + 1,
        "LEGACY STORAGE OPERATION",
        line,
        "Potential independent ride state persistence"
      );
    }
  });
}

console.log(`
========================================================
E. CANONICAL REPOSITORY STORAGE
========================================================
`);

const repo = "backend/canonical/ride_repository.js";

if (exists(repo)) {
  lines(repo).forEach((line, i) => {
    if (
      /rides\.json/.test(line) ||
      /writeFile(?:Sync)?/.test(line) ||
      /readFile(?:Sync)?/.test(line)
    ) {
      report(
        repo,
        i + 1,
        "CANONICAL STORAGE OPERATION",
        line,
        "Canonical ride persistence path"
      );
    }
  });
}

console.log(`
========================================================
F. SERVICE → ENGINE DEPENDENCY CHECK
========================================================
`);

const services = [
  "backend/services/dispatch_service.js",
  "backend/services/live_ride_service.js",
  "backend/services/ride_completion_service.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/canonical_reward_service.js",
  "backend/services/economy_ledger_service.js"
];

for (const file of services) {
  if (!exists(file)) continue;

  const content = read(file);

  const usesEngine =
    content.includes("ride_engine") ||
    content.includes("engine.transition") ||
    content.includes("engine.create") ||
    content.includes("engine.update");

  console.log(`
${file}
  CANONICAL ENGINE DEPENDENCY: ${usesEngine ? "YES" : "NO"}
`);
}

console.log(`
========================================================
G. RUNTIME AUTHORITY CLASSIFICATION
========================================================
`);

const classifications = [];

function classify(file, label) {
  if (!exists(file)) return;

  classifications.push({
    file,
    label
  });
}

classify(
  "backend/routes/rides.js",
  "CANONICAL RIDE ENTRY POINT"
);

classify(
  "backend/canonical/ride_engine.js",
  "CANONICAL RIDE AUTHORITY"
);

classify(
  "backend/canonical/ride_repository.js",
  "CANONICAL RIDE PERSISTENCE"
);

classify(
  "backend/routes/live_ride_api.js",
  "LEGACY RIDE ENTRY POINT — REQUIRES DISCONNECTION REVIEW"
);

classify(
  "backend/services/live_ride_service.js",
  "LEGACY RIDE SERVICE — REQUIRES MIGRATION / RETIREMENT REVIEW"
);

classify(
  "backend/services/dispatch_service.js",
  "DISPATCH SERVICE — DIRECT MUTATION REVIEW REQUIRED"
);

classify(
  "backend/services/ride_completion_service.js",
  "CANONICAL COMPLETION SERVICE"
);

classify(
  "backend/services/economy_ledger_service.js",
  "ECONOMY SERVICE — READ/WRITE VERIFICATION REQUIRED"
);

classify(
  "backend/services/ride_orchestrator_service.js",
  "ORCHESTRATOR — AUTHORITY VERIFICATION REQUIRED"
);

for (const item of classifications) {
  console.log(`${item.label}
  ${item.file}
`);
}

console.log(`
========================================================
O.8.53 VERDICT
========================================================

RUNTIME WRITE AUTHORITY TRACE COMPLETE.

NEXT MIGRATION ORDER:

1. VERIFY FRONTEND DEPENDENCIES ON LEGACY LIVE-RIDE API.
2. TRACE EVERY LEGACY ENDPOINT TO ITS CALLERS.
3. DISCONNECT LEGACY ROUTE ONLY AFTER DEPENDENCY CONFIRMATION.
4. MIGRATE DISPATCH STATE TRANSITIONS INTO ride_engine.js.
5. VERIFY ECONOMY LEDGER IS READ-ONLY.
6. VERIFY RIDE ORCHESTRATOR DOES NOT BYPASS CANONICAL ENGINE.
7. RE-RUN O.8.52 AUTHORITY CLASSIFICATION.
8. RE-RUN O.8.53 WRITE AUTHORITY TRACE.
9. ONLY THEN RETIRE LEGACY RIDE FILES.

========================================================
O.8.53 COMPLETE
========================================================
`);
