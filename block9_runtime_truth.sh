#!/data/data/com.termux/files/usr/bin/bash

set +e

echo "================================================================================"
echo "CABLINK BLOCK 9 — ACTUAL RUNTIME CHAIN VERIFICATION"
echo "================================================================================"
echo "Repository: $(pwd)"
echo "Date: $(date)"
echo

echo "================================================================================"
echo "1. PACKAGE SCRIPTS"
echo "================================================================================"

node - <<'NODE'
const fs=require("fs");

if(!fs.existsSync("package.json")){
  console.log("package.json: MISSING");
  process.exit();
}

const p=JSON.parse(fs.readFileSync("package.json","utf8"));

console.log(JSON.stringify({
  name:p.name,
  version:p.version,
  type:p.type || null,
  scripts:p.scripts || {},
  dependencies:p.dependencies || {},
  devDependencies:p.devDependencies || {}
},null,2));
NODE

echo

echo "================================================================================"
echo "2. VITE CONFIGURATION"
echo "================================================================================"

if [ -f vite.config.js ]; then
  cat vite.config.js
else
  echo "vite.config.js: MISSING"
fi

echo

echo "================================================================================"
echo "3. FRONTEND ENTRY CHAIN"
echo "================================================================================"

for f in \
  frontend/index.html \
  frontend/main.jsx \
  frontend/App.jsx \
  frontend/components/LegacyCabLink.jsx
do
  echo
  echo "----- $f -----"
  if [ -f "$f" ]; then
    sed -n '1,240p' "$f"
  else
    echo "MISSING"
  fi
done

echo

echo "================================================================================"
echo "4. BACKEND STARTUP CHAIN"
echo "================================================================================"

for f in \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js
do
  echo
  echo "----- $f -----"
  if [ -f "$f" ]; then
    sed -n '1,260p' "$f"
  else
    echo "MISSING"
  fi
done

echo

echo "================================================================================"
echo "5. BACKEND ROUTE MOUNTS"
echo "================================================================================"

echo "----- backend/server.js app.use / app.get / app.post / app.patch -----"
grep -nE 'app\.(use|get|post|patch|put|delete)\(' backend/server.js 2>/dev/null || true

echo
echo "----- backend/server/app.js app.use / app.get / app.post / app.patch -----"
grep -nE 'app\.(use|get|post|patch|put|delete)\(' backend/server/app.js 2>/dev/null || true

echo
echo "----- backend/server/index.js app.use / app.get / app.post / app.patch -----"
grep -nE 'app\.(use|get|post|patch|put|delete)\(' backend/server/index.js 2>/dev/null || true

echo

echo "================================================================================"
echo "6. ROUTE FILE INVENTORY"
echo "================================================================================"

find backend/routes -maxdepth 1 -type f -print 2>/dev/null | sort

echo

echo "================================================================================"
echo "7. CRITICAL RIDE CONTRACTS"
echo "================================================================================"

echo "----- FRONTEND RIDE FETCHES -----"
grep -RInE "fetch\\(['\"][^'\"]*(/api/rides|/api/ride|/api/dispatch|/api/drivers)" \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null | head -300

echo

echo "----- BACKEND RIDE ROUTES -----"
grep -RInE 'router\.(get|post|patch|put|delete)|app\.(get|post|patch|put|delete)' \
  backend/routes \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js \
  2>/dev/null | head -400

echo

echo "================================================================================"
echo "8. CRITICAL FRONTEND RUNTIME DEPENDENCIES"
echo "================================================================================"

echo "----- frontend/App.jsx -----"
cat frontend/App.jsx 2>/dev/null

echo
echo "----- frontend/components/LegacyCabLink.jsx -----"
cat frontend/components/LegacyCabLink.jsx 2>/dev/null

echo
echo "----- dashboard registry -----"
cat frontend/components/dashboard_registry.js 2>/dev/null

echo

echo "================================================================================"
echo "9. VITE BUILD TOOL AVAILABILITY"
echo "================================================================================"

if [ -x node_modules/.bin/vite ]; then
  echo "LOCAL VITE: PRESENT"
  node_modules/.bin/vite --version 2>&1
else
  echo "LOCAL VITE: MISSING"
fi

if [ -x node_modules/.bin/esbuild ]; then
  echo "LOCAL ESBUILD: PRESENT"
else
  echo "LOCAL ESBUILD: MISSING"
fi

echo

echo "================================================================================"
echo "10. NODE_MODULES STATUS"
echo "================================================================================"

