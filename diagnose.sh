#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "=== Killing any old backend on port 3000 ==="
pkill -f "node backend/server.js" 2>/dev/null
sleep 1

echo "=== Starting backend fresh (logging to backend.log) ==="
nohup node backend/server.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

echo ""
echo "=== 1. Health check ==="
curl -s http://localhost:3000/api/health
echo ""

echo ""
echo "=== 2. Booking a test ride (POST /api/rides) ==="
curl -s -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20,"type":"standard"}'
echo ""

echo ""
echo "=== 3. Listing all rides (GET /api/rides) ==="
curl -s http://localhost:3000/api/rides
echo ""

echo ""
echo "=== 4. Driver going online (POST /api/drivers/online) ==="
curl -s -X POST http://localhost:3000/api/drivers/online \
  -H "Content-Type: application/json" \
  -d '{"driverId":"TEST-DRIVER-1"}'
echo ""

echo ""
echo "=== 5. Checking for duplicate ride route registrations ==="
grep -rn "router.post\|app.post" backend/ 2>/dev/null | grep -i "rides\|request"

echo ""
echo "=== 6. Backend server log (last 30 lines) ==="
tail -30 backend.log

echo ""
echo "=== DONE — backend is still running in background (PID $BACKEND_PID) ==="
echo "Kill it later with: kill $BACKEND_PID"
