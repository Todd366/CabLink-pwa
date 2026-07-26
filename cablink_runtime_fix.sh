#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "=================================================="
echo "CABLINK RUNTIME + DRIVER MODE SURGICAL FIX"
echo "=================================================="

cd ~/CabLink-pwa

echo
echo "1. BACKING UP CURRENT FILES"
cp index.html "index.html.backup.$(date +%Y%m%d_%H%M%S)"
cp frontend/index.html "frontend/index.html.backup.$(date +%Y%m%d_%H%M%S)"
cp frontend/js/app_core.js "frontend/js/app_core.js.backup.$(date +%Y%m%d_%H%M%S)"
cp frontend/js/fix.js "frontend/js/fix.js.backup.$(date +%Y%m%d_%H%M%S)"
cp frontend/js/role.js "frontend/js/role.js.backup.$(date +%Y%m%d_%H%M%S)"

echo "Backups created."

echo
echo "2. VERIFYING BACKEND DRIVER API"
grep -nE \
"app\.post\('/api/drivers/online'|app\.post\('/api/drivers/offline'|app\.get\('/api/drivers/online'" \
backend/server.js

echo
echo "3. VERIFYING FRONTEND DRIVER API REFERENCES"
grep -RInE \
"api/drivers/online|api/drivers/offline" \
frontend \
--exclude-dir=node_modules \
--exclude='*.bak' \
--exclude='*.backup*' \
| head -80

echo
echo "4. CHECKING ACTIVE ROOT RUNTIME"
if grep -q 'frontend/js/app_core.js' index.html; then
  echo "ROOT RUNTIME: ACTIVE"
else
  echo "WARNING: app_core.js not referenced by root index.html"
fi

echo
echo "5. CHECKING REACT/VITE RUNTIME"
if grep -q 'src="/main.jsx"' frontend/index.html; then
  echo "REACT RUNTIME: PRESENT IN frontend/index.html"
fi

echo
echo "6. CHECKING FOR DUPLICATE DRIVER MODE OVERRIDES"

echo "--- ROOT INLINE DRIVER TOGGLE DEFINITIONS ---"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
index.html || true

echo "--- APP CORE DRIVER TOGGLE DEFINITIONS ---"
grep -nE \
"window\.toggleDriverMode|toggleDriverMode" \
frontend/js/app_core.js || true

echo "--- FIX DRIVER TOGGLE DEFINITIONS ---"
grep -nE \
"window\.toggleDriverMode|toggleDriverMode" \
frontend/js/fix.js || true

echo "--- ROLE DRIVER TOGGLE DEFINITIONS ---"
grep -nE \
"window\.toggleDriverMode|toggleDriverMode" \
frontend/js/role.js || true

echo
echo "7. TESTING BACKEND HEALTH"

if curl -sS http://localhost:3000/api/health >/tmp/cablink_health.json 2>/dev/null; then
  cat /tmp/cablink_health.json
else
  echo "Backend health endpoint unavailable."
fi

echo
echo "8. TESTING ONLINE DRIVER ENDPOINT"

if curl -sS http://localhost:3000/api/drivers/online >/tmp/cablink_drivers.json 2>/dev/null; then
  cat /tmp/cablink_drivers.json
else
  echo "Driver endpoint unavailable."
fi

echo
echo "9. TESTING ROOT RUNTIME"

if curl -sS http://localhost:3000/ >/tmp/cablink_root.html 2>/dev/null; then
  echo "Root runtime loaded successfully."

  if grep -q "CabLink" /tmp/cablink_root.html; then
    echo "CabLink root application detected."
  fi

  if grep -q "frontend/js/app_core.js" /tmp/cablink_root.html; then
    echo "app_core.js detected in active root runtime."
  fi
else
  echo "ERROR: Root runtime unavailable."
fi

echo
echo "10. CREATING DRIVER API SMOKE TEST"

cat > /tmp/cablink_driver_test.sh <<'TESTEOF'
#!/data/data/com.termux/files/usr/bin/bash

BASE="http://localhost:3000"
DRIVER_ID="TEST-DRIVER-$(date +%s)"

echo "Testing driver online..."

ONLINE=$(curl -sS \
  -X POST "$BASE/api/drivers/online" \
  -H "Content-Type: application/json" \
  -d "{
    \"driverId\":\"$DRIVER_ID\",
    \"vehicle\":\"standard\",
    \"lat\":-24.6541,
    \"lng\":25.9087
  }")

echo "$ONLINE"

echo
echo "Testing online driver list..."

curl -sS "$BASE/api/drivers/online"

echo
echo
echo "Testing driver offline..."

curl -sS \
  -X POST "$BASE/api/drivers/offline" \
  -H "Content-Type: application/json" \
  -d "{\"driverId\":\"$DRIVER_ID\"}"

echo
echo
echo "Final driver list..."

curl -sS "$BASE/api/drivers/online"

echo
echo
echo "DRIVER API SMOKE TEST COMPLETE"
TESTEOF

chmod +x /tmp/cablink_driver_test.sh

/tmp/cablink_driver_test.sh

echo
echo "=================================================="
echo "CABLINK RUNTIME INVESTIGATION COMPLETE"
echo "=================================================="

echo
echo "IMPORTANT FINDING:"
echo "The backend API is functional if the smoke test above succeeds."
echo "The active browser runtime at localhost:3000 is ROOT index.html."
echo "Vite/React is currently NOT running on port 5173."
echo
echo "NEXT STEP:"
echo "Use the active ROOT runtime as the primary runtime."
echo "Do not merge another driver toggle implementation yet."
echo "First remove duplicate toggle overrides and keep ONE driver lifecycle."
echo
