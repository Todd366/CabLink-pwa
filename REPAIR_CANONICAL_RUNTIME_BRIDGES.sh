#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP="backups/canonical_runtime_bridges_$STAMP"

echo "============================================================"
echo "CABLINK — CANONICAL RUNTIME BRIDGE REPAIR"
echo "============================================================"
echo "ROOT: $ROOT"
echo "BACKUP: $BACKUP"
echo

mkdir -p "$BACKUP"

echo "[1/8] BACKING UP RUNTIME BRIDGE FILES..."

FILES=(
  backend/canonical/ride_legacy_adapter.js
  backend/services/ride_state_service.js
  backend/services/ride_orchestrator_service.js
  backend/services/live_ride_service.js
  backend/routes/ride_state_api.js
  backend/routes/orchestrator_api.js
  backend/routes/live_ride_api.js
  backend/ride_api_patch.js
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

echo "[2/8] READING CANONICAL ENGINE CONTRACT..."

node - <<'NODE'
const engine = require("./backend/canonical/ride_engine");

console.log("STATES:");
console.log(JSON.stringify(engine.STATES, null, 2));

console.log();
console.log("TRANSITIONS:");
console.log(JSON.stringify(engine.TRANSITIONS, null, 2));

console.log();
console.log("Canonical ride count:", engine.getAllRides().length);
NODE

echo

echo "[3/8] REPAIRING LEGACY COMPATIBILITY ADAPTER..."

cat > backend/canonical/ride_legacy_adapter.js <<'JS'
"use strict";

/*
 * CABLINK — CANONICAL RIDE LEGACY ADAPTER
 *
 * Compatibility facade only.
 *
 * This module owns NO ride data.
 * All persistent ride operations resolve through:
 *
 *   canonical ride_engine
 *       ↓
 *   canonical ride_repository
 *       ↓
 *   backend/data/rides.json
 */

const engine = require("./ride_engine");
const repository = require("./ride_repository");

function createRide(data) {
  return engine.createRide(data);
}

function getRide(id) {
  return engine.getRide(id);
}

function getRides() {
  return engine.getAllRides();
}

function getAllRides() {
  return engine.getAllRides();
}

function updateRide(id, patch = {}) {
  const current = engine.getRide(id);

  if (!current) {
    return null;
  }

  /*
   * If this is a canonical state transition,
   * use the canonical engine.
   */
  if (patch.status) {
    const result = engine.transition(
      id,
      patch.status,
      patch
    );

    /*
     * Canonical engine implementations may return
     * the ride directly or a structured result.
     */
    if (result && result.ride) {
      return result.ride;
    }

    return result;
  }

  /*
   * Non-state metadata updates belong to the canonical
   * repository, not to a second store.
   */
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    status: current.status
  };

  return repository.update(
    id,
    updated
  );
}

function acceptRide(id, driverId) {
  return engine.acceptRide(
    id,
    driverId
  );
}

module.exports = {
  createRide,
  getRide,
  getRides,
  getAllRides,
  updateRide,
  acceptRide
};
JS

echo "CANONICAL ADAPTER REPAIRED"
echo

echo "[4/8] REPAIRING RIDE API PATCH COMPATIBILITY..."

node - <<'NODE'
const fs = require("fs");

const file = "backend/ride_api_patch.js";
const text = fs.readFileSync(file, "utf8");

if (!text.includes("canonical/ride_legacy_adapter")) {
  throw new Error(
    "ride_api_patch.js is not connected to canonical adapter"
  );
}

console.log("ride_api_patch.js canonical adapter link: PASS");
NODE

echo

echo "[5/8] REPAIRING ORCHESTRATOR STATE AUTHORITY..."

cat > backend/services/ride_orchestrator_service.js <<'JS'
"use strict";

/*
 * CABLINK — CANONICAL RIDE ORCHESTRATOR
 *
 * Orchestration layer only.
 *
 * Ride persistence and lifecycle authority:
 *
 *   canonical ride_engine
 *       ↓
 *   canonical ride_repository
 *
 * This service may coordinate notifications and external
 * side effects, but it must not own ride state.
 */

const engine =
  require("../canonical/ride_engine");

const notify =
  require("./notification_service");

function createRide(data) {
  return engine.createRide(data);
}

