#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="AUDIT_SERVERLESS_CANONICAL_RIDE_PATH_$STAMP.txt"

echo "============================================================"
echo "CABLINK — SERVERLESS CANONICAL RIDE PATH AUDIT"
echo "============================================================"
echo "ROOT: $ROOT"
echo "REPORT: $REPORT"
echo

{
echo "CABLINK — SERVERLESS CANONICAL RIDE PATH AUDIT"
echo "================================================"
echo "Timestamp: $STAMP"
echo "Root: $ROOT"
echo

echo "============================================================"
echo "1. SERVERLESS ENTRYPOINT"
echo "============================================================"

if [ -f api/index.js ]; then
  echo "PASS: api/index.js exists"
else
  echo "FAIL: api/index.js missing"
fi

echo
echo "package.json:"
node - <<'NODE'
const pkg = require("./package.json");
console.log("main:", pkg.main);
console.log("start:", pkg.scripts && pkg.scripts.start);
console.log("dev:", pkg.scripts && pkg.scripts.dev);
NODE

echo
echo "============================================================"
echo "2. CANONICAL IMPORTS IN api/index.js"
echo "============================================================"

grep -nE \
  'canonical/ride_engine|canonical/ride_repository|ride_legacy_adapter|rideEngine|rideRepository' \
  api/index.js \
  2>/dev/null || true

echo
echo "============================================================"
echo "3. LEGACY RIDE IMPORTS IN api/index.js"
echo "============================================================"

grep -nE \
  'ride_store|database/ride_repository|database/rideRepository|production/database_adapter' \
  api/index.js \
  2>/dev/null || true

echo
echo "============================================================"
echo "4. RIDE ROUTE DEFINITIONS"
echo "============================================================"

grep -nE \
  'app\.(get|post|patch|put|delete)|router\.(get|post|patch|put|delete)' \
  api/index.js \
  2>/dev/null | grep -Ei \
  'ride|trip|completion|accept|driver|state' \
  || true

echo
echo "============================================================"
echo "5. RIDE CREATION OPERATIONS"
echo "============================================================"

grep -nE \
  'createRide|rides\.push|db\.rides\.push|rideRepository\.create|repository\.create|writeFileSync|database\.write|firestore\.write' \
  api/index.js \
  2>/dev/null || true

echo
echo "============================================================"
echo "6. RIDE STATUS MUTATIONS"
echo "============================================================"

grep -nE \
  'status\s*=|status\s*:' \
  api/index.js \
  2>/dev/null | grep -Ei \
  'ride|trip|driver|complete|accept|state|status' \
  || true

echo
echo "============================================================"
echo "7. RIDE DATA FILE REFERENCES"
echo "============================================================"

grep -nE \
  'rides\.json|live_rides\.json|cablink_db\.json|database|storage' \
  api/index.js \
  2>/dev/null || true

echo
echo "============================================================"
echo "8. CANONICAL MODULE LOAD TEST"
echo "============================================================"

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");
const repo = require("./backend/canonical/ride_repository");
const adapter = require("./backend/canonical/ride_legacy_adapter");

console.log("Canonical engine loaded:", !!engine);
console.log("Canonical repository loaded:", !!repo);
console.log("Canonical adapter loaded:", !!adapter);
console.log("Canonical ride count:", engine.getAllRides().length);
NODE

echo
echo "============================================================"
echo "9. api/index.js SYNTAX"
echo "============================================================"

node --check api/index.js

echo "api/index.js syntax: PASS"

echo
echo "============================================================"
echo "10. SERVERLESS RUNTIME CLASSIFICATION"
echo "============================================================"

if grep -qE \
  'canonical/ride_engine|canonical/ride_repository|ride_legacy_adapter' \
  api/index.js
then
  echo "CANONICAL REFERENCES FOUND IN api/index.js"
else
  echo "WARNING: NO DIRECT CANONICAL RIDE REFERENCES FOUND"
fi

if grep -qE \
  'ride_store|database/ride_repository|database/rideRepository' \
  api/index.js
then
  echo "WARNING: LEGACY RIDE AUTHORITY REFERENCES FOUND"
else
  echo "NO DIRECT LEGACY RIDE AUTHORITY REFERENCES FOUND"
fi

echo
echo "============================================================"
echo "11. IMPORTANT: FULL RIDE ROUTE CONTEXT"
echo "============================================================"

echo "--- api/index.js ride-related sections ---"

grep -nEi \
  -B 8 -A 20 \
  '(/api/rides|createRide|rideRepository|rideEngine|ride\.status|firstAccept|finalRide|complete)' \
  api/index.js \
  2>/dev/null || true

echo
echo "============================================================"
echo "AUDIT COMPLETE"
echo "============================================================"

} | tee "$REPORT"

echo
echo "============================================================"
echo "REPORT CREATED:"
echo "$REPORT"
echo "============================================================"
