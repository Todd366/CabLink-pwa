#!/usr/bin/env bash
set -u

BASE="${1:-https://cab-link-pwa.vercel.app}"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="CABLINK_SOURCE_TO_RUNTIME_TRUTH_${STAMP}.txt"

exec > >(tee "$OUT") 2>&1

PASS=0
FAIL=0
WARN=0

section() {
  echo
  echo "######################################################################"
  echo "# $1"
  echo "######################################################################"
}

pass() {
  echo "✅ PASS: $1"
  PASS=$((PASS+1))
}

fail() {
  echo "❌ FAIL: $1"
  FAIL=$((FAIL+1))
}

warn() {
  echo "⚠️ WARN: $1"
  WARN=$((WARN+1))
}

echo "======================================================================"
echo "CABLINK — SOURCE → GITHUB → VERCEL → RUNTIME TRUTH AUDIT"
echo "======================================================================"
echo "BASE URL : $BASE"
echo "TIME     : $(date -Iseconds)"
echo "OUTPUT   : $OUT"
echo "MODE     : STRICT READ-ONLY"
echo
echo "NO FILES WILL BE MODIFIED"
echo "NO GIT COMMIT"
echo "NO GIT PUSH"
echo "NO VERCEL DEPLOY"
echo "NO API WRITE REQUESTS"
echo "======================================================================"

# ######################################################################
# 1. ENVIRONMENT
# ######################################################################

section "1. ENVIRONMENT"

echo "PWD:"
pwd

echo
echo "NODE:"
node --version 2>/dev/null || true

echo
echo "NPM:"
npm --version 2>/dev/null || true

echo
echo "GIT:"
git --version 2>/dev/null || true

echo
echo "VERCEL:"
vercel --version 2>/dev/null || true

# ######################################################################
# 2. LOCAL GIT IDENTITY
# ######################################################################

section "2. LOCAL GIT IDENTITY"

LOCAL_BRANCH="$(git branch --show-current 2>/dev/null || true)"
LOCAL_SHA="$(git rev-parse HEAD 2>/dev/null || true)"
LOCAL_SHORT="$(git rev-parse --short HEAD 2>/dev/null || true)"

echo "Branch : $LOCAL_BRANCH"
echo "HEAD   : $LOCAL_SHA"
echo "Short  : $LOCAL_SHORT"

echo
echo "Latest commit:"
git log -1 --format=fuller 2>/dev/null || true

if [ -n "$LOCAL_SHA" ]; then
  pass "Local Git HEAD identified"
else
  fail "Unable to identify local Git HEAD"
fi

# ######################################################################
# 3. WORKTREE STATE
# ######################################################################

section "3. LOCAL WORKTREE STATE"

MODIFIED="$(git status --short 2>/dev/null || true)"

if [ -z "$MODIFIED" ]; then
  pass "Working tree is clean"
else
  warn "Working tree contains uncommitted or untracked changes"

  echo
  echo "--- WORKTREE CHANGES ---"
  printf '%s\n' "$MODIFIED"

  echo
  echo "--- MODIFIED FILE COUNT ---"
  git status --short | grep '^ M\|^M ' | wc -l

  echo
  echo "--- UNTRACKED FILE COUNT ---"
  git status --short | grep '^??' | wc -l
fi

# ######################################################################
# 4. REMOTE
# ######################################################################

section "4. GITHUB REMOTE"

git remote -v 2>/dev/null || true

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"

echo
echo "Origin URL:"
echo "$ORIGIN_URL"

if [ -n "$ORIGIN_URL" ]; then
  pass "GitHub origin configured"
else
  fail "GitHub origin missing"
fi

# ######################################################################
# 5. FETCH REMOTE METADATA ONLY
# ######################################################################

section "5. GITHUB ORIGIN/MAIN TRUTH"

echo "Fetching remote metadata only..."
git fetch origin --quiet 2>/dev/null || warn "git fetch failed"

REMOTE_SHA="$(git rev-parse origin/main 2>/dev/null || true)"
REMOTE_SHORT="$(git rev-parse --short origin/main 2>/dev/null || true)"

echo
echo "LOCAL HEAD : $LOCAL_SHA"
echo "ORIGIN/MAIN: $REMOTE_SHA"

if [ -n "$REMOTE_SHA" ]; then
  pass "origin/main is available"
