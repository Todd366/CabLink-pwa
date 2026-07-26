#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "════════════════════════════════════════"
echo " PART A — LIVE LIFECYCLE TEST"
echo "════════════════════════════════════════"

echo "--- Book a ride ---"
BOOK=$(curl -s -X POST http://localhost:3000/api/rides -H "Content-Type: application/json" -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20,"type":"standard"}')
echo "$BOOK"
echo ""

RIDE_ID=$(echo "$BOOK" | grep -oE '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$RIDE_ID" ]; then
  RIDE_ID=$(echo "$BOOK" | grep -oE '"id":[0-9]+' | head -1 | cut -d':' -f2)
fi
echo "Ride ID extracted: [$RIDE_ID]"
echo ""

echo "--- Fetch it back ---"
curl -s "http://localhost:3000/api/rides/$RIDE_ID"
echo ""
echo ""

echo "--- Accept it ---"
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID" -H "Content-Type: application/json" -d '{"status":"accepted","driverId":"TEST-DRIVER-1"}'
echo ""
echo ""

echo "--- Confirm accepted ---"
curl -s "http://localhost:3000/api/rides/$RIDE_ID"
echo ""
echo ""

echo "--- Complete it ---"
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID" -H "Content-Type: application/json" -d '{"status":"completed"}'
echo ""
echo ""

echo "--- Confirm completed ---"
curl -s "http://localhost:3000/api/rides/$RIDE_ID"
echo ""

echo ""
echo "════════════════════════════════════════"
echo " PART B — DUPLICATE / CONFLICTING FILE SCAN"
echo "════════════════════════════════════════"

echo "--- All index.html variants (which is real vs stale) ---"
find . -iname "index*.html" -not -path "*/node_modules/*" | sort

echo ""
echo "--- All files defining bookRide (should be exactly 1 loaded copy) ---"
grep -rln "function bookRide\|bookRide\s*=\s*function\|window\.bookRide" --include="*.js" --include="*.html" . | grep -v node_modules

echo ""
echo "--- All files defining toggleDriverMode ---"
grep -rln "function toggleDriverMode\|toggleDriverMode\s*=\s*function\|window\.toggleDriverMode" --include="*.js" --include="*.html" . | grep -v node_modules

echo ""
echo "--- Script tags actually loaded by frontend/index.html ---"
grep -n '<script' frontend/index.html

echo ""
echo "--- Backup/legacy files sitting in root (candidates to archive) ---"
find . -maxdepth 1 \( -iname "*.backup*" -o -iname "*_before_*" -o -iname "*.bak" \) 2>/dev/null

echo ""
echo "--- Top-level .js files in root that look like one-off patch scripts ---"
find . -maxdepth 1 -iname "cablink_*.js" | wc -l
echo "(count of cablink_*.js one-off scripts in root)"

echo ""
echo "════════════════════════════════════════"
echo " DONE — paste this entire output back"
echo "════════════════════════════════════════"
