const fs = require("fs");
const path = require("path");

console.log(`
============================================================
CABLINK O.8.59 — ACTIVE RIDE PATH + REPOSITORY AUTHORITY TRACE
============================================================
NO FILES MODIFIED
NO FILES DELETED
============================================================
`);

const ROOT = process.cwd();

const targets = [
  "backend/database/ride_repository.js",
  "backend/canonical/ride_repository.js",
  "backend/canonical/ride_engine.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/services/ride_state_service.js",
  "backend/routes/rides.js",
  "backend/server.js"
];

function readFile(file) {
  const full = path.join(ROOT, file);

  if (!fs.existsSync(full)) {
    return null;
  }

  try {
    return fs.readFileSync(full, "utf8");
  } catch (err) {
    return null;
  }
}

function printSection(title) {
  console.log(`
============================================================
${title}
============================================================
`);
}

function showFileStatus() {

  printSection("A. TARGET FILE STATUS");

  for (const file of targets) {

    const full = path.join(ROOT, file);

    console.log(
      fs.existsSync(full)
        ? `[FOUND]   ${file}`
        : `[MISSING] ${file}`
    );

  }

}

function showFile(file) {

  const text = readFile(file);

  if (text === null) {
    console.log(`\n[UNAVAILABLE] ${file}`);
    return;
  }

  console.log(`\n--- ${file} ---`);

  const lines = text.split("\n");

  lines.forEach((line, index) => {

    console.log(
      `${String(index + 1).padStart(4, " ")} | ${line}`
    );

  });

}

function findReferences(file, patterns) {

  const text = readFile(file);

  if (text === null) {
    return [];
  }

  const results = [];
  const lines = text.split("\n");

  lines.forEach((line, index) => {

    for (const pattern of patterns) {

      pattern.lastIndex = 0;

      if (pattern.test(line)) {

        results.push({
          line: index + 1,
          pattern: pattern.source,
          code: line.trim()
        });

        break;

      }

    }

  });

  return results;

}

function showReferences(file, patterns) {

  const results = findReferences(file, patterns);

  console.log(`\n--- ${file} ---`);

  if (results.length === 0) {

    console.log("NONE DETECTED");

    return;

  }

  results.forEach(result => {

    console.log(
      `${file}:${result.line}`
    );

    console.log(
      `  ${result.code}`
    );

  });

}

/* ============================================================
A. FILE STATUS
============================================================ */

showFileStatus();

/* ============================================================
B. DATABASE REPOSITORY
============================================================ */

printSection("B. DATABASE RIDE REPOSITORY — IMPLEMENTATION");

showFile("backend/database/ride_repository.js");

/* ============================================================
C. CANONICAL REPOSITORY
============================================================ */

printSection("C. CANONICAL RIDE REPOSITORY — IMPLEMENTATION");

showFile("backend/canonical/ride_repository.js");

/* ============================================================
D. CANONICAL RIDE ENGINE
============================================================ */

printSection("D. CANONICAL RIDE ENGINE — IMPLEMENTATION");

showFile("backend/canonical/ride_engine.js");

/* ============================================================
E. ORCHESTRATOR
============================================================ */

printSection("E. RIDE ORCHESTRATOR — IMPLEMENTATION");

showFile("backend/services/ride_orchestrator_service.js");

/* ============================================================
F. STATE SERVICE
============================================================ */

printSection("F. RIDE STATE SERVICE — IMPLEMENTATION");

showFile("backend/services/ride_state_service.js");

/* ============================================================
G. RIDE ROUTES
============================================================ */

printSection("G. ACTIVE RIDE ROUTES — IMPLEMENTATION");

showFile("backend/routes/rides.js");

/* ============================================================
H. SERVER REGISTRATION
============================================================ */

printSection("H. SERVER ROUTE REGISTRATION");

