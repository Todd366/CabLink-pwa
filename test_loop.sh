#!/bin/bash
cd ~/CabLink-pwa || exit 1

echo "=== Killing any old backend ==="
pkill -f "node backend/server.js" 2>/dev/null
sleep 1

echo "=== Starting backend fresh ==="
nohup node backend/server.js > backend.log 2>&1 &
sleep 2

echo ""
echo "=== 1. Health check ==="
curl -s http://localhost:3000/api/health
echo ""

echo ""
echo "=== 2. Book a ride ==="
BOOK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{"pickup":"BSTM HQ","dropoff":"Game City","fare":20,"type":"standard"}')
echo "$BOOK_RESPONSE"

RIDE_ID=$(echo "$BOOK_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$RIDE_ID" ]; then
  RIDE_ID=$(echo "$BOOK_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
fi
echo "Extracted ride ID: $RIDE_ID"

echo ""
echo "=== 3. Fetch that ride back (GET /api/rides/:id) ==="
curl -s http://localhost:3000/api/rides/$RIDE_ID
echo ""

echo ""
echo "=== 4. Driver accepts it (PATCH status=accepted) ==="
curl -s -X PATCH http://localhost:3000/api/rides/$RIDE_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","driverId":"TEST-DRIVER-1"}'
echo ""

echo ""
echo "=== 5. Confirm the status stuck (GET again) ==="
curl -s http://localhost:3000/api/rides/$RIDE_ID
echo ""

echo ""
echo "=== 6. Driver completes it (PATCH status=completed) ==="
curl -s -X PATCH http://localhost:3000/api/rides/$RIDE_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
echo ""

echo ""
echo "=== 7. Final confirm ==="
curl -s http://localhost:3000/api/rides/$RIDE_ID
echo ""

echo ""
echo "=== 8. Backend log ==="
tail -20 backend.log

echo ""
echo "=== DONE (backend still running in background) ==="
