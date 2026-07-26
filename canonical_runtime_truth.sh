#!/data/data/com.termux/files/usr/bin/bash

set +e

echo "============================================================"
echo "CABLINK — CANONICAL RUNTIME TRUTH AUDIT"
echo "READ-ONLY — NO FILES WILL BE MODIFIED"
echo "============================================================"
echo

ROOT="$HOME/CabLink-pwa"
cd "$ROOT" || exit 1

OUT="CANONICAL_RUNTIME_TRUTH_$(date +%Y%m%d_%H%M%S).txt"

{
echo "CABLINK CANONICAL RUNTIME TRUTH AUDIT"
echo "Date: $(date)"
echo "Project: $ROOT"
echo

echo "============================================================"
echo "1. PROJECT ENTRYPOINT CANDIDATES"
echo "============================================================"

for f in \
  package.json \
  vite.config.js \
  vite.config.ts \
  index.html \
  frontend/index.html \
  src/main.jsx \
  src/main.tsx \
  src/App.jsx \
  src/App.tsx \
  frontend/main.jsx \
  frontend/main.js \
  frontend/js/app.js \
  frontend/js/app_core.js \
  backend/server.js \
  server.js
do
  if [ -f "$f" ]; then
    echo "[FOUND] $f"
  else
    echo "[MISS ] $f"
  fi
done

echo
echo "============================================================"
echo "2. PACKAGE.JSON — SCRIPTS AND MAIN"
echo "============================================================"

if [ -f package.json ]; then
  node - <<'NODE'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));

console.log('name:', p.name || '(none)');
console.log('version:', p.version || '(none)');
console.log('main:', p.main || '(none)');
console.log('type:', p.type || '(none)');
console.log('scripts:', JSON.stringify(p.scripts || {}, null, 2));
NODE
else
  echo "package.json not found"
fi

echo
echo "============================================================"
echo "3. HTML SCRIPT LOADING — ALL CANDIDATE ENTRYPOINTS"
echo "============================================================"

for f in index.html frontend/index.html; do
  if [ -f "$f" ]; then
    echo
    echo "----- $f -----"
    grep -nE '<script|src=|type="module"|onclick=' "$f" 2>/dev/null
  fi
done

echo
echo "============================================================"
echo "4. DRIVER MODE FUNCTION DEFINITIONS"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'function[[:space:]]+toggleDriverMode|toggleDriverMode[[:space:]]*=|window\.toggleDriverMode' \
  . 2>/dev/null

echo
echo "============================================================"
echo "5. DRIVER ONLINE/OFFLINE API REFERENCES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  '/api/drivers/online|/api/drivers/offline' \
  . 2>/dev/null

echo
echo "============================================================"
echo "6. DRIVER LOCATION / GEOLOCATION REFERENCES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'navigator\.geolocation|getCurrentPosition|watchPosition|clearWatch|latitude|longitude|lat[[:space:]]*:|lng[[:space:]]*:' \
  frontend backend 2>/dev/null

echo
echo "============================================================"
echo "7. DRIVER IDENTITY SOURCES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'driverId|driver_id|driverID|STATE\.driverId|localStorage.*driver|wallet.*driver|driver-[0-9]|drv-[0-9]|DRV-' \
  frontend backend 2>/dev/null

echo
echo "============================================================"
echo "8. DRIVER POLLING / REQUEST POLLING"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'pollForRideRequests|setInterval.*driver|driverPoll|pending.*ride|ride.*request|showDriverRequest' \
  frontend backend 2>/dev/null

echo
echo "============================================================"
echo "9. BACKEND DRIVER ROUTES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'drivers/online|drivers/offline|router\.(get|post|put|patch|delete).*driver|app\.(get|post|put|patch|delete).*driver' \
  backend server.js 2>/dev/null

echo
echo "============================================================"
echo "10. BACKEND SERVER STARTUP REFERENCES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'listen\(|express\(|createServer|npm run|node .*server|vite|concurrently|nodemon' \
  package.json backend server.js 2>/dev/null

echo
echo "============================================================"
echo "11. RIDE REQUEST / ACCEPTANCE / COMPLETION ROUTES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  '/api/rides|requestRide|acceptRide|acceptTask|completeRide|ride.*complete|status.*COMPLETED|DRIVER_ASSIGNED' \
  frontend backend 2>/dev/null

echo
echo "============================================================"
echo "12. REWARD AUTHORITY REFERENCES"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'claimReward|thb_claim_engine|real_executor|completionReward|ride_completion|recordReward|wallet\.add|transfer\(' \
  frontend backend 2>/dev/null

echo
echo "============================================================"
echo "13. SERVER / PORT CONFIGURATION"
echo "============================================================"

grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude='*.bak' \
  --exclude='*.backup*' \
  --exclude='*.old' \
  'PORT[[:space:]]*=|port[[:space:]]*:|localhost:[0-9]+|127\.0\.0\.1:[0-9]+' \
  package.json frontend backend .env .env.* 2>/dev/null

echo
echo "============================================================"
echo "14. CURRENT RUNNING PROCESSES"
echo "============================================================"

echo "--- Node processes ---"
ps -ef 2>/dev/null | grep -E 'node|npm|vite' | grep -v grep

echo
echo "--- Listening ports ---"
if command -v ss >/dev/null 2>&1; then
  ss -ltnp 2>/dev/null
elif command -v netstat >/dev/null 2>&1; then
  netstat -ltnp 2>/dev/null
else
  echo "Neither ss nor netstat available"
fi

echo
echo "============================================================"
echo "15. GIT TRACKING — LIVE SOURCE FILES ONLY"
echo "============================================================"

git status --short 2>/dev/null

echo
echo "============================================================"
echo "16. FINAL RUNTIME CANDIDATE SUMMARY"
echo "============================================================"

echo "HTML entrypoint candidates:"
find . -maxdepth 3 -type f \( -name 'index.html' -o -name 'main.jsx' -o -name 'main.tsx' -o -name 'main.js' \) \
  -not -path './node_modules/*' \
  -not -path './archive/*' \
  -not -path './migration_backup/*' \
  -print 2>/dev/null

echo
echo "Backend server candidates:"
find . -maxdepth 3 -type f \( -name 'server.js' -o -name 'app.js' \) \
  -not -path './node_modules/*' \
  -not -path './archive/*' \
  -not -path './migration_backup/*' \
  -print 2>/dev/null

echo
echo "============================================================"
echo "END OF READ-ONLY AUDIT"
echo "============================================================"

} | tee "$OUT"

echo
echo "============================================================"
echo "AUDIT COMPLETE"
echo "============================================================"
echo "Report saved to:"
echo "$ROOT/$OUT"
echo
echo "NO SOURCE FILES WERE MODIFIED."
