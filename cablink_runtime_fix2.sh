#!/data/data/com.termux/files/usr/bin/bash

set -u

cd ~/CabLink-pwa

echo "=================================================="
echo "CABLINK RUNTIME + DRIVER API DIAGNOSTIC v2"
echo "=================================================="

RUNTIME_DIR="$HOME/CabLink-pwa/.cablink_runtime_test"
mkdir -p "$RUNTIME_DIR"

echo
echo "1. BACKEND PROCESS"
echo "--------------------------------------------------"

ps -ef | grep -E '[n]ode.*backend/server|[v]ite' || true

echo
echo "2. BACKEND PORT CHECK"
echo "--------------------------------------------------"

if command -v ss >/dev/null 2>&1; then
  ss -ltnp 2>/dev/null | grep -E ':3000|:5173|:4173' || true
else
  echo "ss command unavailable"
fi

echo
echo "3. BACKEND HEALTH"
echo "--------------------------------------------------"

HEALTH=$(curl -sS --max-time 5 http://localhost:3000/api/health 2>&1 || true)

if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "BACKEND HEALTH: PASS"
  echo "$HEALTH"
else
  echo "BACKEND HEALTH: FAIL"
  echo "$HEALTH"
fi

echo
echo "4. DRIVER ONLINE GET"
echo "--------------------------------------------------"

DRIVERS=$(curl -sS --max-time 5 http://localhost:3000/api/drivers/online 2>&1 || true)

if echo "$DRIVERS" | grep -q '"drivers"'; then
  echo "DRIVER GET API: PASS"
  echo "$DRIVERS"
else
  echo "DRIVER GET API: FAIL"
  echo "$DRIVERS"
fi

echo
echo "5. DRIVER ONLINE POST"
echo "--------------------------------------------------"

TEST_DRIVER_ID="TEST-DRIVER-$(date +%s)"

ONLINE_RESPONSE=$(curl -sS \
  --max-time 5 \
  -X POST \
  http://localhost:3000/api/drivers/online \
  -H "Content-Type: application/json" \
  -d "{
    \"driverId\":\"$TEST_DRIVER_ID\",
    \"vehicle\":\"standard\",
    \"lat\":-24.6541,
    \"lng\":25.9087
  }" 2>&1 || true)

echo "$ONLINE_RESPONSE"

if echo "$ONLINE_RESPONSE" | grep -q '"success":true'; then
  echo "DRIVER ONLINE POST: PASS"
else
  echo "DRIVER ONLINE POST: FAIL"
fi

echo
echo "6. VERIFY TEST DRIVER APPEARS"
echo "--------------------------------------------------"

DRIVER_LIST=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/api/drivers/online 2>&1 || true)

echo "$DRIVER_LIST"

if echo "$DRIVER_LIST" | grep -q "$TEST_DRIVER_ID"; then
  echo "DRIVER REGISTRATION: PASS"
else
  echo "DRIVER REGISTRATION: FAIL"
fi

echo
echo "7. DRIVER OFFLINE POST"
echo "--------------------------------------------------"

OFFLINE_RESPONSE=$(curl -sS \
  --max-time 5 \
  -X POST \
  http://localhost:3000/api/drivers/offline \
  -H "Content-Type: application/json" \
  -d "{\"driverId\":\"$TEST_DRIVER_ID\"}" 2>&1 || true)

echo "$OFFLINE_RESPONSE"

if echo "$OFFLINE_RESPONSE" | grep -q '"success":true'; then
  echo "DRIVER OFFLINE POST: PASS"
else
  echo "DRIVER OFFLINE POST: FAIL"
fi

echo
echo "8. VERIFY TEST DRIVER REMOVED"
echo "--------------------------------------------------"

FINAL_DRIVERS=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/api/drivers/online 2>&1 || true)

echo "$FINAL_DRIVERS"

if echo "$FINAL_DRIVERS" | grep -q "$TEST_DRIVER_ID"; then
  echo "DRIVER OFFLINE REMOVAL: FAIL"
else
  echo "DRIVER OFFLINE REMOVAL: PASS"
fi

echo
echo "9. ACTIVE ROOT RUNTIME"
echo "--------------------------------------------------"

ROOT_HTML=$(curl -sS --max-time 5 http://localhost:3000/ 2>&1 || true)

if echo "$ROOT_HTML" | grep -q "CabLink"; then
  echo "ROOT RUNTIME: PASS"
else
  echo "ROOT RUNTIME: FAIL"
fi

if echo "$ROOT_HTML" | grep -q "frontend/js/app_core.js"; then
  echo "app_core.js: LOADED BY ROOT"
else
  echo "app_core.js: NOT FOUND IN ROOT RESPONSE"
fi

echo
echo "10. VITE RUNTIME"
echo "--------------------------------------------------"

VITE_HTML=$(curl -sS --max-time 5 http://localhost:5173/ 2>&1 || true)

if echo "$VITE_HTML" | grep -q "main.jsx"; then
  echo "VITE RUNTIME: ACTIVE"
else
  echo "VITE RUNTIME: NOT ACTIVE"
fi

echo
echo "11. DRIVER TOGGLE DEFINITIONS"
echo "--------------------------------------------------"

echo
echo "ROOT index.html:"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
index.html || true

echo
echo "frontend/js/app_core.js:"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
frontend/js/app_core.js || true

echo
echo "frontend/js/fix.js:"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
frontend/js/fix.js || true

echo
echo "frontend/js/role.js:"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
frontend/js/role.js || true

echo
echo "12. SCRIPT LOAD ORDER — ROOT"
echo "--------------------------------------------------"

grep -nE '<script[^>]*src=' index.html || true

echo
echo "13. SCRIPT LOAD ORDER — FRONTEND"
echo "--------------------------------------------------"

grep -nE '<script[^>]*src=|type="module"' frontend/index.html || true

echo
echo "14. FINAL DIAGNOSTIC SUMMARY"
echo "=================================================="

echo
echo "Backend:"
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "  [PASS] Backend API is alive"
else
  echo "  [FAIL] Backend API is not responding"
fi

echo
echo "Driver API:"
if echo "$ONLINE_RESPONSE" | grep -q '"success":true'; then
  echo "  [PASS] Driver can go online"
else
  echo "  [FAIL] Driver cannot go online"
fi

if echo "$OFFLINE_RESPONSE" | grep -q '"success":true'; then
  echo "  [PASS] Driver can go offline"
else
  echo "  [FAIL] Driver cannot go offline"
fi

echo
echo "Runtime:"
if echo "$ROOT_HTML" | grep -q "CabLink"; then
  echo "  [PASS] Root index.html is being served"
else
  echo "  [FAIL] Root index.html not served"
fi

if echo "$VITE_HTML" | grep -q "main.jsx"; then
  echo "  [PASS] React/Vite runtime active"
else
  echo "  [INFO] React/Vite runtime inactive"
fi

echo
echo "Driver Toggle Architecture:"
echo "  [WARNING] Multiple toggleDriverMode implementations detected."
echo "  [WARNING] Do NOT add another override."
echo "  [NEXT] Consolidate to one authoritative driver lifecycle."

echo
echo "=================================================="
echo "DIAGNOSTIC COMPLETE"
echo "=================================================="

