#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "════════════════════════════════════════"
echo " 1. Is the backend running, and is it healthy?"
echo "════════════════════════════════════════"
curl -s http://localhost:3000/api/health
echo ""

echo ""
echo "════════════════════════════════════════"
echo " 2. What does backend/server.js actually require/mount right now?"
echo "════════════════════════════════════════"
grep -n "require(\|app.use(" backend/server.js | head -30

echo ""
echo "════════════════════════════════════════"
echo " 3. Does backend/canonical/ exist, and what's in it?"
echo "════════════════════════════════════════"
ls -la backend/canonical/ 2>/dev/null || echo "backend/canonical/ does NOT exist"

echo ""
echo "════════════════════════════════════════"
echo " 4. Does our accept-race-condition fix (Block 9) still exist?"
echo "════════════════════════════════════════"
grep -n "RIDE_ALREADY_TAKEN" backend/services/rideService.js backend/server.js 2>/dev/null

echo ""
echo "════════════════════════════════════════"
echo " 5. Do the approval endpoints (Block 9) still exist?"
echo "════════════════════════════════════════"
grep -n "apply/:id/approve\|apply/:id/reject" backend/server.js 2>/dev/null

echo ""
echo "════════════════════════════════════════"
echo " 6. Live test: book -> accept -> double-accept (is the race condition still fixed?)"
echo "════════════════════════════════════════"
RIDE=$(curl -s -X POST http://localhost:3000/api/rides -H "Content-Type: application/json" -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20}')
echo "Booked: $RIDE"
RIDE_ID=$(echo "$RIDE" | grep -oE '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "--- Accept A ---"
curl -s -w " [HTTP %{http_code}]" -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/accept" -H "Content-Type: application/json" -d '{"driverId":"A"}'
echo ""
echo "--- Accept B (should fail if fix is intact) ---"
curl -s -w " [HTTP %{http_code}]" -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/accept" -H "Content-Type: application/json" -d '{"driverId":"B"}'
echo ""

echo ""
echo "════════════════════════════════════════"
echo " 7. Which index.html does the browser actually load right now?"
echo "════════════════════════════════════════"
cat vite.config.js | grep -A3 "root:"

echo ""
echo "════════════════════════════════════════"
echo " 8. Does frontend/index.html still have the role-gating we added?"
echo "════════════════════════════════════════"
grep -c "CABLINK ROLE GATING" frontend/index.html 2>/dev/null

echo ""
echo "════════════════════════════════════════"
echo " 9. git status — what's uncommitted right now?"
echo "════════════════════════════════════════"
git status --short | head -40

echo ""
echo "════════════════════════════════════════"
echo " 10. Last 10 commits (what's actually been saved)"
echo "════════════════════════════════════════"
git log --oneline -10

echo ""
echo "════════════════════════════════════════"
echo " DONE — paste this whole output back"
echo "════════════════════════════════════════"
