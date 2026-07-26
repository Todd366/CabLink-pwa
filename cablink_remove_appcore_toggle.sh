#!/data/data/com.termux/files/usr/bin/bash

set -u

cd ~/CabLink-pwa

echo "=================================================="
echo "CABLINK SURGICAL REMOVE: app_core DRIVER OVERRIDE"
echo "=================================================="

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=".cablink_backups/appcore_toggle_removal_$STAMP"

mkdir -p "$BACKUP_DIR"

echo
echo "1. BACKUP"
echo "--------------------------------------------------"

cp frontend/js/app_core.js "$BACKUP_DIR/app_core.js"

echo "Backup:"
echo "$BACKUP_DIR/app_core.js"

echo
echo "2. LOCATING DRIVER OVERRIDE"
echo "--------------------------------------------------"

grep -nE \
"var _origToggle = window\.toggleDriverMode|window\.toggleDriverMode = function|SHOW INCOMING RIDE REQUEST" \
frontend/js/app_core.js || true

echo
echo "3. SURGICALLY REMOVING ONLY THE app_core TOGGLE OVERRIDE"
echo "--------------------------------------------------"

python3 <<'PYEOF'
from pathlib import Path
import re

path = Path("frontend/js/app_core.js")
text = path.read_text(encoding="utf-8")

start_marker = "// ── DRIVER ONLINE STATUS WITH REAL LOCATION ─────────────"
end_marker = "// ── SHOW INCOMING RIDE REQUEST TO DRIVER ─────────────────"

start = text.find(start_marker)
end = text.find(end_marker)

if start == -1:
    print("ERROR: Driver override start marker not found.")
    raise SystemExit(1)

if end == -1:
    print("ERROR: Driver request section marker not found.")
    raise SystemExit(1)

block = text[start:end]

if "window.toggleDriverMode = function()" not in block:
    print("ERROR: Expected toggleDriverMode override not found inside target block.")
    raise SystemExit(1)

# Remove the complete driver override section.
# The following showDriverRequest() section is preserved.
text = text[:start] + text[end:]

path.write_text(text, encoding="utf-8")

print("SUCCESS: Removed app_core.js driver toggle override block.")
print("SUCCESS: Preserved showDriverRequest() and following code.")

PYEOF

echo
echo "4. VERIFYING ACTIVE TOGGLE DEFINITIONS"
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
echo "5. COUNTING ACTIVE TOGGLE DEFINITIONS"
echo "--------------------------------------------------"

ROOT_COUNT=$(grep -cE \
"^[[:space:]]*async function toggleDriverMode[[:space:]]*\(" \
index.html 2>/dev/null || true)

APPCORE_COUNT=$(grep -cE \
"window\.toggleDriverMode[[:space:]]*=" \
frontend/js/app_core.js 2>/dev/null || true)

FIX_COUNT=$(grep -cE \
"window\.toggleDriverMode[[:space:]]*=" \
frontend/js/fix.js 2>/dev/null || true)

ROLE_COUNT=$(grep -cE \
"window\.toggleDriverMode[[:space:]]*=" \
role.js 2>/dev/null || true)

echo "Root toggle functions:      $ROOT_COUNT"
echo "app_core overrides:         $APPCORE_COUNT"
echo "fix.js overrides:           $FIX_COUNT"
echo "role.js overrides:          $ROLE_COUNT"

if [ "$ROOT_COUNT" -eq 1 ] && \
   [ "$APPCORE_COUNT" -eq 0 ] && \
   [ "$FIX_COUNT" -eq 0 ] && \
   [ "$ROLE_COUNT" -eq 0 ]; then

    echo
    echo "DRIVER TOGGLE CONSOLIDATION: PASS"
    echo "ONE authoritative toggleDriverMode remains."

else

    echo
    echo "DRIVER TOGGLE CONSOLIDATION: FAIL"
    echo "Multiple or missing implementations detected."
fi

echo
echo "6. CHECKING DRIVER REQUEST HANDLER SURVIVED"
echo "--------------------------------------------------"

if grep -q \
"window.showDriverRequest = function" \
frontend/js/app_core.js; then

    echo "showDriverRequest(): PRESERVED"

else

    echo "ERROR: showDriverRequest() missing"
fi

echo
echo "7. JAVASCRIPT SYNTAX CHECK"
echo "--------------------------------------------------"

if command -v node >/dev/null 2>&1; then

    node --check frontend/js/app_core.js

    if [ $? -eq 0 ]; then
        echo "app_core.js syntax: PASS"
    else
        echo "app_core.js syntax: FAIL"
    fi

else

    echo "Node unavailable for syntax check."
fi

echo
echo "8. BACKEND HEALTH"
echo "--------------------------------------------------"

HEALTH=$(curl -sS \
  --max-time 5 \
  http://localhost:3000/api/health 2>&1 || true)

echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "BACKEND HEALTH: PASS"
else
    echo "BACKEND HEALTH: FAIL"
fi

echo
echo "9. DRIVER API LIFECYCLE TEST"
echo "--------------------------------------------------"

TEST_DRIVER_ID="FINAL-CONSOLIDATION-TEST-$(date +%s)"

echo
echo "ONLINE TEST"

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

echo
echo "OFFLINE TEST"

OFFLINE_RESPONSE=$(curl -sS \
  --max-time 5 \
  -X POST \
  http://localhost:3000/api/drivers/offline \
  -H "Content-Type: application/json" \
  -d "{\"driverId\":\"$TEST_DRIVER_ID\"}" 2>&1 || true)

echo "$OFFLINE_RESPONSE"

echo
echo "10. ROOT RUNTIME CHECK"
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
    echo "app_core.js: LOADED"
else
    echo "app_core.js: NOT DETECTED"
fi

echo
echo "11. FINAL ARCHITECTURE"
echo "--------------------------------------------------"

echo "ROOT index.html"
echo "  └── toggleDriverMode()  ← SINGLE AUTHORITY"
echo
echo "frontend/js/app_core.js"
echo "  ├── ride request logic"
echo "  ├── driver request display"
echo "  └── NO toggleDriverMode override"
echo
echo "frontend/js/fix.js"
echo "  ├── driver registration"
echo "  ├── Firebase integration"
echo "  └── NO toggleDriverMode override"
echo
echo "backend/server.js"
echo "  ├── POST /api/drivers/online"
echo "  ├── POST /api/drivers/offline"
echo "  └── GET  /api/drivers/online"

echo
echo "=================================================="
echo "SURGICAL REMOVAL COMPLETE"
echo "=================================================="

echo
echo "BACKUP:"
echo "$BACKUP_DIR"

echo
echo "NEXT ACTION:"
echo "Hard refresh the CabLink browser/PWA."
echo "Test Driver Mode from the ROOT runtime on port 3000."
echo "Do NOT start Vite on port 5173."

