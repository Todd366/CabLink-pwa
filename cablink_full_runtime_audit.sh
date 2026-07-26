#!/data/data/com.termux/files/usr/bin/bash

set -u

cd ~/CabLink-pwa

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT=".cablink_audits/full_runtime_audit_$STAMP.txt"

mkdir -p .cablink_audits

exec > >(tee "$REPORT") 2>&1

echo "=============================================================="
echo "CABLINK FULL RUNTIME AUDIT"
echo "=============================================================="
echo "Date: $(date)"
echo "Project: $PWD"
echo "Report: $REPORT"
echo "=============================================================="

echo
echo "1. PROJECT STRUCTURE"
echo "--------------------------------------------------------------"

find . \
  -maxdepth 3 \
  -type f \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  ! -path './.cablink_backups/*' \
  | sort

echo
echo "2. ROOT RUNTIME"
echo "--------------------------------------------------------------"

if [ -f index.html ]; then
    echo "[PASS] Root index.html exists"
else
    echo "[FAIL] Root index.html missing"
fi

echo
echo "Root script references:"
grep -nE '<script[^>]*src=|type="module"' index.html || true

echo
echo "Root stylesheet references:"
grep -nE '<link[^>]*stylesheet|href="[^"]+\.css' index.html || true

echo
echo "3. FRONTEND RUNTIME"
echo "--------------------------------------------------------------"

if [ -f frontend/index.html ]; then
    echo "[PASS] frontend/index.html exists"
else
    echo "[FAIL] frontend/index.html missing"
fi

echo
echo "Frontend script references:"
grep -nE '<script[^>]*src=|type="module"' frontend/index.html || true

echo
echo "4. BACKEND"
echo "--------------------------------------------------------------"

if [ -f backend/server.js ]; then
    echo "[PASS] backend/server.js exists"
else
    echo "[FAIL] backend/server.js missing"
fi

echo
echo "Backend process:"
ps -ef | grep -E '[n]ode.*backend/server' || true

echo
echo "Backend API routes:"
grep -nE \
"app\.(get|post|put|patch|delete)\(" \
backend/server.js || true

echo
echo "5. BACKEND HEALTH"
echo "--------------------------------------------------------------"

