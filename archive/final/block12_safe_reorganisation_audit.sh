#!/data/data/com.termux/files/usr/bin/bash

set -u

ROOT="$HOME/CabLink-pwa"
cd "$ROOT" || exit 1

REPORT="$ROOT/block12_safe_reorganisation_audit.txt"

exec > >(tee "$REPORT") 2>&1

echo "================================================================================"
echo "CABLINK BLOCK 12 — SAFE REORGANISATION + DEPENDENCY AUDIT"
echo "================================================================================"
echo "Repository: $ROOT"
date
echo
echo "MODE: READ-ONLY"
echo
echo "This block DOES NOT:"
echo "- modify application source files"
echo "- move application files"
echo "- delete application files"
echo "- rewrite imports"
echo "- create replacement application files"
echo
echo "Purpose:"
echo "1. Separate live source from archives/backups/build artifacts"
echo "2. Identify the canonical React entry chain"
echo "3. Identify the canonical backend"
echo "4. Map frontend imports"
echo "5. Map backend imports"
echo "6. Detect live-source duplicate basenames only"
echo "7. Detect legacy HTML/launcher references"
echo "8. Identify missing canonical frontend services"
echo "9. Identify potentially disconnected React components"
echo "10. Produce safe candidates for Block 13"
echo

================================================================================
1. ENVIRONMENT
================================================================================

echo "================================================================================"
echo "1. ENVIRONMENT"
echo "================================================================================"

echo "Node:"
node --version 2>/dev/null || true

echo "NPM:"
npm --version 2>/dev/null || true

echo "PWD:"
pwd

echo

================================================================================
2. LIVE SOURCE SCOPE
================================================================================

echo "================================================================================"
echo "2. LIVE SOURCE SCOPE"
echo "================================================================================"

echo "Excluded from live duplicate analysis:"
echo "  archive/"
echo "  migration_backup/"
echo "  node_modules/"
echo "  dist/"
echo "  .git/"
echo "  .vercel/"
echo

echo "Top-level structure:"
find . -maxdepth 2 \
  -not -path './.git*' \
  -not -path './node_modules*' \
  -not -path './archive*' \
  -not -path './migration_backup*' \
  -not -path './dist*' \
  -not -path './.vercel*' \
  -print | sort

echo

================================================================================
3. CANONICAL ENTRY CHAIN
================================================================================

echo "================================================================================"
echo "3. CANONICAL ENTRY CHAIN"
echo "================================================================================"

for f in \
  frontend/index.html \
  frontend/main.jsx \
  frontend/App.jsx \
  frontend/components/LegacyCabLink.jsx \
  backend/server.js \
  backend/server/app.js \
  backend/server/index.js
do
  if [ -f "$f" ]; then
    echo "PRESENT: $f"
  else
    echo "MISSING: $f"
  fi
done

echo

echo "----- frontend/index.html ENTRY REFERENCES -----"
grep -nE \
  'main\.jsx|App\.jsx|script|iframe|index-C|frontend/' \
  frontend/index.html 2>/dev/null || true

echo

echo "----- frontend/main.jsx -----"
sed -n '1,240p' frontend/main.jsx 2>/dev/null || true

echo

echo "----- frontend/App.jsx -----"
sed -n '1,320p' frontend/App.jsx 2>/dev/null || true

echo

echo "----- LegacyCabLink.jsx -----"
sed -n '1,160p' frontend/components/LegacyCabLink.jsx 2>/dev/null || true

echo

================================================================================
4. CANONICAL BACKEND
================================================================================

echo "================================================================================"
echo "4. CANONICAL BACKEND"
echo "================================================================================"

echo "----- backend/server.js HEAD -----"
sed -n '1,260p' backend/server.js 2>/dev/null || true

echo

echo "----- backend/server/app.js HEAD -----"
sed -n '1,260p' backend/server/app.js 2>/dev/null || true

echo

