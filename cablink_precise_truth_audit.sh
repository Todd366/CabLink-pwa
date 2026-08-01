#!/usr/bin/env bash
set -u

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="CABLINK_PRECISE_TRUTH_AUDIT_${STAMP}.txt"

exec > >(tee "$REPORT") 2>&1

PASS=0
FAIL=0
WARN=0

pass(){ echo "✅ PASS: $1"; PASS=$((PASS+1)); }
fail(){ echo "❌ FAIL: $1"; FAIL=$((FAIL+1)); }
warn(){ echo "⚠️ WARN: $1"; WARN=$((WARN+1)); }
section(){
  echo
  echo "======================================================================"
  echo "$1"
  echo "======================================================================"
}

echo "======================================================================"
echo "CABLINK — PRECISE SOURCE → RUNTIME → FIRESTORE TRUTH AUDIT"
echo "======================================================================"
echo "TIME   : $(date -Iseconds)"
echo "REPORT : $REPORT"
echo "MODE   : READ-ONLY"
echo "ACTION : NO FILE MODIFICATIONS"
echo "ACTION : NO COMMIT"
echo "ACTION : NO PUSH"
echo "ACTION : NO DEPLOYMENT"
echo "======================================================================"

# ================================================================
# 1. GIT TRUTH
# ================================================================

section "1. GIT TRUTH"

BRANCH="$(git branch --show-current 2>/dev/null || true)"
LOCAL_SHA="$(git rev-parse HEAD 2>/dev/null || true)"
REMOTE_SHA="$(git rev-parse origin/main 2>/dev/null || true)"

echo "BRANCH       : $BRANCH"
echo "LOCAL HEAD   : $LOCAL_SHA"
echo "ORIGIN/MAIN  : $REMOTE_SHA"

if [ -n "$LOCAL_SHA" ] && [ -n "$REMOTE_SHA" ]; then
  if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
    pass "Local HEAD equals origin/main"
  else
    warn "Local HEAD differs from origin/main"
  fi
else
  warn "Could not resolve local or remote Git SHA"
fi

echo
echo "--- WORKING TREE ---"
git status --short

echo
echo "--- LAST 10 COMMITS ---"
git log --oneline -10

# ================================================================
# 2. VERCEL DEPLOYMENT ENTRYPOINT
# ================================================================

section "2. VERCEL DEPLOYMENT ENTRYPOINT"

echo "--- vercel.json ---"
cat vercel.json

echo
echo "--- Vercel build targets ---"

python3 - <<'PY'
import json

try:
    v=json.load(open("vercel.json"))
except Exception as e:
    print("ERROR:",e)
    raise SystemExit

for i,b in enumerate(v.get("builds",[]),1):
    print(f"BUILD {i}")
    print("  src :",b.get("src"))
    print("  use :",b.get("use"))

print()
print("ROUTES")

for i,r in enumerate(v.get("routes",[]),1):
    print(f"ROUTE {i}")
    print("  src  :",r.get("src"))
    print("  dest :",r.get("dest"))
PY

if grep -q '"src": "api/index.js"' vercel.json; then
  pass "Vercel explicitly deploys api/index.js"
else
  fail "Vercel does not explicitly deploy api/index.js"
fi

if grep -q '"dest": "/api/index.js"' vercel.json; then
  pass "Vercel API traffic routes to api/index.js"
else
  fail "Vercel API traffic does not route to api/index.js"
fi

# ================================================================
# 3. API ENTRYPOINT ROUTE INVENTORY
# ================================================================

section "3. API ENTRYPOINT ROUTE INVENTORY"

echo "--- api/index.js ---"

grep -nEi \
'^(app|router)\.(get|post|put|patch|delete)|app\.(get|post|put|patch|delete)' \
api/index.js 2>/dev/null || true

echo
echo "--- api/index.js imports ---"

grep -nEi \
'require\(|from ' \
api/index.js 2>/dev/null | head -n 150 || true

echo
echo "--- api/index.js ride references ---"

grep -nEi \
'ride|repository|firestore|firebase|database|adapter|canonical|engine|orchestrator|completion|economy|reward' \
api/index.js 2>/dev/null | head -n 300 || true