if [ -d node_modules ]; then
  echo "node_modules: PRESENT"
  echo "node_modules package count:"
  find node_modules -mindepth 1 -maxdepth 1 -type d | wc -l
else
  echo "node_modules: MISSING"
fi

echo

echo "================================================================================"
echo "11. STATIC PRODUCTION BUILD CHECK"
echo "================================================================================"

if [ -d dist ]; then
  echo "dist/: PRESENT"
  echo "dist/index.html:"
  test -f dist/index.html && echo "PRESENT" || echo "MISSING"
  echo "dist/assets:"
  find dist/assets -maxdepth 1 -type f 2>/dev/null | sort | head -50
else
  echo "dist/: MISSING"
fi

echo

echo "================================================================================"
echo "12. BACKEND LIVE START TEST"
echo "================================================================================"

PORT=3000 node backend/server.js > /tmp/cablink_backend_block9.log 2>&1 &
SERVER_PID=$!

echo "Started backend candidate: backend/server.js"
echo "PID: $SERVER_PID"

sleep 2

if kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "BACKEND PROCESS: RUNNING"
else
  echo "BACKEND PROCESS: FAILED"
fi

echo
echo "----- BACKEND START LOG -----"
cat /tmp/cablink_backend_block9.log

echo

echo "================================================================================"
echo "13. LIVE API HEALTH"
echo "================================================================================"

curl -sS -i --max-time 5 http://localhost:3000/api/health 2>&1 || true

echo

echo "================================================================================"
echo "14. LIVE RIDE API"
echo "================================================================================"

echo "GET /api/rides"
curl -sS -i --max-time 5 http://localhost:3000/api/rides 2>&1 || true

echo

echo "================================================================================"
echo "15. LIVE DRIVER API"
echo "================================================================================"

echo "GET /api/drivers/online"
curl -sS -i --max-time 5 http://localhost:3000/api/drivers/online 2>&1 || true

echo

echo "================================================================================"
echo "16. LIVE DRIVER APPLICATION API"
echo "================================================================================"

echo "POST /api/drivers/apply"
curl -sS -i --max-time 5 \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"BLOCK9_TEST","phone":"0000000000","vehicle":"TEST"}' \
  http://localhost:3000/api/drivers/apply 2>&1 || true

echo

echo "================================================================================"
echo "17. UNMOUNTED ROUTE DETECTION"
echo "================================================================================"

echo "Checking route files referenced by backend/server.js..."
for route in backend/routes/*.js; do
  base=$(basename "$route" .js)

  if grep -q "$base" backend/server.js 2>/dev/null; then
    echo "LIKELY MOUNTED: $route"
  else
    echo "NOT REFERENCED BY server.js: $route"
  fi
done

echo

echo "================================================================================"
echo "18. FRONTEND HTML SERVERING TEST"
echo "================================================================================"

echo "GET /"
curl -sS -I --max-time 5 http://localhost:3000/ 2>&1 || true

echo

echo "GET /frontend/"
curl -sS -I --max-time 5 http://localhost:3000/frontend/ 2>&1 || true

echo

echo "GET /dist/"
curl -sS -I --max-time 5 http://localhost:3000/dist/ 2>&1 || true

echo

echo "================================================================================"
echo "19. FRONTEND ENTRY SIGNATURES"
echo "================================================================================"

for f in index.html frontend/index.html dist/index.html launcher.html; do
  echo
  echo "----- $f -----"
  if [ -f "$f" ]; then
    grep -nE '<script|src=|type="module"|main\.jsx|app_core|LegacyCabLink|assets/index-' "$f" | head -80
  else
    echo "MISSING"
  fi
done

echo

echo "================================================================================"
echo "20. PROCESS CLEANUP"
echo "================================================================================"

if kill -0 "$SERVER_PID" 2>/dev/null; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "Backend test process stopped."
else
  echo "Backend process already stopped."
fi

echo

echo "================================================================================"
echo "BLOCK 9 CONCLUSION"
echo "================================================================================"

echo "This block did NOT modify source files."
echo "This block did NOT delete files."
echo "This block did NOT migrate architecture."
echo
echo "It tested:"
echo "1. Package scripts"
echo "2. Vite configuration"
echo "3. React entry chain"
echo "4. Backend startup candidates"
echo "5. Backend route registration"
echo "6. Live backend health"
echo "7. Live ride API"
echo "8. Live driver API"
echo "9. Frontend serving paths"
echo "10. Production dist presence"
echo
echo "Copy the COMPLETE output back here."
echo "The next step is to select the SINGLE CANONICAL RUNTIME CHAIN."
echo "================================================================================"

