#!/usr/bin/env bash

set -e

echo "============================================================"
echo "CABLINK — CANONICAL RIDE MIGRATION AUDIT"
echo "============================================================"

echo
echo "============================================================"
echo "1. CANONICAL RIDE ENGINE IMPORTERS"
echo "============================================================"

grep -RInE \
'require\(.*canonical/ride_engine|from .*canonical/ride_engine|require\(.*ride_engine' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
|| true


echo
echo "============================================================"
echo "2. CANONICAL REPOSITORY IMPORTERS"
echo "============================================================"

grep -RInE \
'require\(.*canonical/ride_repository|from .*canonical/ride_repository' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "3. LEGACY DATABASE REPOSITORY IMPORTERS"
echo "============================================================"

grep -RInE \
'require\(.*database/ride_repository|require\(.*database/rideRepository|from .*database/ride_repository' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "4. RIDE STORE IMPORTERS"
echo "============================================================"

grep -RInE \
'require\(.*ride_store|from .*ride_store' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "5. RIDE ENGINE IMPORTERS"
echo "============================================================"

grep -RInE \
'require\(.*rides/ride_engine|from .*rides/ride_engine' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "6. ALL RIDE CREATION PATHS"
echo "============================================================"

grep -RInE \
'createRide|\.create\(|createOrder|newRide|create\(req\.body|create\(data\)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
| grep -Ei \
'ride|rides|state|orchestrat|dispatch|live' \
|| true


echo
echo "============================================================"
echo "7. ALL RIDE ACCEPTANCE PATHS"
echo "============================================================"

grep -RInE \
'acceptRide|\.accept\(|accept\(' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
| grep -Ei \
'ride|rides|dispatch|state|orchestrat' \
|| true


echo
echo "============================================================"
echo "8. ALL RIDE UPDATE PATHS"
echo "============================================================"

grep -RInE \
'updateRide|\.update\(|transition\(' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
| grep -Ei \
'ride|rides|state|orchestrat|completion|dispatch' \
|| true


echo
echo "============================================================"
echo "9. RIDE JSON STORAGE REFERENCES"
echo "============================================================"

grep -RInE \
'rides\.json|live_rides\.json|cablink_db\.json' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "10. ALL ROUTE MOUNTS"
echo "============================================================"

grep -RInE \
'app\.(use|get|post|patch|put|delete)|router\.(get|post|patch|put|delete)' \
backend/server \
backend/server.js \
--include='*.js' \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "11. FRONTEND RIDE API CALLS"
echo "============================================================"

grep -RInE \
'/api/rides|api/rides|fetch\(.*ride|axios.*ride' \
frontend \
--include='*.js' \
--include='*.html' \
2>/dev/null \
|| true


echo
echo "============================================================"
echo "12. RIDE EVENT / REALTIME DEPENDENCIES"
echo "============================================================"

grep -RInE \
'ride_event|rideEvent|ride_broadcast|ride_channel|ride_event_bus|emit.*ride|on.*ride' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
|| true


echo
echo "============================================================"
echo "13. ACTIVE RIDE-RELATED FILES"
echo "============================================================"

find backend \
-type f \
-name '*.js' \
-not -path '*/node_modules/*' \
| grep -Ei \
'ride|dispatch|completion|orchestrat|realtime|broadcast|event' \
| sort


echo
echo "============================================================"
echo "MIGRATION AUDIT COMPLETE"
echo "============================================================"

echo
echo "IMPORTANT:"
echo "No files were modified."
echo "No files were deleted."
echo "No data was migrated."
echo
echo "NEXT STEP:"
echo "Classify every active dependency before migration."
echo

