#!/data/data/com.termux/files/usr/bin/bash

set +e

ROOT="$(pwd)"
REPORT="$ROOT/block13a_canonical_runtime_truth.txt"

exec > >(tee "$REPORT") 2>&1

echo "================================================================================"
echo "CABLINK BLOCK 13A — CANONICAL RUNTIME TRUTH"
echo "================================================================================"
echo "Date: $(date)"
echo "Repository: $ROOT"
echo
echo "RULE: READ-ONLY ANALYSIS"
echo "No source files will be modified, moved, renamed, or deleted."
echo

section() {
  echo
  echo "================================================================================"
  echo "$1"
  echo "================================================================================"
}

section "1. REPOSITORY IDENTITY"

echo "PWD:"
pwd

echo
echo "Git branch:"
git branch --show-current 2>/dev/null || true

echo
echo "Git status:"
git status --short 2>/dev/null || true

echo
echo "Package:"
if [ -f package.json ]; then
  node -e '
    const p=require("./package.json");
    console.log(JSON.stringify({
      name:p.name,
      version:p.version,
      main:p.main,
      scripts:p.scripts
    },null,2));
  ' 2>/dev/null || cat package.json
fi

section "2. NPM START COMMAND TRUTH"

echo "package.json start:"
node -e '
const p=require("./package.json");
console.log(p.scripts && p.scripts.start ? p.scripts.start : "NO START SCRIPT");
' 2>/dev/null

echo
echo "package.json backend:"
node -e '
const p=require("./package.json");
console.log(p.scripts && p.scripts.backend ? p.scripts.backend : "NO BACKEND SCRIPT");
' 2>/dev/null

echo
echo "package.json dev:"
node -e '
const p=require("./package.json");
console.log(p.scripts && p.scripts.dev ? p.scripts.dev : "NO DEV SCRIPT");
' 2>/dev/null

section "3. BACKEND ENTRY CANDIDATES"

for f in \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js \
  api/index.js \
  backend/index.js
do
  if [ -f "$f" ]; then
    echo
    echo "FOUND: $f"
    echo "----- first 80 lines -----"
    sed -n '1,80p' "$f"
  fi
done

section "4. BACKEND SERVER DEPENDENCY TRACE"

echo "server.js require/import references:"
if [ -f backend/server.js ]; then
  grep -nE 'require\\(|from |import |app\\.use|app\\.(get|post|patch|put|delete)' \
    backend/server.js || true
fi

echo
echo "backend/server/app.js require/import references:"
if [ -f backend/server/app.js ]; then
  grep -nE 'require\\(|from |import |app\\.use|app\\.(get|post|patch|put|delete)' \
    backend/server/app.js || true
fi

echo
echo "backend/server/index.js:"
if [ -f backend/server/index.js ]; then
  cat backend/server/index.js
fi

section "5. CANONICAL BACKEND ROUTE MOUNTS"

for f in backend/server.js backend/server/app.js; do
  if [ -f "$f" ]; then
    echo
    echo "===== $f ====="
    grep -nE 'app\\.use\\(|app\\.(get|post|patch|put|delete)\\(' "$f" || true
  fi
done

section "6. ALL BACKEND ROUTE FILES"

find backend/routes -maxdepth 1 -type f -print 2>/dev/null | sort

section "7. ROUTE MOUNT CROSS-CHECK"

echo "Route files:"
find backend/routes -maxdepth 1 -type f -name '*.js' -printf '%f\n' 2>/dev/null | sort