HEALTH=$(curl -sS --max-time 5 \
  http://localhost:3000/api/health 2>&1 || true)

echo "$HEALTH"

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "[PASS] Backend health"
else
    echo "[FAIL] Backend health"
fi

echo
echo "6. DRIVER API"
echo "--------------------------------------------------------------"

echo "Driver routes:"
grep -nE \
"/api/drivers|drivers/online|drivers/offline" \
backend/server.js || true

echo
echo "Current online drivers:"
curl -sS --max-time 5 \
  http://localhost:3000/api/drivers/online 2>&1 || true

echo
echo "7. RIDE API"
echo "--------------------------------------------------------------"

echo "Ride routes:"
grep -nE \
"/api/rides|app\.(get|post|patch|put|delete).*rides" \
backend/server.js || true

echo
echo "Current rides:"
curl -sS --max-time 5 \
  http://localhost:3000/api/rides 2>&1 || true

echo
echo "8. FRONTEND API REFERENCES"
echo "--------------------------------------------------------------"

grep -RInE \
"fetch\(['\"]\/api/|axios|XMLHttpRequest|/api/" \
index.html \
frontend \
--exclude-dir=node_modules \
--exclude='*.bak' \
--exclude='*.backup*' \
2>/dev/null | head -300 || true

echo
echo "9. DRIVER TOGGLE DEFINITIONS"
echo "--------------------------------------------------------------"

echo "All toggleDriverMode references:"
grep -RInE \
"toggleDriverMode" \
index.html \
frontend \
role.js \
fix.js \
fare_engine.js \
2>/dev/null | head -200 || true

echo
echo "10. DRIVER REGISTRATION"
echo "--------------------------------------------------------------"

grep -RInE \
"showDriverRegistrationForm|submitDriverForm|driver_applications|userRole.*driver|role.*driver" \
index.html \
frontend \
fix.js \
role.js \
2>/dev/null | head -300 || true

echo
echo "11. DRIVER LOCATION / GPS"
echo "--------------------------------------------------------------"

grep -RInE \
"navigator\.geolocation|getCurrentPosition|watchPosition|latitude|longitude|lat:|lng:" \
index.html \
frontend \
backend \
--exclude-dir=node_modules \
2>/dev/null | head -300 || true

echo
echo "12. RIDE STATE MACHINE"
echo "--------------------------------------------------------------"

if [ -f frontend/js/rides/rideStateMachine.js ]; then
    echo "[PASS] rideStateMachine.js exists"
    grep -nE \
    "REQUEST|SEARCH|ACCEPT|ARRIV|START|COMPLETE|CANCEL|RATED" \
    frontend/js/rides/rideStateMachine.js \
    | head -200 || true
else
    echo "[FAIL] rideStateMachine.js missing"
fi

echo
echo "13. DRIVER LIFECYCLE"
echo "--------------------------------------------------------------"

if [ -f frontend/js/driver/driverLifecycleControls.js ]; then
    echo "[PASS] driverLifecycleControls.js exists"
    sed -n '1,260p' frontend/js/driver/driverLifecycleControls.js
else
    echo "[FAIL] driverLifecycleControls.js missing"
fi

echo
echo "14. DRIVER SERVICES"
echo "--------------------------------------------------------------"

find frontend/js/driver -type f -maxdepth 2 2>/dev/null | sort

for f in frontend/js/driver/*.js; do
    [ -f "$f" ] || continue
    echo
    echo "----- $f -----"
    grep -nE \
    "fetch|api|online|offline|ride|location|wallet|accept|reject" \
    "$f" \
    | head -200 || true
done

echo
echo "15. RIDE SERVICES"
echo "--------------------------------------------------------------"

find frontend/js/rides -type f -maxdepth 2 2>/dev/null | sort

for f in frontend/js/rides/*.js; do
    [ -f "$f" ] || continue
    echo
    echo "----- $f -----"
    grep -nE \
    "fetch|api|REQUEST|SEARCH|ACCEPT|ARRIV|START|COMPLETE|CANCEL|RATED" \
    "$f" \
    | head -250 || true
done

echo
echo "16. GPS MODULES"
echo "--------------------------------------------------------------"

find frontend/js -type f \
  | grep -Ei \
  "gps|location|geo|map" \
  | sort

echo
echo "17. FARE ENGINE"
echo "--------------------------------------------------------------"

find . -type f \
  ! -path './node_modules/*' \
  ! -path './.git/*' \
  | grep -Ei \
  "fare|pricing|price" \
  | sort

echo
echo "Fare references:"
grep -RInE \
"fare|price|distance|per.?km|baseFare|minimumFare" \
index.html \
frontend \
backend \
--exclude-dir=node_modules \
2>/dev/null | head -300 || true

echo
echo "18. WALLET / BLOCKCHAIN / THB"
echo "--------------------------------------------------------------"

grep -RInE \
"ethers|WalletConnect|wallet|THB|THoBo|BSC|chainId|97|claim|reward" \
index.html \
frontend \
backend \
--exclude-dir=node_modules \
2>/dev/null | head -400 || true

echo
echo "19. FIREBASE"
echo "--------------------------------------------------------------"

grep -RInE \
"firebase|firestore|driver_applications|collection\(" \
index.html \
frontend \
backend \
--exclude-dir=node_modules \
2>/dev/null | head -300 || true

echo
echo "20. PWA"
echo "--------------------------------------------------------------"

echo "Manifest:"
find . -maxdepth 3 -type f \
  | grep -Ei "manifest.*\.json$" \
  | sort

echo
echo "Service workers:"
find . -maxdepth 4 -type f \
  | grep -Ei "service.*worker|sw\.js$" \
  | sort

echo
echo "PWA references:"
grep -RInE \
"manifest|serviceWorker|navigator\.serviceWorker|register\(" \
index.html \
frontend \
--exclude-dir=node_modules \
2>/dev/null | head -300 || true

echo
echo "21. OFFLINE SUPPORT"
echo "--------------------------------------------------------------"

grep -RInE \
"offlineQueue|navigator\.onLine|online|syncOfflineQueue|queueOfflineRide|localStorage" \
index.html \
frontend \
--exclude-dir=node_modules \
2>/dev/null | head -400 || true

echo
echo "22. DUPLICATE GLOBAL FUNCTIONS"
echo "--------------------------------------------------------------"

echo "Common high-risk globals:"

for fn in \
  toggleDriverMode \
  bookRide \
  requestRide \
  updateDriverUI \
  showDriverRequest \
  completeRide \
  cancelRide \
  connectWallet \
  claimReward \
  calculateFare \
  updateAllUI
do
    COUNT=$(grep -RhoE \
      "(function[[:space:]]+$fn|window\.$fn[[:space:]]*=)" \
      index.html \
      frontend \
      role.js \
      fix.js \
      fare_engine.js \
      2>/dev/null \
      | wc -l)

    echo "$fn : $COUNT reference(s)"
done

echo
echo "23. POSSIBLE BROKEN FILE REFERENCES"
echo "--------------------------------------------------------------"

python3 <<'PYEOF'
from pathlib import Path
import re

files = [
    Path("index.html"),
    Path("frontend/index.html")
]

for html in files:
    if not html.exists():
        continue

    text = html.read_text(errors="ignore")

    refs = re.findall(
        r'(?:src|href)=["\']([^"\']+)["\']',
        text
    )

    print(f"\nChecking references from {html}:")

    for ref in refs:
        if ref.startswith(("http://", "https://", "//", "#", "data:")):
            continue

        ref = ref.split("?")[0].split("#")[0]

        if ref.startswith("/"):
            target = Path("." + ref)
        else:
            target = html.parent / ref

        if target.exists():
            print(f"[OK]   {ref}")
        else:
            print(f"[MISS] {ref}")

PYEOF

echo
echo "24. JAVASCRIPT SYNTAX CHECK"
echo "--------------------------------------------------------------"

if command -v node >/dev/null 2>&1; then

    find frontend -type f \
      -name "*.js" \
      ! -path "*/node_modules/*" \
      -print0 \
      | while IFS= read -r -d '' file; do

        if node --check "$file" >/dev/null 2>&1; then
            echo "[PASS] $file"
        else
            echo "[FAIL] $file"
        fi

    done

else
    echo "Node unavailable."
fi

echo
echo "25. ROOT HTTP RUNTIME"
echo "--------------------------------------------------------------"

ROOT_HTML=$(curl -sS --max-time 5 \
  http://localhost:3000/ 2>&1 || true)

if echo "$ROOT_HTML" | grep -q "CabLink"; then
    echo "[PASS] Root CabLink runtime"
else
    echo "[FAIL] Root CabLink runtime"
fi

echo
echo "26. FINAL SUMMARY"
echo "=============================================================="

echo
echo "This audit is READ-ONLY."
echo
echo "No application source files were intentionally modified."
echo
echo "Report saved to:"
echo "$REPORT"

echo
echo "=============================================================="
echo "AUDIT COMPLETE"
echo "=============================================================="

