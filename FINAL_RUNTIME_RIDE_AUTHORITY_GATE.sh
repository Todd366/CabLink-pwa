#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="FINAL_RUNTIME_RIDE_AUTHORITY_GATE_$STAMP.txt"

echo "============================================================"
echo "CABLINK — FINAL RUNTIME RIDE AUTHORITY GATE"
echo "============================================================"
echo "ROOT: $ROOT"
echo "REPORT: $REPORT"
echo

{
echo "CABLINK — FINAL RUNTIME RIDE AUTHORITY GATE"
echo "============================================"
echo "Timestamp: $STAMP"
echo "Root: $ROOT"
echo

echo "============================================================"
echo "1. PACKAGE ENTRYPOINT"
echo "============================================================"

node - <<'NODE'
const fs = require("fs");

const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));

console.log("package.json main:", pkg.main || "(none)");
console.log("package.json start:", pkg.scripts && pkg.scripts.start || "(none)");
console.log("package.json dev:", pkg.scripts && pkg.scripts.dev || "(none)");
NODE

echo

echo "============================================================"
echo "2. SERVER ENTRYPOINT CANDIDATES"
echo "============================================================"

for f in \
  backend/server.js \
  backend/server/app.js \
  api/index.js \
  server.js \
  index.js
do
  if [ -f "$f" ]; then
    echo "FOUND: $f"
  fi
done

echo

echo "============================================================"
echo "3. ACTIVE RIDE ROUTE REGISTRATION"
echo "============================================================"

grep -RInE \
  'app\.use|router\.use|require\(.*routes|require\(.*ride|module\.exports' \
  backend/server.js \
  backend/server/app.js \
  api/index.js \
  2>/dev/null || true

echo

echo "============================================================"
echo "4. ALL ACTIVE IMPORTS INTO RIDE AUTHORITIES"
echo "============================================================"

grep -RInE \
  'ride_engine|ride_repository|ride_legacy_adapter|ride_store|ride_state_service|ride_service|ride_orchestrator_service|live_ride_service|database/ride_repository' \
  backend \
  api \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null || true

echo

echo "============================================================"
echo "5. ALL RIDE CREATION WRITERS"
echo "============================================================"

grep -RInE \
  'createRide\s*\(|rides\.push\s*\(|db\.rides\.push\s*\(|data\.rides\.push\s*\(' \
  backend \
  api \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null || true

echo

echo "============================================================"
echo "6. ALL RIDE STATUS WRITERS"
echo "============================================================"

grep -RInE \
  'status\s*=|\.status\s*=|status\s*:' \
  backend \
  api \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null | \
grep -Ei \
  'ride|rides|dispatch|trip|completion|economy|live|lifecycle|state' \
  || true

echo

echo "============================================================"
echo "7. ALL RIDE DATA FILE WRITERS"
echo "============================================================"

grep -RInE \
  'writeFileSync|writeFile|\.write\(' \
  backend \
  api \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null | \
grep -Ei \
  'ride|rides|database|storage|firestore' \
  || true

echo

echo "============================================================"
echo "8. CANONICAL ENGINE DEPENDENCY TEST"
echo "============================================================"

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");
const repo = require("./backend/canonical/ride_repository");
const adapter = require("./backend/canonical/ride_legacy_adapter");

console.log("Canonical engine loaded:", !!engine);
console.log("Canonical repository loaded:", !!repo);
console.log("Canonical adapter loaded:", !!adapter);

console.log("Canonical rides:", engine.getAllRides().length);
NODE

echo

echo "============================================================"
echo "9. COMPATIBILITY ADAPTER API CONTRACT"
echo "============================================================"

node - <<'NODE'
const adapter = require("./backend/canonical/ride_legacy_adapter");

const required = [
  "createRide",
  "getRide",
  "getAllRides",
  "updateRide",
  "acceptRide"
];

for (const name of required) {
  console.log(
    name,
    typeof adapter[name] === "function"
      ? "OK"
      : "MISSING"
  );
}

if (typeof adapter.getRides !== "function") {
  console.log("WARNING: ride_api_patch.js expects getRides(), but adapter does not export getRides()");
}

NODE

echo

echo "============================================================"
echo "10. LEGACY RUNTIME REACHABILITY CHECK"
echo "============================================================"

node - <<'NODE'
const fs = require("fs");

const files = [
  "backend/ride_api_patch.js",
  "backend/ride_store.js",
  "backend/services/ride_orchestrator_service.js",
  "backend/database/ride_repository.js",
  "backend/database/rideRepository.js",
  "backend/services/ride_service.js",
  "backend/services/live_ride_service.js",
  "backend/rides/ride_lifecycle.js"
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(file, "=> MISSING");
    continue;
  }

  const text = fs.readFileSync(file,"utf8");

  console.log(
    file,
    "=>",
    text.includes("module.exports")
      ? "MODULE PRESENT"
      : "NO MODULE EXPORT DETECTED"
  );
}
NODE

echo

echo "============================================================"
echo "11. CANONICAL DATA COUNTS"
echo "============================================================"

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
    const data = JSON.parse(fs.readFileSync(file,"utf8"));

    let count = 0;

    if (Array.isArray(data)) {
      count = data.length;
    } else if (Array.isArray(data.rides)) {
      count = data.rides.length;
    }

    console.log(file, "=>", count);
  } catch {
    console.log(file, "=> INVALID JSON");
  }
}
NODE

echo

echo "============================================================"
echo "12. GIT STATUS"
echo "============================================================"

git status --short

echo

echo "============================================================"
echo "GATE RESULT"
echo "============================================================"

echo "Canonical authority:"
echo "backend/canonical/ride_engine.js"
echo "backend/canonical/ride_repository.js"
echo "backend/data/rides.json"

echo
echo "This audit does NOT delete files."
echo "This audit does NOT modify ride data."
echo "This audit identifies runtime-reachable authorities."
echo

} | tee "$REPORT"

echo
echo "============================================================"
echo "AUDIT FINISHED"
echo "============================================================"
echo "REPORT: $REPORT"
echo
