#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "════════════════════════════════════════"
echo " 1. GET /api/drivers/online — real response shape"
echo "════════════════════════════════════════"
curl -s http://localhost:3000/api/drivers/online
echo ""

echo ""
echo "════════════════════════════════════════"
echo " 2. Current fare calculation functions"
echo "════════════════════════════════════════"
grep -n -A 15 "function calcTotalFare" frontend/index.html
echo "---"
grep -n -A 20 "function updateFareBreakdown" frontend/index.html
echo "---"
grep -n -A 10 "function selectRideType" frontend/index.html

echo ""
echo "════════════════════════════════════════"
echo " 3. Current map init + driver marker code"
echo "════════════════════════════════════════"
grep -n -A 25 "function initMap" frontend/index.html
echo "---"
grep -n -A 15 "function driftDriverMarkers" frontend/index.html
echo "---"
grep -n -A 15 "const LANDMARKS" frontend/index.html

echo ""
echo "════════════════════════════════════════"
echo " 4. Current toggleDriverMode (for geolocation wiring)"
echo "════════════════════════════════════════"
grep -n -A 30 "async function toggleDriverMode" frontend/index.html

echo ""
echo "════════════════════════════════════════"
echo " 5. Backend driversOnline storage shape"
echo "════════════════════════════════════════"
grep -n -B2 -A 15 "app.post('/api/drivers/online'" backend/server.js
echo "---"
grep -n -B2 -A 10 "app.get('/api/drivers/online'" backend/server.js

echo ""
echo "════════════════════════════════════════"
echo " DONE — paste this whole output back"
echo "════════════════════════════════════════"