# ================================================================
# 4. FULL BACKEND ENTRYPOINT
# ================================================================

section "4. FULL BACKEND ENTRYPOINT"

echo "--- backend/server.js ---"
sed -n '1,220p' backend/server.js 2>/dev/null || true

echo
echo "--- backend/server/app.js imports ---"
sed -n '1,180p' backend/server/app.js 2>/dev/null || true

echo
echo "--- backend/server/app.js route mounting ---"

grep -nEi \
'use\(|app\.(get|post|put|patch|delete)' \
backend/server/app.js 2>/dev/null | head -n 300 || true

# ================================================================
# 5. RIDE ROUTE AUTHORITY
# ================================================================

section "5. RIDE ROUTE AUTHORITY"

echo "--- backend/routes/rides.js ---"
sed -n '1,330p' backend/routes/rides.js 2>/dev/null || true

echo
echo "--- backend/ride_api_patch.js ---"
sed -n '1,180p' backend/ride_api_patch.js 2>/dev/null || true

echo
echo "--- all /api/rides registrations ---"

grep -RInE \
'(/api/rides|router\.(get|post|patch|put|delete)\(["'\'']/?(:id|/)?|app\.(get|post|patch|put|delete)\(["'\'']/api/rides)' \
api backend \
--include='*.js' \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
2>/dev/null | head -n 500 || true

# ================================================================
# 6. CANONICAL RIDE ENGINE
# ================================================================

section "6. CANONICAL RIDE ENGINE"

for F in \
  backend/canonical/ride_engine.js \
  backend/canonical/ride_repository.js \
  backend/canonical/ride_repository_firestore_test.js
do
  echo
  echo "######################################################################"
  echo "FILE: $F"
  echo "######################################################################"

  if [ -f "$F" ]; then
    sed -n '1,500p' "$F"
  else
    echo "MISSING"
  fi
done

# ================================================================
# 7. DATABASE / FIRESTORE CHAIN
# ================================================================

section "7. DATABASE / FIRESTORE CHAIN"

for F in \
  backend/production/database_adapter.js \
  backend/firebase/firestore_adapter.js \
  backend/storage/database.js \
  backend/storage/cablink_db.json \
  backend/database/ride_repository.js
do
  echo
  echo "######################################################################"
  echo "FILE: $F"
  echo "######################################################################"

  if [ -f "$F" ]; then
    if [[ "$F" == *.json ]]; then
      cat "$F"
    else
      sed -n '1,500p' "$F"
    fi
  else
    echo "MISSING"
  fi
done

echo
echo "--- FIREBASE / FIRESTORE REFERENCES ---"

grep -RInEi \
'firebase|firestore|Firestore|admin\.firestore|collection\(|doc\(|set\(|add\(|update\(|get\(' \
backend api \
--include='*.js' \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
2>/dev/null | head -n 500 || true

# ================================================================
# 8. PACKAGE DEPENDENCIES
# ================================================================

section "8. PACKAGE DEPENDENCIES"

echo "--- package.json ---"
cat package.json

echo
echo "--- Firebase packages ---"

npm ls firebase firebase-admin @google-cloud/firestore 2>/dev/null || true

# ================================================================
# 9. ENVIRONMENT / CREDENTIAL READINESS
# ================================================================

section "9. FIRESTORE ENVIRONMENT READINESS"

echo "Environment variable NAMES ONLY — VALUES NEVER PRINTED"

for VAR in \
  FIREBASE_PROJECT_ID \
  FIREBASE_CLIENT_EMAIL \
  FIREBASE_PRIVATE_KEY \
  GOOGLE_APPLICATION_CREDENTIALS \
  FIREBASE_CONFIG
do
  if [ -n "${!VAR:-}" ]; then
    echo "SET    : $VAR"
  else
    echo "UNSET  : $VAR"
  fi
done

echo
echo "--- Local environment files ---"

find . \
  -maxdepth 3 \
  -type f \
  \( -name '.env' -o -name '.env.*' \) \
  -not -path './node_modules/*' \
  -print 2>/dev/null

# ================================================================
# 10. CANONICAL REPOSITORY IMPORT GRAPH
# ================================================================

section "10. CANONICAL REPOSITORY IMPORT GRAPH"

echo "--- Files importing canonical ride_repository.js ---"

grep -RIn \
'canonical/ride_repository' \
. \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=.git \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
2>/dev/null || true

echo
echo "--- Files importing ride_repository_firestore_test.js ---"

grep -RIn \
'ride_repository_firestore_test' \
. \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=.git \
2>/dev/null || true

# ================================================================
# 11. PRODUCTION DATABASE ADAPTER IMPORT GRAPH
# ================================================================

section "11. PRODUCTION DATABASE ADAPTER IMPORT GRAPH"

grep -RIn \
'production/database_adapter' \
. \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=.git \
2>/dev/null || true

echo
echo "--- database adapter references ---"

grep -RInEi \
'database_adapter|firestore_adapter|FirestoreAdapter|DatabaseAdapter' \
api backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.backup*' \
--exclude='*.before-*' \
--exclude='*.pre_*' \
2>/dev/null | head -n 500 || true

# ================================================================
# 12. FRONTEND API TARGETS
# ================================================================

section "12. FRONTEND → API TARGETS"

grep -RInEi \
'fetch\(|axios|/api/|cablinkAPI|rideService|rideController|rideStateMachine' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null | head -n 600 || true

# ================================================================
# 13. LIVE DEPLOYMENT IDENTITY
# ================================================================

section "13. LIVE DEPLOYMENT IDENTITY"

BASE="https://cab-link-pwa.vercel.app"

echo "BASE: $BASE"

echo
echo "--- Root ---"
curl -sS -L --max-time 20 -D /tmp/cab_headers "$BASE/" \
  -o /tmp/cab_root 2>/dev/null || true

head -n 30 /tmp/cab_headers 2>/dev/null || true

echo
echo "Root size:"
wc -c /tmp/cab_root 2>/dev/null || true

echo
echo "--- API health ---"
curl -sS -L --max-time 20 \
  -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/health" 2>/dev/null || true

echo
echo "--- Canonical Firestore lifecycle route ---"
curl -sS -L --max-time 30 \
  -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/canonical-firestore-lifecycle" 2>/dev/null || true

# ================================================================
# 14. LIVE API ROUTE TESTS
# ================================================================

section "14. LIVE API ROUTE TESTS"

for PATH in \
  "/api/health" \
  "/api/rides" \
  "/api/drivers/online" \
  "/api/canonical-firestore-lifecycle"
do
  echo
  echo "GET $PATH"

  curl -sS -L \
    --max-time 20 \
    -o /tmp/cab_live_body \
    -w "HTTP=%{http_code} SIZE=%{size_download}\n" \
    "$BASE$PATH" 2>/dev/null || true

  head -c 1000 /tmp/cab_live_body 2>/dev/null || true
  echo
done

# ================================================================
# 15. LOCAL API VS LIVE API HASH
# ================================================================

section "15. LOCAL SOURCE VS LIVE RESPONSE FINGERPRINT"

echo "--- Local api/index.js SHA256 ---"
sha256sum api/index.js

echo
echo "--- Local vercel.json SHA256 ---"
sha256sum vercel.json

echo
echo "--- Local source file modification times ---"

stat -c '%y %n' \
  api/index.js \
  vercel.json \
  backend/server/app.js \
  backend/canonical/ride_repository.js \
  backend/production/database_adapter.js \
  backend/firebase/firestore_adapter.js \
  2>/dev/null || true

# ================================================================
# 16. VERCEL PROJECT METADATA
# ================================================================

section "16. VERCEL PROJECT METADATA"

if [ -f ".vercel/project.json" ]; then
  cat .vercel/project.json
else
  warn ".vercel/project.json missing"
fi

echo
echo "--- Vercel CLI ---"
vercel --version 2>/dev/null || true

# ================================================================
# 17. LOCAL NODE LOAD TEST
# ================================================================

section "17. LOCAL NODE MODULE LOAD TEST"

node - <<'NODE'
const tests = [
  ["api/index.js", "./api/index.js"],
  ["backend/server/app.js", "./backend/server/app.js"],
  ["canonical ride repository", "./backend/canonical/ride_repository.js"],
  ["canonical Firestore test repository", "./backend/canonical/ride_repository_firestore_test.js"],
  ["production database adapter", "./backend/production/database_adapter.js"],
  ["Firestore adapter", "./backend/firebase/firestore_adapter.js"]
];

for (const [name, path] of tests) {
  try {
    const mod = require(path);
    console.log(`PASS LOAD: ${name}`);
    console.log(`  TYPE: ${typeof mod}`);
    if (mod && typeof mod === "object") {
      console.log(`  EXPORTS: ${Object.keys(mod).join(", ")}`);
    }
  } catch (e) {
    console.log(`FAIL LOAD: ${name}`);
    console.log(`  ERROR: ${e.message}`);
  }
}
NODE

# ================================================================
# 18. RUNTIME DEPENDENCY CLASSIFICATION
# ================================================================

section "18. RUNTIME DEPENDENCY CLASSIFICATION"

python3 - <<'PY'
from pathlib import Path
import re

targets = {
    "VERCEL_ENTRYPOINT": Path("api/index.js"),
    "FULL_BACKEND_ENTRYPOINT": Path("backend/server/app.js"),
    "CANONICAL_REPOSITORY": Path("backend/canonical/ride_repository.js"),
    "FIRESTORE_TEST_REPOSITORY": Path("backend/canonical/ride_repository_firestore_test.js"),
    "DATABASE_ADAPTER": Path("backend/production/database_adapter.js"),
    "FIRESTORE_ADAPTER": Path("backend/firebase/firestore_adapter.js"),
}

for name,p in targets.items():
    print()
    print("="*70)
    print(name, ":", p)
    print("="*70)

    if not p.exists():
        print("MISSING")
        continue

    text=p.read_text(errors="ignore")

    requires=re.findall(
        r'''require\(\s*["']([^"']+)["']\s*\)''',
        text
    )

    print("REQUIRES:")
    for r in requires:
        print("  ",r)

    print()
    print("FIRESTORE REFERENCES:",
          "YES" if re.search(r'firestore|Firestore|firebase|Firebase',text) else "NO")

    print("RIDE REFERENCES:",
          "YES" if re.search(r'ride|Ride',text) else "NO")

    print("DATABASE REFERENCES:",
          "YES" if re.search(r'database|Database|adapter|Adapter',text) else "NO")
PY

# ================================================================
# 19. SOURCE-TO-RUNTIME VERDICT
# ================================================================

section "19. SOURCE → RUNTIME VERDICT"

echo "The following questions are answered from the evidence above:"
echo
echo "Q1. What does Vercel deploy?"
echo "    api/index.js"
echo
echo "Q2. Does api/index.js expose /api/rides?"
echo "    Determined from route inventory above."
echo
echo "Q3. Does api/index.js import backend/server/app.js?"
echo "    Determined from import graph above."
echo
echo "Q4. Does the full backend expose /api/rides?"
echo "    Determined from backend/server/app.js and routes/rides.js."
echo
echo "Q5. Does the canonical repository use Firestore?"
echo "    Determined from canonical repository source."
echo
echo "Q6. Does production database_adapter use Firestore?"
echo "    Determined from adapter source."
echo
echo "Q7. Is the canonical repository reachable from the Vercel entrypoint?"
echo "    Determined from import chain."
echo
echo "Q8. Is the live deployment serving the current local api/index.js?"
echo "    Must be confirmed by deployment identity and route behavior."
echo
echo "Q9. Does the live API expose /api/rides?"
echo "    Determined by live HTTP test."
echo
echo "Q10. Does the live canonical Firestore lifecycle endpoint execute?"
echo "     Determined by live HTTP test."

# ================================================================
# 20. FINAL SUMMARY
# ================================================================

section "20. FINAL SUMMARY"

echo "PASS : $PASS"
echo "FAIL : $FAIL"
echo "WARN : $WARN"

echo
echo "======================================================================"
echo "IMPORTANT — THIS AUDIT DID NOT:"
echo "======================================================================"
echo "• Modify source files"
echo "• Modify configuration"
echo "• Commit changes"
echo "• Push to GitHub"
echo "• Deploy to Vercel"
echo "• Create or mutate rides"
echo "• Write to Firestore"
echo
echo "The only output created is this audit report:"
echo "$REPORT"
echo "======================================================================"

