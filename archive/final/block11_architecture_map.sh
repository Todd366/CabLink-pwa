#!/data/data/com.termux/files/usr/bin/bash

set +e

ROOT="$PWD"
REPORT="$ROOT/block11_architecture_map.txt"

echo "================================================================================"
echo "CABLINK BLOCK 11 — FULL REPOSITORY DEPENDENCY & ARCHITECTURE MAP"
echo "================================================================================"
echo "Repository: $ROOT"
echo "Date: $(date)"
echo
echo "READ-ONLY MODE"
echo "This block does NOT move files."
echo "This block does NOT delete files."
echo "This block does NOT modify application source files."
echo "This block only inspects and reports."
echo

exec > >(tee "$REPORT") 2>&1

echo "================================================================================"
echo "1. REPOSITORY ROOT"
echo "================================================================================"
printf 'Root: %s\n' "$ROOT"
printf 'Node: '; node -v 2>/dev/null || echo "NOT FOUND"
printf 'NPM: '; npm -v 2>/dev/null || echo "NOT FOUND"

echo
echo "================================================================================"
echo "2. TOP-LEVEL STRUCTURE"
echo "================================================================================"

find . -maxdepth 2 \
  -not -path './node_modules*' \
  -not -path './.git*' \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "3. COMPLETE APPLICATION FILE INVENTORY"
echo "================================================================================"

