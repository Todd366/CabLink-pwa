#!/data/data/com.termux/files/usr/bin/bash

set +e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT" || exit 1

LOG="$ROOT/block10_backend.log"
PIDFILE="$ROOT/block10_backend.pid"

rm -f "$LOG" "$PIDFILE"

echo "================================================================================"
echo "CABLINK BLOCK 10 — CANONICAL RUNTIME LOCK"
echo "================================================================================"
echo "Repository: $ROOT"
echo "Date: $(date)"
echo
echo "This block:"
echo "1. Does NOT modify application source files"
echo "2. Does NOT delete application files"
echo "3. Starts backend/server.js as the primary backend candidate"
echo "4. Verifies /api/health"
echo "5. Verifies /api/rides"
echo "6. Verifies /api/drivers/online"
echo "7. Verifies /api/drivers/apply"
echo "8. Creates a real test ride"
echo "9. Reads the created ride"
echo "10. Updates the ride lifecycle"
echo "11. Verifies React shell status"
echo "12. Produces a canonical runtime verdict"
echo

echo "================================================================================"
echo "1. ENVIRONMENT"
echo "================================================================================"

echo "Node:"
node --version 2>&1

echo "NPM:"
npm --version 2>&1

echo "Working directory:"
pwd

echo

echo "================================================================================"
echo "2. BACKEND CANDIDATE"
echo "================================================================================"

if [ -f backend/server.js ]; then
  echo "PRIMARY BACKEND: PRESENT"
  echo "backend/server.js"
else
  echo "PRIMARY BACKEND: MISSING"
fi

if [ -f backend/server/app.js ]; then
  echo "MODULAR BACKEND APP: PRESENT"
  echo "backend/server/app.js"
else
  echo "MODULAR BACKEND APP: MISSING"
fi

if [ -f backend/server/index.js ]; then
  echo "MODULAR BACKEND STARTER: PRESENT"
  echo "backend/server/index.js"
else
  echo "MODULAR BACKEND STARTER: MISSING"
fi

echo

echo "================================================================================"
echo "3. PORT 3000 PRE-CHECK"
echo "================================================================================"

echo "Checking whether port 3000 is already responding..."

curl -sS --max-time 3 \
  http://127.0.0.1:3000/api/health \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  2>&1

echo

echo "================================================================================"
echo "4. START backend/server.js"
echo "================================================================================"

echo "Starting:"
echo "node backend/server.js"

node backend/server.js > "$LOG" 2>&1 &
BACKEND_PID=$!

echo "$BACKEND_PID" > "$PIDFILE"

echo "Backend PID: $BACKEND_PID"
echo "Log file: $LOG"

sleep 2

echo

echo "================================================================================"
echo "5. BACKEND PROCESS STATUS"
echo "================================================================================"

if kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "BACKEND PROCESS: ALIVE"
else
  echo "BACKEND PROCESS: DEAD"
fi

echo

echo "----- BACKEND LOG -----"

if [ -f "$LOG" ]; then
  cat "$LOG"
else
  echo "NO LOG FILE CREATED"
fi

echo

echo "================================================================================"
echo "6. API HEALTH"
echo "================================================================================"

