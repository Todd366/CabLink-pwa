#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="backups/canonical_ride_repair_$STAMP"

echo "============================================================"
echo "CABLINK — FINAL CANONICAL RIDE REPAIR"
echo "============================================================"
echo "ROOT: $ROOT"
echo "BACKUP: $BACKUP"
echo

mkdir -p "$BACKUP"

echo "[1/12] BACKING UP ACTIVE RIDE FILES..."

FILES=(
  backend/canonical/ride_engine.js
  backend/canonical/ride_repository.js
  backend/routes/rides.js
  backend/routes/completion_api.js
  backend/routes/ride_state_api.js
  backend/server/app.js
  backend/services/ride_completion_service.js
  backend/services/ride_state_service.js
  backend/services/ride_orchestrator_service.js
  backend/services/live_ride_service.js
  backend/services/ride_service.js
  backend/services/economy_ledger_service.js
  backend/services/ride_economy_service.js
  backend/data/rides.json
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
  fi
done

echo "BACKUP COMPLETE"
echo

echo "[2/12] VERIFYING CANONICAL ENGINE + REPOSITORY..."

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");
const repo = require("./backend/canonical/ride_repository");

const engineRequired = [
  "STATES",
  "TRANSITIONS",
  "createRide",
  "getRide",
  "getAllRides",
  "transition",
  "canTransition",
  "acceptRide"
];

const repoRequired = [
  "create",
  "findById",
  "all",
  "update",
  "accept"
];

for (const name of engineRequired) {
  if (!(name in engine)) {
    throw new Error("Missing canonical engine export: " + name);
  }
}

for (const name of repoRequired) {
  if (typeof repo[name] !== "function") {
    throw new Error("Missing canonical repository method: " + name);
  }
}

console.log("ENGINE:", Object.keys(engine));
console.log("REPOSITORY:", Object.keys(repo));
console.log("CANONICAL ENGINE + REPOSITORY VERIFIED");
NODE

echo

echo "[3/12] VERIFYING ROUTES USE CANONICAL ENGINE..."

node - <<'NODE'
const fs = require("fs");

const files = [
  "backend/routes/rides.js",
  "backend/services/ride_completion_service.js",
  "backend/canonical/ride_compatibility.js"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  const text = fs.readFileSync(file, "utf8");

  const canonical =
    text.includes("../canonical/ride_engine") ||
    text.includes("./ride_engine") ||
    text.includes("canonical/ride_engine");

  console.log(file, canonical ? "CANONICAL ENGINE LINKED" : "NO DIRECT ENGINE LINK");
}
NODE

echo

echo "[4/12] FINDING ACTIVE LEGACY IMPORTS..."

echo "---- ride_store imports ----"

grep -RInE \
  'require\(["'\'']\.\.?/.*ride_store|from ["'\'']\.\.?/.*ride_store' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  2>/dev/null || true

echo
echo "---- legacy database repository imports ----"

grep -RInE \
  'require\(["'\'']\.\.?/.*database/ride_repository|from ["'\'']\.\.?/.*database/ride_repository' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  2>/dev/null || true

echo

echo "[5/12] FINDING ALL ACTIVE RIDE CREATION PATHS..."

grep -RInE \
  'createRide\(|rides\.push|db\.rides\.push' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  2>/dev/null || true

echo

echo "[6/12] FINDING ALL ACTIVE RIDE STATUS MUTATIONS..."

grep -RInE \
  'status\s*=|status:|\.status\s*=' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  2>/dev/null | grep -Ei \
  'ride|rides|dispatch|trip|completion|economy|live' \
  || true

echo

echo "[7/12] VERIFYING CANONICAL STATE MACHINE..."

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");

const expected = {
  REQUESTED: ["MATCHING", "CANCELLED"],
  MATCHING: ["DRIVER_ASSIGNED", "CANCELLED"],
  DRIVER_ASSIGNED: ["DRIVER_ARRIVED", "CANCELLED"],
  DRIVER_ARRIVED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["STARTED"],
  STARTED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: []
};

for (const state of Object.keys(expected)) {
  const actual = engine.TRANSITIONS[state] || [];

  if (
    JSON.stringify(actual) !==
    JSON.stringify(expected[state])
  ) {
    console.error("STATE MISMATCH:", state);
    console.error("EXPECTED:", expected[state]);
    console.error("ACTUAL:", actual);
    process.exit(1);
  }
}

console.log("CANONICAL STATE MACHINE VERIFIED");
NODE

echo

echo "[8/12] VERIFYING CANONICAL DATA..."

node - <<'NODE'
const fs = require("fs");

const file = "backend/data/rides.json";
const rides = JSON.parse(fs.readFileSync(file, "utf8"));

if (!Array.isArray(rides)) {
  throw new Error("Canonical ride data is not an array");
}

const allowed = new Set([
  "REQUESTED",
  "MATCHING",
  "DRIVER_ASSIGNED",
  "DRIVER_ARRIVED",
  "PICKED_UP",
  "STARTED",
  "COMPLETED",
  "CANCELLED"
]);

const counts = {};
let errors = 0;

for (const ride of rides) {

  if (!ride.id) {
    console.error("MISSING RIDE ID:", ride);
    errors++;
  }

  if (!allowed.has(ride.status)) {
    console.error(
      "INVALID CANONICAL STATUS:",
      ride.id,
      ride.status
    );
    errors++;
  }

  counts[ride.status] =
    (counts[ride.status] || 0) + 1;
}

console.log("CANONICAL RIDE COUNT:", rides.length);
console.log("STATUS COUNTS:");
console.log(JSON.stringify(counts, null, 2));

if (errors > 0) {
  throw new Error(
    "Canonical data integrity failed with " +
    errors +
    " errors"
  );
}

console.log("CANONICAL DATA VERIFIED");
NODE

echo

echo "[9/12] VERIFYING SINGLE CANONICAL RIDE DATA FILE..."

node - <<'NODE'
const fs = require("fs");

const files = [
  "backend/data/rides.json",
  "backend/database/rides.json",
  "backend/storage/cablink_db.json",
  "backend/data/live_rides.json"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  try {
    const data = JSON.parse(
      fs.readFileSync(file, "utf8")
    );

    let count = 0;

    if (Array.isArray(data)) {
      count = data.length;
    } else if (Array.isArray(data.rides)) {
      count = data.rides.length;
    }

    console.log(
      file,
      "=>",
      count,
      "ride records"
    );
  } catch (e) {
    console.log(
      file,
      "=> INVALID JSON"
    );
  }
}

console.log();
console.log(
  "CANONICAL AUTHORITY:",
  "backend/data/rides.json"
);
NODE

echo

echo "[10/12] VERIFYING SERVER ROUTE REGISTRATION..."

grep -nE \
  'routes/rides|completion_api|ride_state_api|/api/rides|/api/ride' \
  backend/server/app.js \
  2>/dev/null || true

echo

echo "[11/12] RUNNING NODE SYNTAX CHECKS..."

node --check backend/canonical/ride_engine.js
node --check backend/canonical/ride_repository.js
node --check backend/routes/rides.js
node --check backend/routes/completion_api.js
node --check backend/routes/ride_state_api.js
node --check backend/services/ride_completion_service.js
node --check backend/services/ride_state_service.js
node --check backend/server/app.js

echo "NODE SYNTAX CHECKS PASSED"

echo

echo "[12/12] WRITING REPAIR REPORT..."

REPORT="FINAL_CANONICAL_RIDE_REPAIR_$STAMP.txt"

{
  echo "CABLINK FINAL CANONICAL RIDE REPAIR"
  echo "=================================="
  echo
  echo "Timestamp: $STAMP"
  echo "Root: $ROOT"
  echo "Backup: $BACKUP"
  echo
  echo "Canonical engine:"
  echo "backend/canonical/ride_engine.js"
  echo
  echo "Canonical repository:"
  echo "backend/canonical/ride_repository.js"
  echo
  echo "Canonical data:"
  echo "backend/data/rides.json"
  echo
  echo "Canonical API:"
  echo "backend/routes/rides.js"
  echo
  echo "Ride count:"
  node - <<'NODE'
const fs = require("fs");
const rides = JSON.parse(
  fs.readFileSync("backend/data/rides.json","utf8")
);
console.log(rides.length);
NODE

  echo
  echo "Git status:"
  git status --short
} > "$REPORT"

echo
echo "============================================================"
echo "CANONICAL RIDE REPAIR AUDIT COMPLETE"
echo "============================================================"
echo
echo "BACKUP:"
echo "$BACKUP"
echo
echo "REPORT:"
echo "$REPORT"
echo
echo "NO LEGACY FILES DELETED."
echo "NO DATA FILES MERGED AUTOMATICALLY."
echo
echo "The output above identifies the remaining live dependencies."
echo "============================================================"