echo "----- JavaScript / JSX -----"
find . \
  -type f \
  \( -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "----- HTML -----"
find . \
  -type f \
  -name '*.html' \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "----- CSS -----"
find . \
  -type f \
  -name '*.css' \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "----- JSON / Configuration -----"
find . \
  -type f \
  \( -name '*.json' -o -name '*.config.js' -o -name '*.config.cjs' \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "4. PACKAGE / BUILD CONFIGURATION"
echo "================================================================================"

for f in package.json vite.config.js vite.config.mjs vite.config.cjs; do
  if [ -f "$f" ]; then
    echo
    echo "----- $f -----"
    sed -n '1,240p' "$f"
  fi
done

echo
echo "================================================================================"
echo "5. FRONTEND ENTRY CHAIN"
echo "================================================================================"

for f in \
  frontend/index.html \
  frontend/main.jsx \
  frontend/main.js \
  frontend/App.jsx \
  frontend/App.js \
  frontend/components/LegacyCabLink.jsx
do
  if [ -f "$f" ]; then
    echo
    echo "----- $f -----"
    sed -n '1,260p' "$f"
  else
    echo
    echo "MISSING: $f"
  fi
done

echo
echo "================================================================================"
echo "6. FRONTEND IMPORT GRAPH"
echo "================================================================================"

echo "----- All import statements -----"

grep -RInE \
  '^[[:space:]]*(import|export).*from[[:space:]]*["'\'']|^[[:space:]]*import[[:space:]]*["'\'']' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "================================================================================"
echo "7. FRONTEND API CALL MAP"
echo "================================================================================"

echo "----- fetch() calls -----"

grep -RInE \
  'fetch[[:space:]]*\(' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "----- API endpoint strings -----"

grep -RInE \
  '["'\'']/api/[^"'\'']*' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "================================================================================"
echo "8. BACKEND ENTRY CANDIDATES"
echo "================================================================================"

for f in \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js
do
  if [ -f "$f" ]; then
    echo
    echo "----- $f -----"
    sed -n '1,360p' "$f"
  else
    echo
    echo "MISSING: $f"
  fi
done

echo
echo "================================================================================"
echo "9. BACKEND ROUTE FILE INVENTORY"
echo "================================================================================"

find backend/routes \
  -maxdepth 1 \
  -type f \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "10. BACKEND ROUTE MOUNT MAP"
echo "================================================================================"

echo "----- app.use() -----"

grep -RInE \
  'app\.use[[:space:]]*\(' \
  backend \
  --include='*.js' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "----- app.get/post/patch/put/delete() -----"

grep -RInE \
  'app\.(get|post|patch|put|delete)[[:space:]]*\(' \
  backend \
  --include='*.js' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "----- router.get/post/patch/put/delete() -----"

grep -RInE \
  'router\.(get|post|patch|put|delete)[[:space:]]*\(' \
  backend/routes \
  --include='*.js' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "================================================================================"
echo "11. CANONICAL BACKEND ROUTE ANALYSIS"
echo "================================================================================"

if [ -f backend/server.js ]; then
  echo "Routes directly registered by backend/server.js:"
  grep -nE \
    'app\.(get|post|patch|put|delete)[[:space:]]*\(' \
    backend/server.js \
    2>/dev/null
else
  echo "backend/server.js NOT FOUND"
fi

echo
echo "Routes mounted by backend/server.js:"
grep -nE \
  'app\.use[[:space:]]*\(' \
  backend/server.js \
  2>/dev/null || echo "No app.use() mounts found."

echo
echo "================================================================================"
echo "12. ROUTE FILE USAGE / MOUNT STATUS"
echo "================================================================================"

for f in backend/routes/*.js; do

  [ -f "$f" ] || continue

  base="$(basename "$f")"

  case "$base" in
    *.backup|*.disabled|*.bak)
      status="LEGACY/BACKUP/DISABLED"
      ;;
    *)
      status="ACTIVE-CANDIDATE"
      ;;
  esac

  echo
  echo "FILE: $f"
  echo "CLASSIFICATION: $status"

  refs=$(grep -RInF "$base" backend \
    --include='*.js' \
    --exclude="$base" \
    --exclude-dir=node_modules \
    2>/dev/null)

  if [ -n "$refs" ]; then
    echo "REFERENCED:"
    echo "$refs"
  else
    echo "NO DIRECT FILENAME REFERENCES FOUND"
  fi

done

echo
echo "================================================================================"
echo "13. RIDE CONTRACT MAP"
echo "================================================================================"

echo "----- Frontend ride-related files -----"

find frontend \
  -type f \
  \( -iname '*ride*' -o -iname '*driver*' -o -iname '*dispatch*' -o -iname '*completion*' -o -iname '*reward*' \) \
  -not -path '*/node_modules/*' \
  -print 2>/dev/null | sort

echo
echo "----- Backend ride-related files -----"

find backend \
  -type f \
  \( -iname '*ride*' -o -iname '*driver*' -o -iname '*dispatch*' -o -iname '*completion*' -o -iname '*reward*' \) \
  -not -path '*/node_modules/*' \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "14. RIDE STATE REFERENCES"
echo "================================================================================"

grep -RInE \
  'REQUESTED|MATCHING|DRIVER_ASSIGNED|ACCEPTED|ARRIVED|IN_PROGRESS|COMPLETED|REWARD_PENDING|REWARD_CLAIMED|CANCELLED' \
  frontend backend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.mjs' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "================================================================================"
echo "15. DUPLICATE / BACKUP / DISABLED FILE DETECTION"
echo "================================================================================"

find . \
  -type f \
  \( \
    -name '*.backup' \
    -o -name '*.bak' \
    -o -name '*.disabled' \
    -o -name '*backup*' \
    -o -name '*old*' \
    -o -name '*legacy*' \
    -o -name '*copy*' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "16. DUPLICATE FILENAME DETECTION"
echo "================================================================================"

find . \
  -type f \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -printf '%f\n' 2>/dev/null \
  | sort \
  | uniq -d \
  | while read -r name; do
      echo
      echo "DUPLICATE FILENAME: $name"
      find . -type f -name "$name" \
        -not -path './node_modules/*' \
        -not -path './.git/*' \
        -print 2>/dev/null
    done

echo
echo "================================================================================"
echo "17. LEGACY HTML / LAUNCHER DETECTION"
echo "================================================================================"

for f in \
  index.html \
  frontend/index.html \
  dist/index.html \
  launcher.html
do
  if [ -f "$f" ]; then
    echo
    echo "----- $f -----"
    grep -nE \
      '<script|<script[^>]*src=|type="module"|iframe|main\.jsx|app_core|fix\.js|role\.js|fare_engine|rideStateMachine|passengerRideStatus|driverLifecycleControls|completionRewardBridge' \
      "$f" 2>/dev/null
  fi
done

echo
echo "================================================================================"
echo "18. SERVICE WORKER / PWA FILES"
echo "================================================================================"

find . \
  -type f \
  \( \
    -name 'manifest.json' \
    -o -name 'sw.js' \
    -o -name 'service-worker.js' \
    -o -name '*serviceworker*' \
  \) \
  -not -path './node_modules/*' \
  -not -path './.git/*' \
  -print 2>/dev/null | sort

echo
echo "================================================================================"
echo "19. PUBLIC / STATIC ASSET STRUCTURE"
echo "================================================================================"

if [ -d public ]; then
  find public -maxdepth 3 -type f -print 2>/dev/null | sort
else
  echo "public/ NOT PRESENT"
fi

echo
echo "================================================================================"
echo "20. DIST BUILD STATUS"
echo "================================================================================"

if [ -d dist ]; then
  echo "dist/: PRESENT"
  find dist -maxdepth 3 -type f -print 2>/dev/null | sort
else
  echo "dist/: NOT PRESENT"
fi

echo
echo "================================================================================"
echo "21. NODE MODULE / BUILD TOOL STATUS"
echo "================================================================================"

if [ -d node_modules ]; then
  echo "node_modules: PRESENT"
  find node_modules -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | \
    awk '{print "Top-level package directories:", $1}'
else
  echo "node_modules: NOT PRESENT"
fi

if command -v vite >/dev/null 2>&1; then
  echo "Global Vite: PRESENT"
  vite --version 2>/dev/null
else
  echo "Global Vite: NOT FOUND"
fi

if [ -x node_modules/.bin/vite ]; then
  echo "Local Vite: PRESENT"
  node_modules/.bin/vite --version 2>/dev/null
else
  echo "Local Vite: NOT FOUND"
fi

if [ -x node_modules/.bin/esbuild ]; then
  echo "Local esbuild: PRESENT"
  node_modules/.bin/esbuild --version 2>/dev/null
else
  echo "Local esbuild: NOT FOUND"
fi

echo
echo "================================================================================"
echo "22. MISSING CORE FILE CHECK"
echo "================================================================================"

CORE_FILES="
frontend/index.html
frontend/main.jsx
frontend/App.jsx
frontend/services/api.js
frontend/services/rideService.js
frontend/services/driverService.js
frontend/services/ratingService.js
backend/server.js
backend/routes/rides.js
backend/routes/users.js
public/manifest.json
public/sw.js
"

for f in $CORE_FILES; do
  if [ -f "$f" ]; then
    echo "PRESENT: $f"
  else
    echo "MISSING: $f"
  fi
done

echo
echo "================================================================================"
echo "23. EMPTY / NULL REACT COMPONENT DETECTION"
echo "================================================================================"

grep -RInE \
  'return[[:space:]]+null[[:space:]]*;?' \
  frontend \
  --include='*.jsx' \
  --include='*.js' \
  --exclude-dir=node_modules \
  2>/dev/null | sort

echo
echo "================================================================================"
echo "24. POTENTIAL DEAD-END IMPORTS"
echo "================================================================================"

python3 - <<'PYEOF'
import os
import re

root = "frontend"

extensions = [".js", ".jsx", ".mjs"]

for dirpath, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d != "node_modules"]

    for filename in files:
        if not any(filename.endswith(ext) for ext in extensions):
            continue

        path = os.path.join(dirpath, filename)

        try:
            text = open(path, "r", encoding="utf-8", errors="ignore").read()
        except:
            continue

        patterns = re.findall(
            r'import\s+(?:.*?)?\s+from\s+[\'"](.+?)[\'"]|'
            r'import\s+[\'"](.+?)[\'"]',
            text
        )

        for pair in patterns:
            target = pair[0] or pair[1]

            if not target.startswith("."):
                continue

            base = os.path.normpath(os.path.join(dirpath, target))

            candidates = [
                base,
                base + ".js",
                base + ".jsx",
                base + ".mjs",
                os.path.join(base, "index.js"),
                os.path.join(base, "index.jsx")
            ]

            if not any(os.path.isfile(c) for c in candidates):
                print(f"POTENTIAL BROKEN IMPORT: {path} -> {target}")

PYEOF

echo
echo "================================================================================"
echo "25. FRONTEND → BACKEND CONTRACT CROSS-CHECK"
echo "================================================================================"

echo "Known frontend API references:"
grep -RohE \
  '/api/[A-Za-z0-9_./:-]+' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --exclude-dir=node_modules \
  2>/dev/null \
  | sort -u

echo
echo "Known canonical backend endpoints:"
grep -oE \
  "['\"]/api/[^'\"]+" \
  backend/server.js \
  2>/dev/null \
  | sort -u

echo
echo "================================================================================"
echo "26. GIT STATUS"
echo "================================================================================"

if [ -d .git ]; then
  git status --short 2>/dev/null
  echo
  echo "Current branch:"
  git branch --show-current 2>/dev/null
  echo
  echo "Recent commits:"
  git log --oneline -5 2>/dev/null
else
  echo "Git repository metadata not detected."
fi

echo
echo "================================================================================"
echo "27. PRELIMINARY ARCHITECTURE CLASSIFICATION"
echo "================================================================================"

echo "CANONICAL BACKEND:"
echo "backend/server.js"

echo
echo "CANONICAL REACT ENTRY CANDIDATE:"
if [ -f frontend/index.html ] && [ -f frontend/main.jsx ] && [ -f frontend/App.jsx ]; then
  echo "frontend/index.html -> frontend/main.jsx -> frontend/App.jsx"
else
  echo "INCOMPLETE"
fi

echo
echo "KNOWN FRONTEND DEAD-END:"
if grep -qE 'return[[:space:]]+null' frontend/components/LegacyCabLink.jsx 2>/dev/null; then
  echo "frontend/components/LegacyCabLink.jsx returns null"
  echo "STATUS: DEAD-END SHELL"
else
  echo "No direct return-null dead-end detected in LegacyCabLink.jsx"
fi

echo
echo "BACKEND MODULAR CANDIDATE:"
if [ -f backend/server/app.js ] && [ -f backend/server/index.js ]; then
  echo "PRESENT — NOT CANONICAL UNTIL VERIFIED"
else
  echo "INCOMPLETE / NOT PRESENT"
fi

echo
echo "================================================================================"
echo "28. SAFE REORGANISATION CANDIDATES"
echo "================================================================================"

echo "The following categories require review before Block 12:"
echo
echo "A. Files in frontend/js that may belong under frontend/services/"
echo "B. Files in frontend/js/driver that may belong under frontend/services/driver/"
echo "C. Files in frontend/js/rides that may belong under frontend/services/ride/"
echo "D. Backend route files not mounted by backend/server.js"
echo "E. Backup and disabled route files"
echo "F. Duplicate HTML entry points"
echo "G. Legacy launcher files"
echo "H. Duplicate backend implementations"
echo "I. Missing canonical frontend service layer"
echo "J. React components that are disconnected from App.jsx"

echo
echo "================================================================================"
echo "29. BLOCK 11 VERDICT"
echo "================================================================================"

echo "READ-ONLY ARCHITECTURE MAP: COMPLETE"
echo "SOURCE FILES MODIFIED: NO"
echo "SOURCE FILES MOVED: NO"
echo "SOURCE FILES DELETED: NO"
echo
echo "REPORT:"
echo "$REPORT"

echo
echo "NEXT REQUIRED STEP:"
echo "Review this report before executing any structural move."
echo "Block 12 should perform SAFE STRUCTURAL REORGANISATION only after"
echo "the canonical frontend and backend dependency paths are confirmed."

echo
echo "================================================================================"
echo "BLOCK 11 COMPLETE"
echo "================================================================================"