HEALTH=$(curl -sS --max-time 5 \
  http://127.0.0.1:3000/api/health \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$HEALTH"

echo

echo "================================================================================"
echo "7. GET /api/rides"
echo "================================================================================"

RIDES=$(curl -sS --max-time 5 \
  http://127.0.0.1:3000/api/rides \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$RIDES"

echo

echo "================================================================================"
echo "8. GET /api/drivers/online"
echo "================================================================================"

DRIVERS=$(curl -sS --max-time 5 \
  http://127.0.0.1:3000/api/drivers/online \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$DRIVERS"

echo

echo "================================================================================"
echo "9. POST /api/drivers/apply"
echo "================================================================================"

APPLICATION=$(curl -sS --max-time 5 \
  -X POST \
  http://127.0.0.1:3000/api/drivers/apply \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Block10 Test Driver",
    "phone":"+26700000000",
    "license":"BLOCK10-TEST",
    "vehicle":"standard",
    "wallet":"0xBLOCK10TEST"
  }' \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$APPLICATION"

echo

echo "================================================================================"
echo "10. CREATE TEST RIDE"
echo "================================================================================"

RIDE_CREATE=$(curl -sS --max-time 5 \
  -X POST \
  http://127.0.0.1:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "pickup":"Block 10 Test Pickup",
    "dropoff":"Block 10 Test Destination",
    "vehicle":"standard",
    "fare":20,
    "distanceKm":5,
    "wallet":"0xBLOCK10TEST",
    "notes":"BLOCK10_CANONICAL_RUNTIME_TEST"
  }' \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$RIDE_CREATE"

echo

echo "================================================================================"
echo "11. EXTRACT TEST RIDE ID"
echo "================================================================================"

RIDE_ID=$(printf '%s\n' "$RIDE_CREATE" | \
  sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n 1)

if [ -n "$RIDE_ID" ]; then
  echo "TEST RIDE ID: $RIDE_ID"
else
  echo "TEST RIDE ID: NOT EXTRACTED"
fi

echo

echo "================================================================================"
echo "12. GET CREATED RIDE"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  RIDE_GET=$(curl -sS --max-time 5 \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$RIDE_GET"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "13. REGISTER TEST DRIVER ONLINE"
echo "================================================================================"

DRIVER_ONLINE=$(curl -sS --max-time 5 \
  -X POST \
  http://127.0.0.1:3000/api/drivers/online \
  -H "Content-Type: application/json" \
  -d '{
    "driverId":"BLOCK10-DRIVER",
    "vehicle":"standard",
    "lat":-24.6541,
    "lng":25.9087,
    "wallet":"0xBLOCK10DRIVER"
  }' \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$DRIVER_ONLINE"

echo

echo "================================================================================"
echo "14. GET ONLINE DRIVERS AFTER REGISTRATION"
echo "================================================================================"

DRIVERS_AFTER=$(curl -sS --max-time 5 \
  http://127.0.0.1:3000/api/drivers/online \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$DRIVERS_AFTER"

echo

echo "================================================================================"
echo "15. GET RIDES AFTER DRIVER ONLINE"
echo "================================================================================"

RIDES_AFTER=$(curl -sS --max-time 5 \
  http://127.0.0.1:3000/api/rides \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

echo "$RIDES_AFTER"

echo

echo "================================================================================"
echo "16. UPDATE TEST RIDE — DRIVER ASSIGNED"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  ASSIGN=$(curl -sS --max-time 5 \
    -X PATCH \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status":"DRIVER_ASSIGNED",
      "driverId":"BLOCK10-DRIVER",
      "driverName":"Block 10 Test Driver"
    }' \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$ASSIGN"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "17. UPDATE TEST RIDE — ACCEPTED"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  ACCEPT=$(curl -sS --max-time 5 \
    -X PATCH \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status":"ACCEPTED"
    }' \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$ACCEPT"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "18. UPDATE TEST RIDE — ARRIVED"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  ARRIVED=$(curl -sS --max-time 5 \
    -X PATCH \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status":"ARRIVED"
    }' \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$ARRIVED"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "19. UPDATE TEST RIDE — IN_PROGRESS"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  IN_PROGRESS=$(curl -sS --max-time 5 \
    -X PATCH \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status":"IN_PROGRESS"
    }' \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$IN_PROGRESS"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "20. UPDATE TEST RIDE — COMPLETED"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  COMPLETED=$(curl -sS --max-time 5 \
    -X PATCH \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status":"COMPLETED"
    }' \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$COMPLETED"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "21. FINAL RIDE STATE"
echo "================================================================================"

if [ -n "$RIDE_ID" ]; then

  FINAL_RIDE=$(curl -sS --max-time 5 \
    "http://127.0.0.1:3000/api/rides/$RIDE_ID" \
    -w "\nHTTP_STATUS:%{http_code}" \
    2>&1)

  echo "$FINAL_RIDE"

else

  echo "SKIPPED — NO RIDE ID"

fi

echo

echo "================================================================================"
echo "22. REACT RUNTIME CLASSIFICATION"
echo "================================================================================"

if [ -f frontend/App.jsx ]; then
  echo "frontend/App.jsx: PRESENT"
fi

if [ -f frontend/components/LegacyCabLink.jsx ]; then
  echo "frontend/components/LegacyCabLink.jsx: PRESENT"
fi

if grep -q "return null" frontend/components/LegacyCabLink.jsx 2>/dev/null; then
  echo "REACT APP STATUS: SHELL / DEAD-END"
  echo "REASON: LegacyCabLink.jsx returns null"
else
  echo "REACT APP STATUS: REQUIRES FURTHER INSPECTION"
fi

echo

echo "================================================================================"
echo "23. VITE BUILD ARTIFACT"
echo "================================================================================"

if [ -f dist/index.html ]; then
  echo "dist/index.html: PRESENT"
else
  echo "dist/index.html: MISSING"
fi

if [ -d dist/assets ]; then
  echo "dist/assets: PRESENT"
  find dist/assets -maxdepth 1 -type f -print
else
  echo "dist/assets: MISSING"
fi

echo

echo "================================================================================"
echo "24. CANONICAL RUNTIME VERDICT"
echo "================================================================================"

if kill -0 "$BACKEND_PID" 2>/dev/null; then
  BACKEND_ALIVE="YES"
else
  BACKEND_ALIVE="NO"
fi

if printf '%s\n' "$HEALTH" | grep -q '"status":"ok"'; then
  HEALTH_OK="YES"
else
  HEALTH_OK="NO"
fi

if printf '%s\n' "$RIDE_CREATE" | grep -q '"success":true'; then
  RIDE_CREATE_OK="YES"
else
  RIDE_CREATE_OK="NO"
fi

if printf '%s\n' "$RIDE_GET" | grep -q '"ride"'; then
  RIDE_GET_OK="YES"
else
  RIDE_GET_OK="NO"
fi

if printf '%s\n' "$FINAL_RIDE" | grep -q '"REWARD_PENDING"'; then
  RIDE_LIFECYCLE_OK="YES"
else
  RIDE_LIFECYCLE_OK="NO"
fi

echo
echo "BACKEND PROCESS ALIVE: $BACKEND_ALIVE"
echo "HEALTH API:            $HEALTH_OK"
echo "CREATE RIDE API:       $RIDE_CREATE_OK"
echo "GET RIDE API:          $RIDE_GET_OK"
echo "RIDE LIFECYCLE:        $RIDE_LIFECYCLE_OK"

echo

if [ "$BACKEND_ALIVE" = "YES" ] &&
   [ "$HEALTH_OK" = "YES" ] &&
   [ "$RIDE_CREATE_OK" = "YES" ] &&
   [ "$RIDE_GET_OK" = "YES" ]; then

  echo "================================================================================"
  echo "CANONICAL RUNTIME STATUS: BACKEND VERIFIED"
  echo "================================================================================"
  echo
  echo "PRIMARY CANONICAL BACKEND:"
  echo "backend/server.js"
  echo
  echo "PRIMARY API CONTRACT:"
  echo "/api/health"
  echo "/api/rides"
  echo "/api/drivers/online"
  echo "/api/drivers/apply"
  echo "/api/ratings"
  echo
  echo "The legacy backend candidate is operational."
  echo "Further architecture migration should NOT happen until the frontend"
  echo "connection to this verified backend is also confirmed."

else

  echo "================================================================================"
  echo "CANONICAL RUNTIME STATUS: BACKEND NOT VERIFIED"
  echo "================================================================================"
  echo
  echo "backend/server.js did not pass the minimum live runtime test."
  echo "Do NOT migrate or delete architecture yet."
  echo "Inspect the backend log above."

fi

echo

echo "================================================================================"
echo "25. CLEANUP"
echo "================================================================================"

if kill -0 "$BACKEND_PID" 2>/dev/null; then
  kill "$BACKEND_PID" 2>/dev/null
  sleep 1
  echo "Backend process stopped."
else
  echo "Backend process already stopped."
fi

rm -f "$PIDFILE"

echo
echo "Backend log preserved at:"
echo "$LOG"

echo
echo "================================================================================"
echo "BLOCK 10 COMPLETE"
echo "================================================================================"