echo "----- backend/server/index.js HEAD -----"
sed -n '1,260p' backend/server/index.js 2>/dev/null || true

echo

================================================================================
5. LIVE SOURCE FILE INVENTORY
================================================================================

echo "================================================================================"
echo "5. LIVE SOURCE FILE INVENTORY"
echo "================================================================================"

find . \
  -type f \
  \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.html' -o -name '*.css' \) \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './archive/*' \
  -not -path './migration_backup/*' \
  -not -path './dist/*' \
  -not -path './.vercel/*' \
  | sort > "$ROOT/block12_live_source_inventory.txt"

echo "Inventory:"
cat "$ROOT/block12_live_source_inventory.txt"

echo

================================================================================
6. LIVE DUPLICATE BASENAME ANALYSIS
================================================================================

echo "================================================================================"
echo "6. LIVE DUPLICATE BASENAME ANALYSIS"
echo "================================================================================"

python3 <<'PYEOF'
import os
from collections import defaultdict

ROOT = os.getcwd()

EXCLUDED = {
    ".git",
    "node_modules",
    "archive",
    "migration_backup",
    "dist",
    ".vercel",
}

EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".html",
    ".css",
}

groups = defaultdict(list)

for base, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in EXCLUDED]

    for name in files:
        path = os.path.join(base, name)
        ext = os.path.splitext(name)[1]

        if ext not in EXTENSIONS:
            continue

        rel = os.path.relpath(path, ROOT)

        if any(part in EXCLUDED for part in rel.split(os.sep)):
            continue

        groups[name].append(rel)

duplicates = {
    name: paths
    for name, paths in groups.items()
    if len(paths) > 1
}

if not duplicates:
    print("NO LIVE-SOURCE DUPLICATE BASENAMES FOUND")
else:
    for name in sorted(duplicates):
        print(f"\nLIVE DUPLICATE BASENAME: {name}")
        for path in sorted(duplicates[name]):
            print(f"  {path}")

print("\nTOTAL LIVE DUPLICATE BASENAME GROUPS:", len(duplicates))
PYEOF

echo

================================================================================
7. FRONTEND IMPORT MAP
================================================================================

echo "================================================================================"
echo "7. FRONTEND IMPORT MAP"
echo "================================================================================"

echo "----- ALL FRONTEND IMPORTS / REQUIRES -----"

grep -RInE \
  '(^|[^A-Za-z])(import[[:space:]]|export[[:space:]].*from[[:space:]]|require\()[^;]*' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null \
  | grep -v '/archive/' \
  | grep -v '/migration_backup/' \
  || true

echo

================================================================================
8. BACKEND IMPORT MAP
================================================================================

echo "================================================================================"
echo "8. BACKEND IMPORT MAP"
echo "================================================================================"

echo "----- ALL BACKEND IMPORTS / REQUIRES -----"

grep -RInE \
  '(^|[^A-Za-z])(require\(|import[[:space:]]|export[[:space:]].*from[[:space:]])' \
  backend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null \
  || true

echo

================================================================================
9. FRONTEND SERVICE LAYER CHECK
================================================================================

echo "================================================================================"
echo "9. FRONTEND SERVICE LAYER CHECK"
echo "================================================================================"

for f in \
  frontend/services/api.js \
  frontend/services/rideService.js \
  frontend/services/driverService.js \
  frontend/services/ratingService.js
do
  if [ -f "$f" ]; then
    echo "PRESENT: $f"
  else
    echo "MISSING: $f"
  fi
done

echo

echo "Existing frontend services:"
find frontend/services -maxdepth 3 -type f 2>/dev/null | sort || true

echo

================================================================================
10. API CONTRACT REFERENCES
================================================================================

echo "================================================================================"
echo "10. API CONTRACT REFERENCES"
echo "================================================================================"

echo "----- FRONTEND API REFERENCES -----"

grep -RhoE \
  '["'"'"'`]/api/[A-Za-z0-9_./:${}-]+' \
  frontend \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.ts' \
  --include='*.tsx' \
  2>/dev/null \
  | sed -E 's/^["'"'"'`]//' \
  | sort -u \
  || true

echo

echo "----- BACKEND ROUTE DEFINITIONS -----"

grep -RInE \
  'app\.(get|post|put|patch|delete)|router\.(get|post|put|patch|delete)|app\.use' \
  backend \
  --include='*.js' \
  2>/dev/null \
  | sort \
  || true

echo

================================================================================
11. LEGACY HTML / LAUNCHER ANALYSIS
================================================================================

echo "================================================================================"
echo "11. LEGACY HTML / LAUNCHER ANALYSIS"
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
      '<script|iframe|main\.jsx|App\.jsx|frontend/js|fix\.js|role\.js|fare_engine|rideStateMachine|passengerRideStatus|driverLifecycleControls|completionRewardBridge' \
      "$f" 2>/dev/null || true
  fi
done

echo

================================================================================
12. REACT COMPONENT CONNECTION ANALYSIS
================================================================================

echo "================================================================================"
echo "12. REACT COMPONENT CONNECTION ANALYSIS"
echo "================================================================================"

echo "React components:"
find frontend/components \
  -type f \
  \( -name '*.jsx' -o -name '*.js' \) \
  2>/dev/null \
  | sort || true

echo

echo "React component references from App.jsx:"
grep -nE \
  'from[[:space:]]+["'"'"']|import[[:space:]]' \
  frontend/App.jsx \
  2>/dev/null || true

echo

echo "Potential null/dead components:"
grep -RInE \
  'return[[:space:]]+null[[:space:]]*;' \
  frontend \
  --include='*.jsx' \
  --include='*.js' \
  2>/dev/null \
  | grep -v '/archive/' \
  | grep -v '/migration_backup/' \
  || true

echo

================================================================================
13. FRONTEND JS CLASSIFICATION
================================================================================

echo "================================================================================"
echo "13. FRONTEND JS CLASSIFICATION"
echo "================================================================================"

echo "frontend/js:"
find frontend/js \
  -type f \
  2>/dev/null \
  | sort || true

echo

echo "Potential service candidates:"
find frontend/js \
  -type f \
  \( \
    -iname '*service*.js' \
    -o -iname '*api*.js' \
    -o -iname '*repository*.js' \
    -o -iname '*engine*.js' \
    -o -iname '*manager*.js' \
    -o -iname '*adapter*.js' \
  \) \
  2>/dev/null \
  | sort || true

echo

================================================================================
14. BACKEND ROUTE MOUNT ANALYSIS
================================================================================

echo "================================================================================"
echo "14. BACKEND ROUTE MOUNT ANALYSIS"
echo "================================================================================"

echo "Route files:"
find backend/routes \
  -type f \
  2>/dev/null \
  | sort || true

echo

echo "Route references in canonical backend:"
grep -nE \
  'require\(.*routes|require\(.*route|from[[:space:]]+["'"'"'].*routes|app\.use|router' \
  backend/server.js \
  2>/dev/null || true

echo

echo "Potentially unmounted route files:"
python3 <<'PYEOF'
import os
import re

root = os.getcwd()
server = os.path.join(root, "backend", "server.js")

try:
    text = open(server, "r", encoding="utf-8", errors="ignore").read()
except:
    text = ""

routes_dir = os.path.join(root, "backend", "routes")

if not os.path.isdir(routes_dir):
    print("backend/routes directory not found")
else:
    for name in sorted(os.listdir(routes_dir)):
        if not name.endswith(".js"):
            continue

        if name.endswith(".disabled") or ".backup" in name:
            continue

        stem = os.path.splitext(name)[0]

        if stem in text or name in text:
            print("REFERENCED/LIKELY MOUNTED:", name)
        else:
            print("UNREFERENCED CANDIDATE:", name)
PYEOF

echo

================================================================================
15. BACKUP / DISABLED FILES IN LIVE TREE
================================================================================

echo "================================================================================"
echo "15. BACKUP / DISABLED FILES IN LIVE TREE"
echo "================================================================================"

find . \
  -type f \
  \( \
    -iname '*.backup*' \
    -o -iname '*.bak' \
    -o -iname '*.disabled' \
    -o -iname '*_old.*' \
    -o -iname '*_legacy.*' \
  \) \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './archive/*' \
  -not -path './migration_backup/*' \
  -not -path './dist/*' \
  -not -path './.vercel/*' \
  | sort || true

echo

================================================================================
16. BUILD CONFIGURATION
================================================================================

echo "================================================================================"
echo "16. BUILD CONFIGURATION"
echo "================================================================================"

echo "----- package.json -----"
cat package.json 2>/dev/null || true

echo

echo "----- vite.config.js -----"
cat vite.config.js 2>/dev/null || true

echo

echo "----- vercel.json -----"
cat vercel.json 2>/dev/null || true

echo

================================================================================
17. CURRENT GIT STATUS
================================================================================

echo "================================================================================"
echo "17. CURRENT GIT STATUS"
echo "================================================================================"

git status --short 2>/dev/null || true

echo

================================================================================
18. SAFE REORGANISATION DECISION MATRIX
================================================================================

echo "================================================================================"
echo "18. SAFE REORGANISATION DECISION MATRIX"
echo "================================================================================"

echo
echo "[KEEP CANONICAL]"
echo "backend/server.js"
echo "frontend/index.html"
echo "frontend/main.jsx"
echo "frontend/App.jsx"
echo
echo "[DO NOT MOVE YET]"
echo "Any file imported by the canonical React entry chain"
echo "Any file required by backend/server.js"
echo "Any route confirmed mounted by backend/server.js"
echo "Any data file actively used by the canonical backend"
echo
echo "[ARCHIVE / QUARANTINE CANDIDATES — REVIEW FIRST]"
echo "Root legacy index.html"
echo "launcher.html"
echo "Root role.js"
echo "Root fix.js"
echo "Root fare_engine.js"
echo "Backup files in active directories"
echo "Disabled route files"
echo
echo "[EXCLUDE FROM DUPLICATE CLEANUP]"
echo "archive/"
echo "migration_backup/"
echo "node_modules/"
echo "dist/"
echo ".git/"
echo ".vercel/"
echo
echo "[MISSING CANONICAL FRONTEND LAYER]"
echo "frontend/services/api.js"
echo "frontend/services/rideService.js"
echo "frontend/services/driverService.js"
echo "frontend/services/ratingService.js"
echo

================================================================================
19. BLOCK 12 VERDICT
================================================================================

echo "================================================================================"
echo "19. BLOCK 12 VERDICT"
echo "================================================================================"

echo
echo "SAFE REORGANISATION AUDIT: COMPLETE"
echo
echo "SOURCE FILES MODIFIED: NO"
echo "SOURCE FILES MOVED: NO"
echo "SOURCE FILES DELETED: NO"
echo
echo "NEXT STEP:"
echo "BLOCK 13 — CANONICAL STRUCTURAL REORGANISATION"
echo
echo "BLOCK 13 MUST:"
echo "1. Create a preservation snapshot"
echo "2. Use the dependency map from this audit"
echo "3. Move only proven misplaced files"
echo "4. Keep backend/server.js canonical"
echo "5. Keep React entry chain canonical"
echo "6. Move legacy launchers out of active runtime paths"
echo "7. Consolidate only confirmed duplicate implementations"
echo "8. Preserve all archives"
echo "9. Rebuild frontend"
echo "10. Run backend runtime verification"
echo "11. Run frontend/backend integration verification"
echo "12. Stop immediately if the build or runtime regresses"
echo

echo "================================================================================"
echo "BLOCK 12 COMPLETE"
echo "================================================================================"

echo
echo "REPORT:"
echo "$REPORT"