echo
echo "References to backend/routes:"
grep -RInE 'require\\(["'\'']\\.\\.?/.*routes/|require\\(["'\''].*routes/|from ["'\''].*routes/' \
  backend api 2>/dev/null | head -300 || true

section "8. FRONTEND BUILD CONFIGURATION"

echo "vite.config.js:"
if [ -f vite.config.js ]; then
  cat vite.config.js
else
  echo "MISSING"
fi

echo
echo "frontend/index.html:"
if [ -f frontend/index.html ]; then
  sed -n '1,120p' frontend/index.html
else
  echo "MISSING"
fi

echo
echo "root index.html:"
if [ -f index.html ]; then
  sed -n '1,120p' index.html
else
  echo "MISSING"
fi

section "9. FRONTEND ENTRY TRACE"

echo "frontend/main.jsx:"
if [ -f frontend/main.jsx ]; then
  cat frontend/main.jsx
else
  echo "MISSING"
fi

echo
echo "frontend/App.jsx:"
if [ -f frontend/App.jsx ]; then
  cat frontend/App.jsx
else
  echo "MISSING"
fi

echo
echo "LegacyCabLink:"
if [ -f frontend/components/LegacyCabLink.jsx ]; then
  cat frontend/components/LegacyCabLink.jsx
else
  echo "MISSING"
fi

section "10. FRONTEND IMPORT GRAPH — FIRST LEVEL"

echo "Imports from main.jsx:"
grep -nE 'import |require\\(' frontend/main.jsx 2>/dev/null || true

echo
echo "Imports from App.jsx:"
grep -nE 'import |require\\(' frontend/App.jsx 2>/dev/null || true

echo
echo "Imports from LegacyCabLink.jsx:"
grep -nE 'import |require\\(' frontend/components/LegacyCabLink.jsx 2>/dev/null || true

section "11. FRONTEND ENTRY REFERENCES"

echo "All references to frontend/main.jsx:"
grep -RInE 'main\\.jsx|/main\\.jsx' \
  . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude='block13a_canonical_runtime_truth.txt' \
  2>/dev/null | head -200 || true

section "12. FRONTEND LEGACY SCRIPT REFERENCES"

for f in index.html frontend/index.html launcher.html; do
  if [ -f "$f" ]; then
    echo
    echo "===== $f ====="
    grep -nE '<script|src=' "$f" | tail -100 || true
  fi
done

section "13. VITE / REACT ENTRY TRUTH"

echo "Searching for Vite entry references:"
grep -RInE 'src="/main\\.jsx"|src="./main\\.jsx"|src="main\\.jsx"|main\\.jsx' \
  frontend index.html launcher.html 2>/dev/null | head -200 || true

echo
echo "Searching for ReactDOM mounting:"
grep -RInE 'createRoot|ReactDOM\\.render' \
  frontend 2>/dev/null | head -200 || true

section "14. API BASE URL REFERENCES"

grep -RInE \
  'localhost:3000|localhost:5173|/api/|CABLINK_API_URL|VITE_|fetch\\(|axios|XMLHttpRequest' \
  frontend \
  --exclude-dir=node_modules \
  2>/dev/null | head -500 || true

section "15. RIDE LIFECYCLE CANDIDATES"

echo "Booking:"
grep -RInE \
  'bookRide|book_ride|createRide|create_ride|requestRide|request_ride|/api/rides|/api/ride' \
  frontend backend \
  --exclude-dir=node_modules \
  2>/dev/null | head -300 || true

echo
echo "Dispatch:"
grep -RInE \
  'dispatch|accept|matching|driver.*request|request.*driver' \
  frontend backend \
  --exclude-dir=node_modules \
  2>/dev/null | head -300 || true

echo
echo "Completion:"
grep -RInE \
  'complete|completion|finish|finished|completed' \
  frontend backend \
  --exclude-dir=node_modules \
  2>/dev/null | head -300 || true

echo
echo "Rewards:"
grep -RInE \
  'reward|THB|claim|wallet' \
  frontend backend \
  --exclude-dir=node_modules \
  2>/dev/null | head -300 || true

section "16. CANONICAL RIDE ENGINE CANDIDATES"

for f in \
  backend/rides/ride_engine.js \
  backend/services/rideService.js \
  backend/services/ride_service.js \
  backend/services/ride_state_service.js \
  backend/services/ride_orchestrator_service.js \
  backend/database/ride_repository.js \
  backend/database/rideRepository.js \
  backend/ride_api_patch.js \
  backend/ride_store.js \
  frontend/js/ride_engine.js \
  frontend/js/rides/rideService.js \
  frontend/js/rides/rideController.js \
  frontend/services/ride_service.js \
  frontend/services/live_ride_api.js
do
  if [ -f "$f" ]; then
    echo
    echo "FOUND CANDIDATE: $f"
    echo "References:"
    grep -RIlF "$f" \
      frontend backend api \
      --exclude-dir=node_modules \
      2>/dev/null | head -50 || true
  fi
done

section "17. BACKEND DATABASE / STORAGE CANDIDATES"

find backend database -type f \
  \( -name '*ride*' -o -name '*user*' -o -name '*driver*' -o -name '*store*' -o -name '*database*' \) \
  2>/dev/null | sort

section "18. ACTIVE SERVER PROCESS CHECK"

echo "Node processes:"
ps -ef 2>/dev/null | grep '[n]ode' || true

echo
echo "Listening ports:"
if command -v ss >/dev/null 2>&1; then
  ss -ltnp 2>/dev/null || true
elif command -v netstat >/dev/null 2>&1; then
  netstat -ltnp 2>/dev/null || true
else
  echo "No ss/netstat available"
fi

section "19. RUNTIME ENDPOINT PROBE"

for url in \
  http://localhost:3000/api/health \
  http://localhost:3000/api/rides \
  http://localhost:5173 \
  http://localhost:5173/api/health
do
  echo
  echo "===== PROBE: $url ====="
  curl -sS -m 5 -i "$url" 2>&1 | head -40 || true
done

section "20. BUILD AVAILABILITY"

echo "node:"
node --version 2>/dev/null || true

echo
echo "npm:"
npm --version 2>/dev/null || true

echo
echo "vite:"
npx vite --version 2>/dev/null || true

echo
echo "React packages:"
node -e '
for (const p of ["react","react-dom","vite","@vitejs/plugin-react"]) {
  try {
    console.log(p, require(p+"/package.json").version);
  } catch(e) {
    console.log(p, "NOT RESOLVABLE");
  }
}
' 2>/dev/null

section "21. GIT TRACKING OF CRITICAL FILES"

for f in \
  package.json \
  vite.config.js \
  vercel.json \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js \
  frontend/index.html \
  frontend/main.jsx \
  frontend/App.jsx \
  frontend/components/LegacyCabLink.jsx \
  frontend/js/app.js \
  frontend/js/app_core.js \
  index.html \
  launcher.html
do
  if [ -e "$f" ]; then
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
      echo "TRACKED: $f"
    else
      echo "UNTRACKED: $f"
    fi
  else
    echo "MISSING: $f"
  fi
done

section "22. CANONICAL RUNTIME TRUTH MATRIX"

echo "BACKEND:"
echo "  npm start command:"
node -e '
const p=require("./package.json");
console.log(p.scripts?.start || "UNKNOWN");
' 2>/dev/null

echo
echo "FRONTEND:"
echo "  Vite root:"
grep -n 'root:' vite.config.js 2>/dev/null || true

echo
echo "  Frontend HTML:"
if [ -f frontend/index.html ]; then echo "frontend/index.html EXISTS"; fi

echo
echo "  React entry:"
if [ -f frontend/main.jsx ]; then echo "frontend/main.jsx EXISTS"; fi

echo
echo "  React App:"
if [ -f frontend/App.jsx ]; then echo "frontend/App.jsx EXISTS"; fi

echo
echo "  Legacy root HTML:"
if [ -f index.html ]; then echo "index.html EXISTS"; fi

section "23. BLOCK 13A VERDICT"

echo "READ-ONLY ANALYSIS COMPLETE"
echo
echo "NO SOURCE FILES MODIFIED"
echo "NO SOURCE FILES MOVED"
echo "NO SOURCE FILES DELETED"
echo
echo "REPORT:"
echo "$REPORT"
echo
echo "NEXT STEP:"
echo "Review this report before any structural reorganisation."
echo "Do NOT run Block 13B until the canonical backend and frontend runtime are proven."

echo
echo "================================================================================"
echo "BLOCK 13A COMPLETE"
echo "================================================================================"

