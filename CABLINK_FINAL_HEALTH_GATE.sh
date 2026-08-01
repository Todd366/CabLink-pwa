#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "=================================================="
echo "CABLINK FINAL HEALTH GATE"
echo "=================================================="

echo
echo "1. JAVASCRIPT SYNTAX CHECK"
find backend api frontend -name "*.js" \
-not -path "*node_modules*" \
-exec node --check {} \;

echo "PASS: syntax"

echo
echo "2. LEGACY RIDE REFERENCES"

grep -RInE \
"live_ride_service|live_rides|ride_store|database/rideRepository|services/ride_service|/api/rides/request" \
backend api frontend \
--include="*.js" \
--exclude-dir=node_modules \
|| true

echo
echo "3. RIDE WRITE AUTHORITY"

grep -RInE \
"rides\.push|writeFileSync.*ride|saveRide|insertRide" \
backend \
--include="*.js" \
--exclude-dir=node_modules \
|| true

echo
echo "4. MOCK / PLACEHOLDER SEARCH"

grep -RInE \
"TODO|FIXME|mock|placeholder|dummy|sample|demo" \
frontend backend \
--include="*.js" \
--include="*.jsx" \
|| true

echo
echo "5. ROUTE REGISTRATION"

grep -RInE \
"app.use|router.use|require.*routes" \
backend/server \
api \
--include="*.js"

echo
echo "6. DEPENDENCY CHECK"

npm ls --depth=0 || true

echo
echo "7. BUILD CHECK"

npm run build

echo
echo "8. GIT SUMMARY"

git status --short

echo
echo "=================================================="
echo "HEALTH GATE COMPLETE"
echo "=================================================="
