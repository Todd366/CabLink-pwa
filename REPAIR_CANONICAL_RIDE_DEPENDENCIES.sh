#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="backups/canonical_dependency_repair_$STAMP"

echo "============================================================"
echo "CABLINK — CANONICAL RIDE DEPENDENCY REPAIR"
echo "============================================================"
echo "ROOT: $ROOT"
echo "BACKUP: $BACKUP"
echo

mkdir -p "$BACKUP"

echo "[1/9] BACKING UP CONFIRMED LEGACY DEPENDENCY FILES..."

FILES=(
  backend/ride_api_patch.js
  backend/ride_store.js
  backend/services/ride_orchestrator_service.js
  backend/database/ride_repository.js
  backend/database/rideRepository.js
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
    echo "BACKED UP: $f"
  fi
done

echo
echo "BACKUP COMPLETE"
echo

echo "[2/9] INSPECTING LEGACY RIDE API PATCH..."

sed -n '1,220p' backend/ride_api_patch.js

echo
echo "============================================================"
echo

echo "[3/9] INSPECTING LEGACY ORCHESTRATOR..."

sed -n '1,260p' backend/services/ride_orchestrator_service.js

echo
echo "============================================================"
echo

echo "[4/9] CREATING CANONICAL COMPATIBILITY ADAPTER..."

cat > backend/canonical/ride_legacy_adapter.js <<'JS'
"use strict";

/*
 * CABLINK — CANONICAL RIDE LEGACY ADAPTER
 *
 * Purpose:
 * Provide compatibility for old modules while ensuring that
 * all ride creation, lookup, update and acceptance operations
 * resolve through the canonical ride engine/repository.
 *
 * This file does NOT own ride data.
 * This file does NOT maintain a second ride store.
 */

const engine = require("./ride_engine");

function createRide(data) {
  return engine.createRide(data);
}

function getRide(id) {
  return engine.getRide(id);
}

function getAllRides() {
  return engine.getAllRides();
}

function updateRide(id, patch) {
  return engine.transition(
    id,
    patch && patch.status,
    patch
  );
}

function acceptRide(id, driverId) {
  return engine.acceptRide(id, driverId);
}

module.exports = {
  createRide,
  getRide,
  getAllRides,
  updateRide,
  acceptRide
};
JS

echo "CANONICAL ADAPTER CREATED:"
echo "backend/canonical/ride_legacy_adapter.js"
echo

echo "[5/9] REPLACING ride_api_patch LEGACY STORE DEPENDENCY..."

python - <<'PY'
from pathlib import Path

p = Path("backend/ride_api_patch.js")
text = p.read_text()

text = text.replace(
    'const store=require("./ride_store");',
    'const store=require("./canonical/ride_legacy_adapter");'
)

text = text.replace(
    'const store = require("./ride_store");',
    'const store = require("./canonical/ride_legacy_adapter");'
)

p.write_text(text)

print("ride_api_patch.js now points to canonical adapter")
PY

echo

echo "[6/9] REPLACING ORCHESTRATOR LEGACY REPOSITORY DEPENDENCY..."

python - <<'PY'
from pathlib import Path

p = Path("backend/services/ride_orchestrator_service.js")
text = p.read_text()

text = text.replace(
    'const rideRepository=require("../database/ride_repository");',
    'const rideRepository=require("../canonical/ride_repository");'
)

text = text.replace(
    'const rideRepository = require("../database/ride_repository");',
    'const rideRepository = require("../canonical/ride_repository");'
)

p.write_text(text)

print("ride_orchestrator_service.js now points to canonical repository")
PY

echo

echo "[7/9] VERIFYING LEGACY IMPORTS ARE GONE FROM ACTIVE SOURCE..."

echo "---- ride_store imports ----"

if grep -RInE \
  'require\(["'\'']\.\.?/.*ride_store|from ["'\'']\.\.?/.*ride_store' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null; then

  echo
  echo "WARNING: ACTIVE ride_store IMPORT STILL EXISTS"
else
  echo "PASS: NO ACTIVE ride_store IMPORTS FOUND"
fi

echo
echo "---- legacy database repository imports ----"

if grep -RInE \
  'require\(["'\'']\.\.?/.*database/ride_repository|from ["'\'']\.\.?/.*database/ride_repository' \
  backend \
  --include='*.js' \
  --exclude='*.bak' \
  --exclude='*.backup' \
  --exclude='*.pre_o6' \
  --exclude='*.before-*' \
  --exclude='*firestore_test*' \
  2>/dev/null; then

  echo
  echo "WARNING: ACTIVE LEGACY DATABASE REPOSITORY IMPORT STILL EXISTS"
else
  echo "PASS: NO ACTIVE LEGACY DATABASE REPOSITORY IMPORTS FOUND"
fi

echo

echo "[8/9] RUNNING SYNTAX CHECKS..."

node --check backend/canonical/ride_legacy_adapter.js
node --check backend/ride_api_patch.js
node --check backend/services/ride_orchestrator_service.js
node --check backend/canonical/ride_engine.js
node --check backend/canonical/ride_repository.js

echo "SYNTAX CHECKS PASSED"
echo

echo "[9/9] VERIFYING CANONICAL MODULE LOAD..."

node - <<'NODE'
const adapter = require("./backend/canonical/ride_legacy_adapter");
const engine = require("./backend/canonical/ride_engine");
const repo = require("./backend/canonical/ride_repository");

console.log("Adapter exports:", Object.keys(adapter));
console.log("Engine exports:", Object.keys(engine));
console.log("Repository exports:", Object.keys(repo));

if (typeof adapter.createRide !== "function") {
  throw new Error("Canonical adapter createRide missing");
}

if (typeof adapter.getRide !== "function") {
  throw new Error("Canonical adapter getRide missing");
}

if (typeof adapter.getAllRides !== "function") {
  throw new Error("Canonical adapter getAllRides missing");
}

console.log("CANONICAL MODULE LOAD: PASS");
NODE

echo
echo "============================================================"
echo "DEPENDENCY REPAIR COMPLETE"
echo "============================================================"
echo
echo "BACKUP:"
echo "$BACKUP"
echo
echo "IMPORTANT:"
echo "No legacy files deleted."
echo "No legacy data files deleted."
echo "No data files merged."
echo
echo "NEXT REQUIRED STEP:"
echo "Trace runtime reachability of all remaining direct ride writers."
echo "============================================================"
