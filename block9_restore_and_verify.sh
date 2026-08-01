#!/usr/bin/env bash
set -e

echo "============================================================"
echo " CABLINK BLOCK 9 — CANONICAL ACCEPTANCE RECOVERY"
echo "============================================================"

echo
echo "1. CURRENT RIDE ROUTE DEFINITIONS"
echo "------------------------------------------------------------"

grep -nE \
"router\.(get|post|patch|put|delete)|/accept|acceptRide|accept.*ride|driverId|status.*MATCHING|MATCHING" \
backend/routes/rides.js \
backend/server/app.js \
backend/canonical/ride_engine.js \
backend/canonical/ride_repository.js \
2>/dev/null || true


echo
echo "2. CURRENT APP ROUTE MOUNTS"
echo "------------------------------------------------------------"

grep -nE \
"app\.use|routes/rides|ridesRouter|/api" \
backend/server/app.js \
backend/server.js \
2>/dev/null || true


echo
echo "3. BLOCK 9 HISTORICAL REFERENCES"
echo "------------------------------------------------------------"

grep -RniE \
"Block 9|race condition|atomic|double.accept|double accept|accept.*once|already accepted|status.*MATCHING" \
. \
--exclude-dir=.git \
--exclude-dir=node_modules \
--exclude-dir=archive \
--exclude='*.bak' \
--exclude='*.backup*' \
2>/dev/null | head -300 || true


echo
echo "4. GIT HISTORY FOR ACCEPTANCE LOGIC"
echo "------------------------------------------------------------"

git log --all --oneline --decorate -- \
backend/routes/rides.js \
backend/canonical/ride_engine.js \
backend/canonical/ride_repository.js \
| head -30


echo
echo "5. SEARCH GIT HISTORY FOR ACCEPT ENDPOINT"
echo "------------------------------------------------------------"

git log --all -S'/accept' \
--oneline -- \
backend/routes/rides.js \
backend/canonical/ride_engine.js \
backend/canonical/ride_repository.js \
| head -30


echo
echo "6. CURRENT ROUTE FILE"
echo "------------------------------------------------------------"

sed -n '1,260p' backend/routes/rides.js


echo
echo "7. CANONICAL RIDE ENGINE"
echo "------------------------------------------------------------"

sed -n '1,300p' backend/canonical/ride_engine.js


echo
echo "8. CANONICAL RIDE REPOSITORY"
echo "------------------------------------------------------------"

sed -n '1,260p' backend/canonical/ride_repository.js


echo
echo "9. APP SERVER"
echo "------------------------------------------------------------"

sed -n '1,300p' backend/server/app.js


echo
echo "============================================================"
echo " BLOCK 9 DISCOVERY COMPLETE"
echo "============================================================"
echo
echo "NO FILES WERE MODIFIED."
echo
echo "Paste the entire output back."
