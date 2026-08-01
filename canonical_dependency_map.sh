#!/usr/bin/env bash

set -e

echo "============================================================"
echo "CABLINK — CANONICAL RIDE DEPENDENCY MIGRATION MAP"
echo "============================================================"

echo
echo "PURPOSE:"
echo "Classify active ride architecture dependencies before migration."
echo
echo "NO FILES WILL BE MODIFIED."
echo "NO FILES WILL BE DELETED."
echo "NO DATA WILL BE MIGRATED."

echo
echo "============================================================"
echo "1. LEGACY DATABASE REPOSITORY"
echo "============================================================"

echo
echo "--- database/ride_repository.js ---"
grep -RInE \
'require\(.*database/ride_repository|from .*database/ride_repository' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- database/rideRepository.js ---"
grep -RInE \
'require\(.*database/rideRepository|from .*database/rideRepository' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true


echo
echo "============================================================"
echo "2. LEGACY RIDE STORE"
echo "============================================================"

grep -RInE \
'require\(.*ride_store|from .*ride_store' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true


echo
echo "============================================================"
echo "3. LEGACY RIDE STATE SERVICE"
echo "============================================================"

echo
echo "--- IMPORTS ---"
grep -RInE \
'require\(.*ride_state_service|from .*ride_state_service' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- INTERNAL FUNCTIONS ---"
grep -nE \
'function |module\.exports|create|update|transition|status' \
backend/services/ride_state_service.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "4. RIDE ORCHESTRATOR SERVICE"
echo "============================================================"

echo
echo "--- IMPORTS ---"
grep -RInE \
'require\(.*ride_orchestrator_service|from .*ride_orchestrator_service' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- INTERNAL DEPENDENCIES ---"
grep -nE \
'require|createRide|state\.|repository|create|update|accept|transition|module\.exports' \
backend/services/ride_orchestrator_service.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "5. LIVE RIDE SERVICE"
echo "============================================================"

echo
echo "--- IMPORTS ---"
grep -RInE \
'require\(.*live_ride_service|from .*live_ride_service' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- INTERNAL STORAGE ---"
grep -nE \
'live_rides\.json|rides\.json|create|update|delete|module\.exports' \
backend/services/live_ride_service.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "6. LEGACY RIDE ENGINE"
echo "============================================================"

echo
echo "--- rides/ride_engine.js IMPORTERS ---"
grep -RInE \
'require\(.*rides/ride_engine|from .*rides/ride_engine' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- FILE CONTENT ---"
grep -nE \
'require|create|update|accept|transition|status|module\.exports' \
backend/rides/ride_engine.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "7. LEGACY RIDE LIFECYCLE"
echo "============================================================"

echo
echo "--- IMPORTS ---"
grep -RInE \
'require\(.*rides/ride_lifecycle|from .*rides/ride_lifecycle|require\(.*ride_lifecycle|from .*ride_lifecycle' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- FILE CONTENT ---"
grep -nE \
'require|create|update|accept|transition|status|module\.exports' \
backend/rides/ride_lifecycle.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "8. LEGACY RIDE PERSISTENCE"
echo "============================================================"

echo
echo "--- IMPORTS ---"
grep -RInE \
'require\(.*rides/ride_persistence|from .*rides/ride_persistence|require\(.*ride_persistence|from .*ride_persistence' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true

echo
echo "--- FILE CONTENT ---"
grep -nE \
'require|save|write|create|update|rides\.json|module\.exports' \
backend/rides/ride_persistence.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "9. ALL RIDE STORAGE WRITERS"
echo "============================================================"

grep -RInE \
'writeFileSync|writeFile|appendFileSync|appendFile|db\.write|firebase\.write|firestore\.write' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
| grep -Ei \
'ride|rides|live|repository|store|state|orchestrat|dispatch|completion|event' \
|| true


echo
echo "============================================================"
echo "10. ALL CANONICAL ENGINE CALLS"
echo "============================================================"

grep -RInE \
'canonical/ride_engine|rideEngine\.(createRide|acceptRide|transition|getRide|getAllRides)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true


echo
echo "============================================================"
echo "11. ALL CANONICAL REPOSITORY CALLS"
echo "============================================================"

grep -RInE \
'canonical/ride_repository|repository\.(create|findById|all|update|accept)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true


echo
echo "============================================================"
echo "12. RIDE API ROUTE MAP"
echo "============================================================"

echo
echo "--- PRIMARY CANONICAL ROUTES ---"
grep -nE \
'router\.(get|post|patch|put|delete)' \
backend/routes/rides.js \
2>/dev/null \
|| true

echo
echo "--- OTHER RIDE ROUTES ---"
grep -RInE \
'router\.(get|post|patch|put|delete)' \
backend/routes \
--include='*.js' \
| grep -Ei \
'ride|dispatch|completion|economy|state|orchestrat|live' \
|| true


echo
echo "============================================================"
echo "13. ROUTE MOUNT MAP"
echo "============================================================"

grep -nE \
'app\.use|app\.(get|post|patch|put|delete)' \
backend/server/app.js \
backend/server.js \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "14. RIDE STORAGE FILES"
echo "============================================================"

find backend \
-type f \
\( \
-name 'rides.json' \
-o -name 'live_rides.json' \
-o -name 'cablink_db.json' \
-o -name 'ride_events.json' \
\) \
-print \
| sort


echo
echo "============================================================"
echo "15. RIDE-RELATED ACTIVE MODULES"
echo "============================================================"

find backend \
-type f \
-name '*.js' \
-not -path '*/node_modules/*' \
-not -name '*.backup*' \
-not -name '*.before-*' \
-not -name '*.pre_*' \
| grep -Ei \
'ride|dispatch|completion|orchestrat|realtime|broadcast|event|economy|reward' \
| sort


echo
echo "============================================================"
echo "16. MIGRATION CLASSIFICATION TEMPLATE"
echo "============================================================"

cat <<'MAP'

CANONICAL:
  backend/canonical/ride_engine.js
  backend/canonical/ride_repository.js
  backend/routes/rides.js
  backend/data/rides.json

MIGRATE → CANONICAL:
  legacy ride creation
  legacy ride updates
  legacy ride acceptance
  legacy ride persistence

KEEP → NON-CANONICAL SUPPORT:
  dispatch
  matching
  notifications
  realtime
  fraud validation
  reward processing
  economy processing
  analytics

CONVERT → PROJECTION:
  live ride views
  realtime state projections
  event history
  broadcast data

ARCHIVE → DEAD:
  verified unused legacy modules
  obsolete backup implementations
  superseded ride engines

DELETE → VERIFIED UNUSED:
  ONLY after runtime verification

MAP
echo

echo "============================================================"
echo "CANONICAL DEPENDENCY MAP COMPLETE"
echo "============================================================"

echo
echo "NO FILES WERE MODIFIED."
echo "NO FILES WERE DELETED."
echo "NO DATA WAS MIGRATED."