showReferences(
  "backend/server.js",
  [
    /app\.use\s*\(/,
    /rideRoutes/,
    /routes\/rides/,
    /\/api\/rides/,
    /economy\/ride/,
    /\/api\/ride/
  ]
);

/* ============================================================
I. DATABASE REPOSITORY IMPORTS
============================================================ */

printSection("I. DATABASE REPOSITORY IMPORTS");

for (const file of targets) {

  showReferences(
    file,
    [
      /require\s*\(\s*["'][^"']*database[\/\\]ride_repository["']\s*\)/,
      /from\s+["'][^"']*database[\/\\]ride_repository["']/,
      /require\s*\(\s*["'][^"']*canonical[\/\\]ride_repository["']\s*\)/,
      /from\s+["'][^"']*canonical[\/\\]ride_repository["']/
    ]
  );

}

/* ============================================================
J. RIDE CREATION PATHS
============================================================ */

printSection("J. RIDE CREATION PATHS");

for (const file of targets) {

  showReferences(
    file,
    [
      /\.create\s*\(/,
      /createRide\s*\(/,
      /createRideRequest\s*\(/,
      /newRide\s*\(/,
      /insert\s*\(/,
      /rides\.push\s*\(/,
      /data\.rides\.push\s*\(/,
      /rideRepository\.create\s*\(/,
      /repository\.create\s*\(/
    ]
  );

}

/* ============================================================
K. RIDE UPDATE PATHS
============================================================ */

printSection("K. RIDE UPDATE / PERSISTENCE PATHS");

for (const file of targets) {

  showReferences(
    file,
    [
      /\.update\s*\(/,
      /updateRide\s*\(/,
      /updateStatus\s*\(/,
      /setStatus\s*\(/,
      /saveRide\s*\(/,
      /rideRepository\.update\s*\(/,
      /repository\.update\s*\(/,
      /db\.read\s*\(/,
      /db\.write\s*\(/,
      /data\.rides/,
      /rides\[/,
      /rides\.find/
    ]
  );

}

/* ============================================================
L. RIDE ID GENERATION
============================================================ */

printSection("L. RIDE ID GENERATION");

for (const file of targets) {

  showReferences(
    file,
    [
      /RIDE-[A-Za-z0-9_-]*/,
      /Date\.now\s*\(/,
      /rideId/,
      /id\s*:\s*["'`]RIDE/,
      /id\s*=\s*["'`]RIDE/
    ]
  );

}

/* ============================================================
M. STATUS MUTATION
============================================================ */

printSection("M. RIDE STATUS MUTATION");

for (const file of targets) {

  showReferences(
    file,
    [
      /status\s*=/,
      /status\s*:/,
      /ride\.status/,
      /r\.status/,
      /updateStatus/,
      /transition/,
      /nextState/
    ]
  );

}

/* ============================================================
N. DRIVER ASSIGNMENT
============================================================ */

printSection("N. DRIVER ASSIGNMENT PATH");

for (const file of targets) {

  showReferences(
    file,
    [
      /assignDriver/,
      /driverId/,
      /DRIVER_ASSIGNED/,
      /ASSIGNED/,
      /matching/,
      /matchDriver/,
      /findDriver/,
      /availableDriver/
    ]
  );

}

/* ============================================================
O. RIDE COMPLETION
============================================================ */

printSection("O. RIDE COMPLETION PATH");

for (const file of targets) {

  showReferences(
    file,
    [
      /completeRide/,
      /complete\s*\(/,
      /TRIP_COMPLETED/,
      /RIDE_COMPLETED/,
      /COMPLETED/,
      /ride\/complete/,
      /\/complete/
    ]
  );

}

/* ============================================================
P. API ENDPOINT MAP
============================================================ */

printSection("P. API ENDPOINT MAP");

for (const file of targets) {

  showReferences(
    file,
    [
      /app\.post\s*\(/,
      /app\.get\s*\(/,
      /app\.patch\s*\(/,
      /app\.put\s*\(/,
      /app\.delete\s*\(/,
      /router\.post\s*\(/,
      /router\.get\s*\(/,
      /router\.patch\s*\(/,
      /router\.put\s*\(/,
      /router\.delete\s*\(/,
      /\/api\/rides/,
      /\/api\/ride/
    ]
  );

}

/* ============================================================
Q. IMPORT GRAPH SUMMARY
============================================================ */

printSection("Q. IMPORT GRAPH SUMMARY");

const dbRepoConsumers = [];
const canonicalRepoConsumers = [];
const orchestratorConsumers = [];
const stateServiceConsumers = [];

for (const file of targets) {

  const text = readFile(file);

  if (text === null) continue;

  if (
    /database[\/\\]ride_repository/.test(text)
  ) {
    dbRepoConsumers.push(file);
  }

  if (
    /canonical[\/\\]ride_repository/.test(text)
  ) {
    canonicalRepoConsumers.push(file);
  }

  if (
    /ride_orchestrator_service/.test(text)
  ) {
    orchestratorConsumers.push(file);
  }

  if (
    /ride_state_service/.test(text)
  ) {
    stateServiceConsumers.push(file);
  }

}

console.log(
  "DATABASE REPOSITORY CONSUMERS:"
);

dbRepoConsumers.forEach(
  file => console.log(`  - ${file}`)
);

if (dbRepoConsumers.length === 0) {
  console.log("  NONE");
}

console.log(
  "\nCANONICAL REPOSITORY CONSUMERS:"
);

canonicalRepoConsumers.forEach(
  file => console.log(`  - ${file}`)
);

if (canonicalRepoConsumers.length === 0) {
  console.log("  NONE");
}

console.log(
  "\nORCHESTRATOR CONSUMERS:"
);

orchestratorConsumers.forEach(
  file => console.log(`  - ${file}`)
);

if (orchestratorConsumers.length === 0) {
  console.log("  NONE");
}

console.log(
  "\nSTATE SERVICE CONSUMERS:"
);

stateServiceConsumers.forEach(
  file => console.log(`  - ${file}`)
);

if (stateServiceConsumers.length === 0) {
  console.log("  NONE");
}

/* ============================================================
R. AUTHORITY CLASSIFICATION
============================================================ */

printSection("R. O.8.59 PRELIMINARY AUTHORITY CLASSIFICATION");

const dbRepoExists =
  fs.existsSync(
    path.join(
      ROOT,
      "backend/database/ride_repository.js"
    )
  );

const canonicalRepoExists =
  fs.existsSync(
    path.join(
      ROOT,
      "backend/canonical/ride_repository.js"
    )
  );

const orchestratorExists =
  fs.existsSync(
    path.join(
      ROOT,
      "backend/services/ride_orchestrator_service.js"
    )
  );

const stateServiceExists =
  fs.existsSync(
    path.join(
      ROOT,
      "backend/services/ride_state_service.js"
    )
  );

console.log(
  `DATABASE REPOSITORY EXISTS: ${dbRepoExists}`
);

console.log(
  `CANONICAL REPOSITORY EXISTS: ${canonicalRepoExists}`
);

console.log(
  `ORCHESTRATOR EXISTS: ${orchestratorExists}`
);

console.log(
  `STATE SERVICE EXISTS: ${stateServiceExists}`
);

console.log(`
CLASSIFICATION RULE:

1. If active routes reach database/ride_repository.js,
   DATABASE REPOSITORY = POSSIBLE ACTIVE AUTHORITY.

2. If active routes reach canonical/ride_repository.js,
   CANONICAL REPOSITORY = POSSIBLE ACTIVE AUTHORITY.

3. If both are reachable through active ride routes,
   RESULT = MULTIPLE POSSIBLE RIDE AUTHORITIES.

4. If services use database/ride_repository.js but no
   active route reaches those services,
   RESULT = SERVICE-LEVEL LEGACY OR SUPPORTING PATH.

5. If orchestrator and state service both mutate rides
   independently, RESULT = POTENTIAL STATE OWNERSHIP CONFLICT.

6. If multiple components generate RIDE-* identifiers,
   RESULT = POTENTIAL ID GENERATION CONFLICT.

IMPORTANT:
This script reports structural evidence only.
It does not claim runtime execution without a live request.
`);

/* ============================================================
S. FINAL TRACE QUESTIONS
============================================================ */

printSection("S. O.8.59 FINAL TRACE QUESTIONS");

console.log(`
1. Which route creates a ride?

2. Which function actually persists that ride?

3. Which repository does that function use?

4. Which database/storage file receives the ride?

5. Does the canonical repository participate in creation?

6. Does the database repository participate in creation?

7. Does ride_orchestrator_service.js participate in creation?

8. Does ride_state_service.js participate in creation?

9. Which component performs driver assignment?

10. Which component performs status transitions?

11. Which component performs ride completion?

12. Which component writes the final COMPLETED state?

13. Are there multiple ride ID generators?

14. Are there multiple ride persistence authorities?

15. Are there multiple status authorities?

16. Can one ride be created in one repository and updated
    in another repository?

17. Is canonical/ride_repository.js actually on the active
    HTTP execution path?

18. Is database/ride_repository.js actually on the active
    HTTP execution path?

19. Is ride_orchestrator_service.js actually on the active
    HTTP execution path?

20. Is ride_state_service.js actually on the active
    HTTP execution path?

============================================================
O.8.59 COMPLETE
NO FILES MODIFIED
NO FILES DELETED
============================================================
`);

