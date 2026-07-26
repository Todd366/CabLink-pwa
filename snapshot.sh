#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "════════════════════════════════════════"
echo " CABLINK CURRENT STATE SNAPSHOT"
echo "════════════════════════════════════════"

echo ""
echo "--- git status (uncommitted changes) ---"
git status --short

echo ""
echo "--- Running processes ---"
ps aux | grep -E "node backend|vite" | grep -v grep

echo ""
echo "--- Backend health ---"
curl -s http://localhost:3000/api/health
echo ""

echo ""
echo "--- Live lifecycle test (book -> accept -> complete) ---"
BOOK=$(curl -s -X POST http://localhost:3000/api/rides -H "Content-Type: application/json" -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20}')
echo "Book: $BOOK"
RIDE_ID=$(echo "$BOOK" | grep -oE '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Ride ID: $RIDE_ID"
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/accept" -H "Content-Type: application/json" -d '{"driverId":"SNAPSHOT-TEST"}'
echo ""
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/complete"
echo ""
curl -s "http://localhost:3000/api/rides/$RIDE_ID"
echo ""

echo ""
echo "--- frontend/index.html size + key function check ---"
wc -l frontend/index.html
grep -c "async function bookRide" frontend/index.html
grep -c "function toggleDriverMode" frontend/index.html
grep -c "acceptRealRequest\|completeRealRide" frontend/index.html

echo ""
echo "--- Any remaining fake patterns in frontend/index.html ---"
grep -n "Math.random\|simulateRide\|setTimeout(completeRide" frontend/index.html | head -10

echo ""
echo "--- vite.config.js (confirm root + proxy still correct) ---"
cat vite.config.js

echo ""
echo "--- Recent git log (what's been committed) ---"
git log --oneline -10

echo ""
echo "════════════════════════════════════════"
echo " END SNAPSHOT — paste this whole output back"
echo "════════════════════════════════════════"
