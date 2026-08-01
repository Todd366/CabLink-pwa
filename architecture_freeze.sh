#!/usr/bin/env bash

set -e

echo "============================================================"
echo "CABLINK — ARCHITECTURE FREEZE"
echo "============================================================"

echo
echo "CURRENT CANONICAL TARGET:"
echo "  Engine     : backend/canonical/ride_engine.js"
echo "  Repository : backend/canonical/ride_repository.js"
echo "  Storage    : backend/data/rides.json"
echo "  HTTP API   : backend/routes/rides.js"
echo "  Server     : backend/server/app.js"
echo

echo "============================================================"
echo "1. CANONICAL ENGINE"
echo "============================================================"

grep -nE \
'createRide|acceptRide|transition|getRide|getAllRides|STATES|TRANSITIONS' \
backend/canonical/ride_engine.js || true

echo
echo "============================================================"
echo "2. CANONICAL REPOSITORY"
echo "============================================================"

grep -nE \
'create|findById|all|update|accept|FILE|DATA_DIR' \
backend/canonical/ride_repository.js || true

echo
echo "============================================================"
echo "3. PRIMARY RIDE ROUTES"
echo "============================================================"

grep -nE \
'router\.(get|post|patch|put|delete)' \
backend/routes/rides.js || true

echo
echo "============================================================"
echo "4. SERVER MOUNT"
echo "============================================================"

grep -nE \
'rideRoutes|/api/rides|completionRoutes|dispatchRoutes' \
backend/server/app.js || true

echo
echo "============================================================"
echo "5. DUPLICATE RIDE STORAGE"
echo "============================================================"

find backend \
  -type f \
  \( -name '*ride*' -o -name '*Ride*' \) \
  -print | sort

echo
echo "============================================================"
echo "6. DUPLICATE REPOSITORIES"
echo "============================================================"

grep -RInE \
'ride_repository|rideRepository|ride_store' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.test.js' \
--exclude='*_test.js' \
|| true

echo
echo "============================================================"
echo "7. DUPLICATE RIDE STORAGE FILES"
echo "============================================================"

find backend \
  -type f \
  \( -name 'rides.json' -o -name 'live_rides.json' -o -name 'cablink_db.json' \) \
  -print

echo
echo "============================================================"
echo "ARCHITECTURE FREEZE COMPLETE"
echo "============================================================"