function assignDriver(id, driver) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    console.log(
      "❌ Ride not found:",
      id
    );

    return null;
  }

  /*
   * Canonical state:
   *
   * MATCHING
   *    ↓
   * DRIVER_ASSIGNED
   *
   * Driver identity is passed through the canonical
   * transition metadata.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.DRIVER_ASSIGNED,
      {
        driver
      }
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver,
      user: updated.passenger,
      type: "DRIVER_ASSIGNED",
      message: "Driver has been assigned"
    });
  }

  return updated;
}

function driverArrived(id) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  const result =
    engine.transition(
      id,
      engine.STATES.DRIVER_ARRIVED
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "DRIVER_ARRIVED",
      message: "Your driver has arrived"
    });
  }

  return updated;
}

function startTrip(id) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  /*
   * Canonical lifecycle:
   *
   * PICKED_UP → STARTED
   *
   * The old TRIP_STARTED state is not a canonical
   * ride status.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.STARTED
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "TRIP_STARTED",
      message: "Trip started"
    });
  }

  return updated;
}

function finishTrip(id, fare) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  /*
   * Fare is metadata.
   * Completion is a canonical state transition.
   *
   * The canonical completion service should be preferred
   * by production completion routes.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.COMPLETED,
      {
        fare
      }
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "TRIP_COMPLETED",
      message: "Ride completed successfully"
    });
  }

  return updated;
}

module.exports = {
  createRide,
  assignDriver,
  driverArrived,
  startTrip,
  finishTrip
};
JS

echo "ORCHESTRATOR NOW USES CANONICAL ENGINE"
echo

echo "[6/8] VERIFYING NO LEGACY STATE NAMES IN ORCHESTRATOR..."

echo "Checking for legacy state mutations..."

if grep -nE \
  'transition\([^)]*"DRIVER_FOUND"|transition\([^)]*"TRIP_STARTED"|state\.update\([^)]*"DRIVER_FOUND"|state\.update\([^)]*"TRIP_STARTED"' \
  backend/services/ride_orchestrator_service.js
then
  echo "ERROR: Legacy ride state mutation still present"
  exit 1
else
  echo "PASS: No legacy ride state mutations found"
fi

echo
echo "Checking notification event labels separately..."

if grep -nE \
  'type: "TRIP_STARTED"|type: "DRIVER_ASSIGNED"' \
  backend/services/ride_orchestrator_service.js
then
  echo "INFO: Notification event labels found — these are not ride states"
fi

echo

echo "[7/8] RUNNING SYNTAX + MODULE CONTRACT TESTS..."

node --check backend/canonical/ride_legacy_adapter.js
node --check backend/services/ride_orchestrator_service.js
node --check backend/ride_api_patch.js

node - <<'NODE'
const adapter =
  require("./backend/canonical/ride_legacy_adapter");

const orchestrator =
  require("./backend/services/ride_orchestrator_service");

const engine =
  require("./backend/canonical/ride_engine");

const requiredAdapter = [
  "createRide",
  "getRide",
  "getRides",
  "getAllRides",
  "updateRide",
  "acceptRide"
];

for (const name of requiredAdapter) {
  if (typeof adapter[name] !== "function") {
    throw new Error(
      "Missing adapter method: " + name
    );
  }
}

const requiredOrchestrator = [
  "createRide",
  "assignDriver",
  "driverArrived",
  "startTrip",
  "finishTrip"
];

for (const name of requiredOrchestrator) {
  if (typeof orchestrator[name] !== "function") {
    throw new Error(
      "Missing orchestrator method: " + name
    );
  }
}

console.log(
  "Canonical ride count:",
  engine.getAllRides().length
);

console.log(
  "Adapter contract: PASS"
);

console.log(
  "Orchestrator contract: PASS"
);
NODE

echo

echo "[8/8] FINAL BRIDGE STATUS..."

echo "============================================================"
echo "CANONICAL RUNTIME BRIDGE REPAIR COMPLETE"
echo "============================================================"
echo
echo "BACKUP:"
echo "$BACKUP"
echo
echo "CANONICAL ENGINE:"
echo "backend/canonical/ride_engine.js"
echo
echo "CANONICAL REPOSITORY:"
echo "backend/canonical/ride_repository.js"
echo
echo "CANONICAL DATA:"
echo "backend/data/rides.json"
echo
echo "COMPATIBILITY ADAPTER:"
echo "backend/canonical/ride_legacy_adapter.js"
echo
echo "ORCHESTRATOR:"
echo "backend/services/ride_orchestrator_service.js"
echo
echo "IMPORTANT:"
echo "No legacy files deleted."
echo "No legacy data files deleted."
echo "No data files merged."
echo
echo "NEXT:"
echo "The production serverless API path (api/index.js) must now be audited"
echo "separately from backend/server.js before deployment."
echo "============================================================"
