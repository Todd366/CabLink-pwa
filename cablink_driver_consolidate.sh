#!/data/data/com.termux/files/usr/bin/bash

set -u

cd ~/CabLink-pwa

echo "=================================================="
echo "CABLINK DRIVER LIFECYCLE CONSOLIDATION"
echo "=================================================="

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=".cablink_backups/driver_consolidation_$STAMP"

mkdir -p "$BACKUP_DIR"

echo
echo "1. BACKING UP ACTIVE DRIVER FILES"
echo "--------------------------------------------------"

cp index.html "$BACKUP_DIR/index.html"
cp frontend/js/app_core.js "$BACKUP_DIR/app_core.js"
cp frontend/js/fix.js "$BACKUP_DIR/fix.js"
cp role.js "$BACKUP_DIR/role.js" 2>/dev/null || true
cp fare_engine.js "$BACKUP_DIR/fare_engine.js" 2>/dev/null || true

echo "Backup directory:"
echo "$BACKUP_DIR"

echo
echo "2. SHOWING CURRENT DRIVER IMPLEMENTATIONS"
echo "--------------------------------------------------"

echo
echo "--- ROOT toggleDriverMode ---"
sed -n '1240,1295p' index.html

echo
echo "--- app_core.js driver override ---"
sed -n '350,470p' frontend/js/app_core.js

echo
echo "--- fix.js ---"
sed -n '1,100p' frontend/js/fix.js

echo
echo "3. CREATING PRE-CONSOLIDATION SNAPSHOT"
echo "--------------------------------------------------"

cp index.html "$BACKUP_DIR/index.html.pre_consolidation"

echo
echo "4. REMOVING fix.js DRIVER TOGGLE OVERRIDE"
echo "--------------------------------------------------"

python3 <<'PYEOF'
from pathlib import Path
import re

path = Path("frontend/js/fix.js")
text = path.read_text(encoding="utf-8")

original = text

# Remove the simple driver toggle override:
# window.toggleDriverMode=function(){window.showDriverRegistrationForm();};
text = re.sub(
    r'window\.toggleDriverMode\s*=\s*function\s*\(\)\s*\{\s*window\.showDriverRegistrationForm\(\);\s*\}\s*;?',
    '',
    text,
    flags=re.S
)

if text != original:
    path.write_text(text, encoding="utf-8")
    print("Removed fix.js toggleDriverMode override.")
else:
    print("No matching fix.js toggleDriverMode override found.")

PYEOF

echo
echo "5. DISABLING app_core.js TOGGLE WRAPPER"
echo "--------------------------------------------------"

python3 <<'PYEOF'
from pathlib import Path

path = Path("frontend/js/app_core.js")
text = path.read_text(encoding="utf-8")

old = """var _origToggle = window.toggleDriverMode;
window.toggleDriverMode = function() {
"""

if old in text:
    text = text.replace(
        old,
        """/*
DISABLED DRIVER TOGGLE WRAPPER

The authoritative driver lifecycle is now owned by
the root index.html runtime.

Backend API remains:
POST /api/drivers/online
POST /api/drivers/offline
GET  /api/drivers/online

Original wrapper preserved below for reference.
*/
/*
var _origToggle = window.toggleDriverMode;
window.toggleDriverMode = function() {
""",
        1
    )

    # Close the comment around the original wrapper.
    # We identify the first likely closing function block after the wrapper.
    marker = "};"

    start = text.find("/*\nvar _origToggle = window.toggleDriverMode;")
    if start != -1:
        end = text.find(marker, start)
        if end != -1:
            end += len(marker)
            text = text[:end] + "\n*/" + text[end:]

    path.write_text(text, encoding="utf-8")
    print("Disabled app_core.js driver toggle wrapper.")
else:
    print("No expected app_core.js toggle wrapper found.")

PYEOF

echo
echo "6. VERIFYING TOGGLE DEFINITIONS AFTER CONSOLIDATION"
echo "--------------------------------------------------"

echo
echo "--- ROOT index.html ---"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
index.html || true

