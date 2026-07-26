#!/data/data/com.termux/files/usr/bin/bash
set -u

cd ~/CabLink-pwa || exit 1

echo "============================================================"
echo "CABLINK BLOCK 13B — CANONICAL RUNTIME PROOF"
echo "============================================================"

echo
echo "1. PROJECT ROOT"
pwd

echo
echo "2. NODE / NPM / VITE"
node -v
npm -v
npx vite --version 2>/dev/null || true

echo
echo "3. PACKAGE.JSON"
node - <<'NODE'
const fs=require('fs');
const p=JSON.parse(fs.readFileSync('package.json','utf8'));

console.log("name:",p.name||"(none)");
console.log("scripts:",JSON.stringify(p.scripts||{},null,2));
console.log("dependencies:",JSON.stringify(p.dependencies||{},null,2));
console.log("devDependencies:",JSON.stringify(p.devDependencies||{},null,2));
NODE

echo
echo "4. VITE CONFIG"
if [ -f vite.config.js ]; then
  sed -n '1,240p' vite.config.js
else
  echo "MISSING vite.config.js"
fi

echo
echo "5. FRONTEND ENTRY CHAIN"
for f in \
  frontend/index.html \
  frontend/main.jsx \
  frontend/App.jsx \
  frontend/components/LegacyCabLink.jsx
do
  echo
  echo "----- $f -----"
  if [ -f "$f" ]; then
    sed -n '1,220p' "$f"
  else
    echo "MISSING"
  fi
done

echo
echo "6. BACKEND ENTRY"
echo "----- backend/server.js -----"
if [ -f backend/server.js ]; then
  sed -n '1,320p' backend/server.js
else
  echo "MISSING"
fi

echo
echo "7. BACKEND ROUTE MOUNTS"
grep -RInE \
  "app\.use|app\.(get|post|patch|put|delete)\(" \
  backend/server.js backend/server backend/routes 2>/dev/null \
  | grep -vE "\.bak|backup" \
  | head -n 500

echo
echo "8. FRONTEND API CALLS"
grep -RInE \
  "fetch\(['\"]\/api|axios|/api/" \
  frontend \
  --exclude='*.bak' \
  --exclude='*.backup' \
  2>/dev/null \
  | head -n 500

echo
echo "9. RIDE ENGINE IMPORT GRAPH"
grep -RInE \
  "require\(.*(ride_engine|rideService|ride_service|ride_state_service|ride_orchestrator_service|ride_dispatch_bridge|dispatch_service|driver_matching_service)" \
  backend \
  --exclude='*.bak' \
  --exclude='*.backup' \
  2>/dev/null \
  | head -n 500

echo
echo "10. RIDE ROUTE IMPORTS"
grep -RInE \
  "require\(.*routes/(rides|ride_api|ride_state_api|ride_economy_api|completion_api|dispatch_api|matching_api|live_ride_api)" \
  backend \
  --exclude='*.bak' \
  --exclude='*.backup' \
  2>/dev/null \
  | head -n 500

echo
echo "11. REACT PLUGIN RESOLUTION"
node - <<'NODE'
for(const p of [
  '@vitejs/plugin-react',
  'vite',
  'react',
  'react-dom'
]){
  try{
    console.log(p,'=>',require.resolve(p));
  }catch(e){
    console.log(p,'=> NOT RESOLVABLE');
  }
}
NODE

echo
echo "12. BACKEND SYNTAX CHECK"
node --check backend/server.js
echo "backend/server.js syntax: $?"

echo
echo "13. FRONTEND MAIN SYNTAX CHECK"
node --check frontend/main.jsx 2>&1 || true

echo
echo "14. START BACKEND TEMPORARILY"
node backend/server.js > /tmp/cablink_backend.log 2>&1 &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"

sleep 3

echo
echo "15. BACKEND LOG"
cat /tmp/cablink_backend.log

echo
echo "16. PORT CHECK"
if command -v ss >/dev/null 2>&1; then
  ss -ltnp 2>/dev/null | grep -E ':3000|:5173' || true
elif command -v netstat >/dev/null 2>&1; then
  netstat -ltnp 2>/dev/null | grep -E ':3000|:5173' || true
fi

echo
echo "17. BACKEND HEALTH PROBE"
curl -sS -i --max-time 5 http://localhost:3000/api/health || true

echo
echo "18. RIDES PROBE"
curl -sS -i --max-time 5 http://localhost:3000/api/rides || true

echo
echo "19. STOP TEMPORARY BACKEND"
kill "$BACKEND_PID" 2>/dev/null || true
sleep 1

echo
echo "20. FINAL VERDICT"
echo "BLOCK 13B READ-ONLY RUNTIME PROOF COMPLETE"
echo
echo "NO SOURCE FILES MODIFIED"
echo "NO SOURCE FILES MOVED"
echo "NO SOURCE FILES DELETED"
echo
echo "REPORT COMPLETE"