else
  fail "origin/main unavailable"
fi

if [ -n "$REMOTE_SHA" ] && [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
  pass "Local HEAD exactly matches origin/main"
else
  warn "Local HEAD does NOT exactly match origin/main"
fi

echo
echo "--- COMMITS LOCAL ONLY ---"

git log --oneline "origin/main..HEAD" 2>/dev/null || true

echo
echo "--- COMMITS REMOTE ONLY ---"

git log --oneline "HEAD..origin/main" 2>/dev/null || true

echo
echo "--- DIVERGENCE SUMMARY ---"

git rev-list --left-right --count HEAD...origin/main 2>/dev/null || true

# ######################################################################
# 6. LOCAL VS ORIGIN FILE DIFFERENCES
# ######################################################################

section "6. LOCAL HEAD VS ORIGIN/MAIN FILE DIFFERENCES"

echo "--- NAME STATUS ---"

git diff --name-status origin/main HEAD 2>/dev/null || true

echo
echo "--- IMPORTANT FILE DIFFERENCES ---"

IMPORTANT_FILES=(
  "api/index.js"
  "vercel.json"
  "package.json"
  "package-lock.json"
  "backend/server.js"
  "backend/server/app.js"
  "backend/canonical/ride_engine.js"
  "backend/canonical/ride_repository.js"
  "backend/canonical/ride_repository_firestore_test.js"
  "backend/production/database_adapter.js"
  "backend/firebase/firestore_adapter.js"
  "backend/routes/rides.js"
  "backend/routes/dispatch_api.js"
  "backend/routes/completion_api.js"
  "frontend/index.html"
  "frontend/js/app_core.js"
)

for F in "${IMPORTANT_FILES[@]}"; do

  LOCAL_EXISTS="NO"
  REMOTE_EXISTS="NO"

  [ -f "$F" ] && LOCAL_EXISTS="YES"
  git cat-file -e "origin/main:$F" 2>/dev/null && REMOTE_EXISTS="YES"

  echo
  echo "FILE: $F"
  echo "  LOCAL       : $LOCAL_EXISTS"
  echo "  ORIGIN/MAIN : $REMOTE_EXISTS"

  if [ "$LOCAL_EXISTS" = "YES" ] && [ "$REMOTE_EXISTS" = "YES" ]; then

    LOCAL_HASH="$(git hash-object "$F" 2>/dev/null || true)"
    REMOTE_HASH="$(git rev-parse "origin/main:$F" 2>/dev/null || true)"

    echo "  LOCAL HASH  : $LOCAL_HASH"
    echo "  REMOTE HASH : $REMOTE_HASH"

    if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
      echo "  RESULT      : IDENTICAL"
    else
      echo "  RESULT      : DIFFERENT"
    fi

  fi

done

# ######################################################################
# 7. LOCAL FILE CONTENT — API ENTRYPOINT
# ######################################################################

section "7. LOCAL API ENTRYPOINT"

if [ -f api/index.js ]; then

  echo "--- api/index.js ---"

  sed -n '1,260p' api/index.js

  echo
  echo "--- API ROUTE REGISTRATION ---"

  grep -nEi \
    "app\.(get|post|put|patch|delete)|router\.(get|post|put|patch|delete)|express|module\.exports|require\(" \
    api/index.js 2>/dev/null | head -n 500 || true

else

  fail "api/index.js missing locally"

fi

# ######################################################################
# 8. LOCAL BACKEND ENTRYPOINTS
# ######################################################################

section "8. LOCAL BACKEND ENTRYPOINTS"

for F in \
  "backend/server.js" \
  "backend/server/app.js" \
  "backend/index.js" \
  "server.js" \
  "api/index.js"
do

  if [ -f "$F" ]; then

    echo
    echo "FOUND: $F"

    echo "--- Imports ---"

    grep -nEi \
      "require\(|from ['\"]|import .*from|import\(" \
      "$F" 2>/dev/null | head -n 250 || true

    echo
    echo "--- Route registrations ---"

    grep -nEi \
      "app\.(get|post|put|patch|delete)|router\.(get|post|put|patch|delete)|use\(" \
      "$F" 2>/dev/null | head -n 500 || true

  else

    echo "MISSING: $F"

  fi

done

# ######################################################################
# 9. CANONICAL REPOSITORY
# ######################################################################

section "9. CANONICAL RIDE REPOSITORY"

for F in \
  "backend/canonical/ride_repository.js" \
  "backend/canonical/ride_repository_firestore_test.js" \
  "backend/production/database_adapter.js" \
  "backend/firebase/firestore_adapter.js"
do

  if [ -f "$F" ]; then

    echo
    echo "======================================================================"
    echo "FILE: $F"
    echo "======================================================================"

    grep -nEi \
      "firebase|firestore|collection|create|findById|update|accept|delete|module\.exports|require\(" \
      "$F" 2>/dev/null | head -n 500 || true

  else

    echo
    echo "MISSING: $F"

  fi

done

# ######################################################################
# 10. FIRESTORE ENVIRONMENT CONFIGURATION
# ######################################################################

section "10. FIRESTORE CONFIGURATION — NAMES ONLY"

echo "Checking environment variable NAMES only."
echo "VALUES WILL NOT BE PRINTED."

if [ -f .vercel/.env.production.local ]; then

  echo
  echo "--- .vercel/.env.production.local variable names ---"

  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' \
    .vercel/.env.production.local 2>/dev/null \
    | sed 's/=.*//' \
    | sort -u

else

  echo "No local .vercel/.env.production.local found"

fi

echo
echo "--- Firebase / Firestore references in project ---"

grep -RInEi \
  "FIREBASE|FIRESTORE|GOOGLE_APPLICATION_CREDENTIALS|serviceAccount|firebase-admin|initializeApp|getFirestore" \
  . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude='*.log' \
  2>/dev/null | head -n 500 || true

# ######################################################################
# 11. VERCEL CONFIG
# ######################################################################

section "11. VERCEL CONFIGURATION"

if [ -f vercel.json ]; then

  cat vercel.json

else

  fail "vercel.json missing"

fi

# ######################################################################
# 12. VERCEL PROJECT LINK
# ######################################################################

section "12. VERCEL PROJECT LINK"

if [ -f .vercel/project.json ]; then

  cat .vercel/project.json

else

  warn ".vercel/project.json missing"

fi

# ######################################################################
# 13. VERCEL DEPLOYMENT METADATA
# ######################################################################

section "13. VERCEL DEPLOYMENT METADATA"

echo "--- Vercel project info ---"

vercel project ls 2>/dev/null | head -n 100 || true

echo
echo "--- Recent deployments ---"

vercel ls 2>/dev/null | head -n 100 || true

# ######################################################################
# 14. LIVE HTTP HELPER
# ######################################################################

http_get() {

  local URL="$1"
  local BODY_FILE="$2"

  curl -sS \
    -L \
    --connect-timeout 10 \
    --max-time 30 \
    -o "$BODY_FILE" \
    -w "%{http_code}" \
    "$URL" \
    2>/tmp/cablink_curl_error

  local RC=$?

  if [ "$RC" -ne 0 ]; then
    echo "CURL_ERROR_RC_$RC"
    return
  fi

}

# ######################################################################
# 15. LIVE ROOT
# ######################################################################

section "15. LIVE ROOT"

BODY="/tmp/cablink_root_body"

CODE="$(http_get "$BASE/" "$BODY")"

echo "HTTP CODE: $CODE"

if [ -f "$BODY" ]; then

  echo "SIZE:"
  wc -c "$BODY"

  echo
  echo "PREVIEW:"
  head -c 500 "$BODY"

  echo

  if [ "$CODE" = "200" ]; then
    pass "Live root returned HTTP 200"
  else
    fail "Live root did not return HTTP 200"
  fi

else

  fail "Live root body was not captured"

fi

# ######################################################################
# 16. LIVE STATIC ASSETS
# ######################################################################

section "16. LIVE STATIC ASSET TRUTH"

ASSETS=(
  "/frontend/js/app_core.js"
  "/frontend/js/app.js"
  "/frontend/js/rides/rideStateMachine.js"
  "/frontend/js/rides/rideService.js"
  "/frontend/js/rides/rideController.js"
  "/frontend/js/services/cablinkAPI.js"
  "/frontend/js/services/api.js"
  "/frontend/js/driver/driverDispatchBridge.js"
  "/frontend/js/driver/driverLifecycleControls.js"
  "/fix.js"
  "/role.js"
  "/fare_engine.js"
  "/manifest.json"
  "/sw.js"
)

for ASSET in "${ASSETS[@]}"; do

  SAFE="$(echo "$ASSET" | tr '/' '_')"
  BODY="/tmp/cablink_asset${SAFE}"

  CODE="$(http_get "$BASE$ASSET" "$BODY")"

  SIZE=0

  if [ -f "$BODY" ]; then
    SIZE="$(wc -c < "$BODY")"
  fi

  echo
  echo "ASSET: $ASSET"
  echo "HTTP : $CODE"
  echo "SIZE : $SIZE"

  if [ -f "$BODY" ]; then
    echo "HEAD :"
    head -c 160 "$BODY"
    echo
  fi

  if [ "$CODE" = "200" ] && [ "$SIZE" -gt 0 ]; then

    if grep -qi "<!DOCTYPE html>" "$BODY"; then
      fail "$ASSET returned fallback HTML instead of asset"
    else
      pass "$ASSET served as non-empty asset"
    fi

  else

    fail "$ASSET not successfully served"

  fi

done

# ######################################################################
# 17. LIVE API ROUTES — SAFE GET ONLY
# ######################################################################

section "17. LIVE API ROUTE TRUTH — SAFE GET ONLY"

API_ROUTES=(
  "/api/health"
  "/health"
  "/api/rides"
  "/api/drivers/online"
  "/api/canonical-firestore-lifecycle"
)

for ROUTE in "${API_ROUTES[@]}"; do

  SAFE="$(echo "$ROUTE" | tr '/' '_')"
  BODY="/tmp/cablink_api${SAFE}"

  CODE="$(http_get "$BASE$ROUTE" "$BODY")"

  SIZE=0

  if [ -f "$BODY" ]; then
    SIZE="$(wc -c < "$BODY")"
  fi

  echo
  echo "ROUTE: $ROUTE"
  echo "HTTP : $CODE"
  echo "SIZE : $SIZE"

  if [ -f "$BODY" ]; then

    echo "BODY:"
    head -c 3000 "$BODY"
    echo

  fi

  if [ "$CODE" = "200" ]; then
    pass "$ROUTE returned HTTP 200"
  elif [ "$CODE" = "404" ]; then
    warn "$ROUTE returned HTTP 404"
  else
    warn "$ROUTE returned HTTP $CODE"
  fi

done

# ######################################################################
# 18. LIVE API RESPONSE SIGNATURE
# ######################################################################

section "18. LIVE API RESPONSE SIGNATURE"

HEALTH_BODY="/tmp/cablink_api_health"

if [ -f "$HEALTH_BODY" ]; then

  echo "--- /api/health ---"
  cat "$HEALTH_BODY"

  echo
  echo "--- Signature search ---"

  grep -oEi \
    "ONLINE|CANONICAL|FIRESTORE|RIDE|TEST|production|status|system" \
    "$HEALTH_BODY" 2>/dev/null | sort -u || true

fi

# ######################################################################
# 19. LOCAL ROUTE INVENTORY
# ######################################################################

section "19. LOCAL ROUTE INVENTORY"

echo "--- All app/router route registrations ---"

grep -RInEi \
  "(app|router)\.(get|post|put|patch|delete)\s*\(" \
  api backend \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  2>/dev/null | head -n 1000 || true

# ######################################################################
# 20. RIDE API ROUTE OWNERSHIP
# ######################################################################

section "20. RIDE API ROUTE OWNERSHIP"

echo "--- Files defining /api/rides ---"

grep -RInEi \
  "[\"'\`]/api/rides|[\"'\`]/rides" \
  api backend \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  2>/dev/null | head -n 500 || true

echo
echo "--- Files defining driver routes ---"

grep -RInEi \
  "drivers/online|drivers/offline|drivers/apply|/accept" \
  api backend \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  2>/dev/null | head -n 500 || true

# ######################################################################
# 21. API → BACKEND → REPOSITORY IMPORT CHAIN
# ######################################################################

section "21. IMPORT CHAIN ANALYSIS"

echo "--- api/index.js imports ---"

grep -nEi \
  "require\(|from ['\"]|import .*from" \
  api/index.js 2>/dev/null || true

echo
echo "--- backend/server/app.js imports ---"

if [ -f backend/server/app.js ]; then
  grep -nEi \
    "require\(|from ['\"]|import .*from" \
    backend/server/app.js 2>/dev/null || true
fi

echo
echo "--- backend/server.js imports ---"

if [ -f backend/server.js ]; then
  grep -nEi \
    "require\(|from ['\"]|import .*from" \
    backend/server.js 2>/dev/null || true
fi

# ######################################################################
# 22. PACKAGE SCRIPTS
# ######################################################################

section "22. PACKAGE.JSON SCRIPTS"

if [ -f package.json ]; then

  node - <<'NODE'
const fs = require("fs");

try {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

  console.log("name:", pkg.name || "");
  console.log("version:", pkg.version || "");

  console.log("\nSCRIPTS:");

  for (const [key, value] of Object.entries(pkg.scripts || {})) {
    console.log(`${key}: ${value}`);
  }

} catch (e) {
  console.log("PACKAGE_PARSE_ERROR:", e.message);
}
NODE

fi

# ######################################################################
# 23. VERCEL IGNORE / BUILD CONFIG
# ######################################################################

section "23. VERCEL BUILD/IGNORE FILES"

for F in \
  ".vercelignore" \
  "vercel.json" \
  "package.json" \
  "api/index.js"
do

  if [ -f "$F" ]; then
    echo
    echo "FOUND: $F"
  else
    echo "MISSING: $F"
  fi

done

# ######################################################################
# 24. SOURCE HASH SNAPSHOT
# ######################################################################

section "24. SOURCE HASH SNAPSHOT"

for F in \
  "api/index.js" \
  "vercel.json" \
  "backend/server/app.js" \
  "backend/canonical/ride_repository.js" \
  "backend/canonical/ride_repository_firestore_test.js" \
  "backend/production/database_adapter.js" \
  "backend/firebase/firestore_adapter.js"
do

  if [ -f "$F" ]; then

    echo
    echo "$F"
    sha256sum "$F"

  fi

done

# ######################################################################
# 25. FINAL TRUTH MATRIX
# ######################################################################

section "25. FINAL TRUTH MATRIX"

echo
echo "======================================================================"
echo "LAYER                         STATUS"
echo "======================================================================"

if [ -n "$LOCAL_SHA" ]; then
  echo "LOCAL HEAD                    $LOCAL_SHORT"
else
  echo "LOCAL HEAD                    UNKNOWN"
fi

if [ -n "$REMOTE_SHORT" ]; then
  echo "GITHUB origin/main            $REMOTE_SHORT"
else
  echo "GITHUB origin/main            UNKNOWN"
fi

if [ "$LOCAL_SHA" = "$REMOTE_SHA" ] && [ -n "$LOCAL_SHA" ]; then
  echo "LOCAL == GITHUB               YES"
else
  echo "LOCAL == GITHUB               NO"
fi

echo
echo "VERCEL BASE                   $BASE"

echo
echo "LOCAL api/index.js            $([ -f api/index.js ] && echo EXISTS || echo MISSING)"
echo "LOCAL backend/server/app.js   $([ -f backend/server/app.js ] && echo EXISTS || echo MISSING)"
echo "LOCAL canonical repository    $([ -f backend/canonical/ride_repository.js ] && echo EXISTS || echo MISSING)"
echo "LOCAL Firestore test repo     $([ -f backend/canonical/ride_repository_firestore_test.js ] && echo EXISTS || echo MISSING)"
echo "LOCAL DB adapter              $([ -f backend/production/database_adapter.js ] && echo EXISTS || echo MISSING)"
echo "LOCAL Firebase adapter        $([ -f backend/firebase/firestore_adapter.js ] && echo EXISTS || echo MISSING)"

echo
echo "======================================================================"
echo "FINAL COUNTS"
echo "======================================================================"

echo "PASS : $PASS"
echo "FAIL : $FAIL"
echo "WARN : $WARN"

echo
echo "======================================================================"
echo "TRUTH AUDIT COMPLETE"
echo "======================================================================"

echo "REPORT:"
echo "$OUT"

echo
echo "NO FILES WERE MODIFIED BY THIS AUDIT."
echo "NO COMMIT WAS CREATED."
echo "NO PUSH WAS PERFORMED."
echo "NO DEPLOYMENT WAS PERFORMED."