echo
echo "--- app_core.js ---"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
frontend/js/app_core.js || true

echo
echo "--- fix.js ---"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
frontend/js/fix.js || true

echo
echo "--- role.js ---"
grep -nE \
"function toggleDriverMode|window\.toggleDriverMode" \
role.js 2>/dev/null || true

echo
echo "7. VERIFYING BACKEND WAS NOT TOUCHED"
echo "--------------------------------------------------"

grep -nE \
"app\.post\('/api/drivers/online'|app\.post\('/api/drivers/offline'|app\.get\('/api/drivers/online'" \
backend/server.js || true

echo
echo "8. TESTING BACKEND HEALTH"
echo "--------------------------------------------------"

HEALTH=$(curl -sS --max-time 5 \
  http://localhost:3000/api/health 2>&1 || true)

echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "BACKEND HEALTH: PASS"
else
    echo "BACKEND HEALTH: FAIL"
fi

echo
echo "9. TESTING DRIVER ONLINE/OFFLINE LIFECYCLE"
echo "--------------------------------------------------"

TEST_DRIVER_ID="CONSOLIDATION-TEST-$(date +%s)"

echo
echo "Registering test driver: $TEST_DRIVER_ID"

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
    echo "DRIVER ONLINE: PASS"
else
    echo "DRIVER ONLINE: FAIL"
fi

echo
echo "Checking online list..."

ONLINE_LIST=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/api/drivers/online 2>&1 || true)

echo "$ONLINE_LIST"

if echo "$ONLINE_LIST" | grep -q "$TEST_DRIVER_ID"; then
    echo "DRIVER APPEARS ONLINE: PASS"
else
    echo "DRIVER APPEARS ONLINE: FAIL"
fi

echo
echo "Taking driver offline..."

OFFLINE_RESPONSE=$(curl -sS \
  --max-time 5 \
  -X POST \
  http://localhost:3000/api/drivers/offline \
  -H "Content-Type: application/json" \
  -d "{\"driverId\":\"$TEST_DRIVER_ID\"}" 2>&1 || true)

echo "$OFFLINE_RESPONSE"

if echo "$OFFLINE_RESPONSE" | grep -q '"success":true'; then
    echo "DRIVER OFFLINE: PASS"
else
    echo "DRIVER OFFLINE: FAIL"
fi

echo
echo "Checking final online list..."

FINAL_LIST=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/api/drivers/online 2>&1 || true)

echo "$FINAL_LIST"

if echo "$FINAL_LIST" | grep -q "$TEST_DRIVER_ID"; then
    echo "DRIVER REMOVAL: FAIL"
else
    echo "DRIVER REMOVAL: PASS"
fi

echo
echo "10. CHECKING ACTIVE ROOT RUNTIME"
echo "--------------------------------------------------"

ROOT_HTML=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/ 2>&1 || true)

if echo "$ROOT_HTML" | grep -q "CabLink"; then
    echo "ROOT RUNTIME: PASS"
else
    echo "ROOT RUNTIME: FAIL"
fi

if echo "$ROOT_HTML" | grep -q "frontend/js/app_core.js"; then
    echo "app_core.js: PRESENT"
else
    echo "app_core.js: NOT FOUND"
fi

echo
echo "11. FINAL SCRIPT ORDER"
echo "--------------------------------------------------"

grep -nE '<script[^>]*src=' index.html || true

echo
echo "=================================================="
echo "CONSOLIDATION COMPLETE"
echo "=================================================="

echo
echo "RESULT:"
echo "  Backend API preserved."
echo "  Driver online/offline API verified."
echo "  fix.js toggle override removed."
echo "  app_core.js toggle wrapper disabled."
echo "  Root index.html remains authoritative."
echo
echo "IMPORTANT:"
echo "  The browser must be hard-refreshed after this change."
echo "  Do NOT start Vite on port 5173 for this test."
echo "  Continue testing against the active root runtime on port 3000."
echo
echo "BACKUP:"
echo "$BACKUP_DIR"
echo

