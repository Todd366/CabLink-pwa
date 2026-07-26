#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "════════════════════════════════════════"
echo " 1. Current driver approval logic (backend)"
echo "════════════════════════════════════════"
grep -n "driverApps\|status.*pending\|status.*approved" backend/server.js

echo ""
echo "════════════════════════════════════════"
echo " 2. Is there an approve/reject endpoint at all?"
echo "════════════════════════════════════════"
grep -n "approve\|reject" backend/server.js

echo ""
echo "════════════════════════════════════════"
echo " 3. What does acceptRide actually check (race condition risk)"
echo "════════════════════════════════════════"
grep -n -A 15 "function acceptRide" backend/services/rideService.js

echo ""
echo "════════════════════════════════════════"
echo " 4. Does GET /api/rides filter by anything (distance, driver eligibility)?"
echo "════════════════════════════════════════"
grep -n -B2 -A 15 "app.get('/api/rides'" backend/server.js

echo ""
echo "════════════════════════════════════════"
echo " 5. Two-driver race test — book one ride, try accepting it twice"
echo "════════════════════════════════════════"
RIDE=$(curl -s -X POST http://localhost:3000/api/rides -H "Content-Type: application/json" -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20}')
echo "Booked: $RIDE"
RIDE_ID=$(echo "$RIDE" | grep -oE '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "--- Driver A accepts ---"
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/accept" -H "Content-Type: application/json" -d '{"driverId":"DRIVER-A"}'
echo ""
echo "--- Driver B tries to accept the SAME ride ---"
curl -s -X PATCH "http://localhost:3000/api/rides/$RIDE_ID/accept" -H "Content-Type: application/json" -d '{"driverId":"DRIVER-B"}'
echo ""

echo ""
echo "════════════════════════════════════════"
echo " DONE — paste this whole output back"
echo "════════════════════════════════════════"
