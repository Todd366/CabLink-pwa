#!/usr/bin/env bash
set -u

BASE="${1:-https://cab-link-pwa.vercel.app}"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="cablink_live_truth_probe_${STAMP}.txt"

exec > >(tee "$OUT") 2>&1

echo "============================================================"
echo "CABLINK — LIVE PRODUCTION RUNTIME TRUTH PROBE"
echo "============================================================"
echo "BASE URL : $BASE"
echo "TIME     : $(date -Iseconds)"
echo "OUTPUT   : $OUT"
echo "MODE     : READ-ONLY EXCEPT TEST RIDE LIFECYCLE REQUESTS"
echo "============================================================"

PASS=0
FAIL=0
WARN=0

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

check() {
  local name="$1"
  local result="$2"

  if [ "$result" = "PASS" ]; then
    echo "✅ PASS: $name"
    PASS=$((PASS+1))
  elif [ "$result" = "FAIL" ]; then
    echo "❌ FAIL: $name"
    FAIL=$((FAIL+1))
  else
    echo "⚠️ WARN: $name"
    WARN=$((WARN+1))
  fi
}

curl_status() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 20 \
    -o /tmp/cablink_probe_body \
    -w "%{http_code}" \
    "$1" 2>/dev/null || echo "000"
}

curl_body() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 20 \
    "$1" 2>/dev/null || true
}

json_get() {
  python3 - "$1" "$2" <<'PY'
import json, sys

raw = sys.argv[1]
path = sys.argv[2].split(".")

try:
    obj = json.loads(raw)
except Exception:
    print("")
    raise SystemExit

for p in path:
    if isinstance(obj, dict):
        obj = obj.get(p)
    else:
        obj = None
    if obj is None:
        break

if isinstance(obj, (dict, list)):
    print(json.dumps(obj, separators=(",", ":")))
else:
    print("" if obj is None else str(obj))
PY
}

post_json() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 30 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$2" \
    "$1" 2>/dev/null || true
}

patch_json() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 30 \
    -X PATCH \
    -H "Content-Type: application/json" \
    -d "$2" \
    "$1" 2>/dev/null || true
}

get_http_code() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 30 \
    -o /tmp/cablink_probe_body \
    -w "%{http_code}" \
    "$1" 2>/dev/null || echo "000"
}

post_http_code() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 30 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$2" \
    -o /tmp/cablink_probe_body \
    -w "%{http_code}" \
    "$1" 2>/dev/null || echo "000"
}

patch_http_code() {
  curl -sS -L \
    --connect-timeout 10 \
    --max-time 30 \
    -X PATCH \
    -H "Content-Type: application/json" \
    -d "$2" \
    -o /tmp/cablink_probe_body \
    -w "%{http_code}" \
    "$1" 2>/dev/null || echo "000"
}

# ============================================================
# 0. LOCAL GIT STATE
# ============================================================

section "0. LOCAL GIT STATE"

echo "--- Current branch ---"
git branch --show-current || true

echo
echo "--- Current commit ---"
git rev-parse HEAD 2>/dev/null || true

echo
echo "--- Current commit subject ---"
git log -1 --oneline 2>/dev/null || true

echo
echo "--- Working tree ---"
git status --short 2>/dev/null || true

echo
echo "--- Remote ---"
git remote -v 2>/dev/null || true

echo
echo "--- Local vs origin/main ---"

if git rev-parse --verify origin/main >/dev/null 2>&1; then
  LOCAL_SHA="$(git rev-parse HEAD)"
  REMOTE_SHA="$(git rev-parse origin/main)"

  echo "LOCAL : $LOCAL_SHA"
  echo "REMOTE: $REMOTE_SHA"

  if [ "$LOCAL_SHA" = "$REMOTE_SHA" ]; then
    check "Local HEAD matches origin/main" "PASS"
  else
    check "Local HEAD differs from origin/main" "WARN"
  fi
else
  check "origin/main available locally" "WARN"
fi

# ============================================================
# 1. LIVE ROOT
# ============================================================

section "1. LIVE DEPLOYMENT"

ROOT_CODE="$(curl_status "$BASE/")"
ROOT_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

echo "HTTP: $ROOT_CODE"
echo "SIZE: $(printf '%s' "$ROOT_BODY" | wc -c)"
echo "PREVIEW:"
printf '%s\n' "$ROOT_BODY" | head -c 300
echo

if [ "$ROOT_CODE" = "200" ] && printf '%s' "$ROOT_BODY" | grep -qi "<html"; then
  check "Production root serves HTML" "PASS"
else
  check "Production root serves HTML" "FAIL"
fi

# ============================================================
# 2. API HEALTH
# ============================================================

section "2. API HEALTH"

HEALTH_CODE="$(get_http_code "$BASE/api/health")"
HEALTH_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

echo "HTTP: $HEALTH_CODE"
echo "BODY:"
echo "$HEALTH_BODY"

if [ "$HEALTH_CODE" = "200" ]; then
  check "/api/health returns HTTP 200" "PASS"
else
  check "/api/health returns HTTP 200" "FAIL"
fi

if printf '%s' "$HEALTH_BODY" | grep -qi "ONLINE"; then
  check "API reports ONLINE" "PASS"
else
  check "API reports ONLINE" "WARN"
fi

if printf '%s' "$HEALTH_BODY" | grep -qi "CANONICAL"; then
  check "API health identifies canonical lifecycle" "PASS"
else
  check "API health identifies canonical lifecycle" "WARN"
fi

# ============================================================
# 3. STATIC ASSET DELIVERY
# ============================================================

section "3. STATIC ASSET DELIVERY"

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
  CODE="$(curl_status "$BASE$ASSET")"
  BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"
  SIZE="$(printf '%s' "$BODY" | wc -c)"

  echo
  echo "$ASSET"
  echo "  HTTP : $CODE"
  echo "  SIZE : $SIZE"
  echo "  HEAD : $(printf '%s' "$BODY" | head -c 100 | tr '\n' ' ')"

  if [ "$CODE" = "200" ]; then
    if printf '%s' "$BODY" | grep -q "<!DOCTYPE html>"; then
      check "$ASSET is served as actual asset" "FAIL"
    else
      check "$ASSET HTTP 200 and not fallback HTML" "PASS"
    fi
  else
    check "$ASSET HTTP 200" "FAIL"
  fi
done

# ============================================================
# 4. LIVE API ROUTE DISCOVERY
# ============================================================

section "4. LIVE API ROUTE DISCOVERY"

echo "--- GET /api/rides ---"

RIDES_CODE="$(get_http_code "$BASE/api/rides")"
RIDES_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

echo "HTTP: $RIDES_CODE"
echo "BODY:"
echo "$RIDES_BODY" | head -c 3000
echo

if [ "$RIDES_CODE" = "200" ]; then
  check "GET /api/rides responds 200" "PASS"
else
  check "GET /api/rides responds 200" "FAIL"
fi

echo
echo "--- GET /api/drivers/online ---"

DRIVERS_CODE="$(get_http_code "$BASE/api/drivers/online")"
DRIVERS_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

echo "HTTP: $DRIVERS_CODE"
echo "BODY:"
echo "$DRIVERS_BODY" | head -c 3000
echo

if [ "$DRIVERS_CODE" = "200" ]; then
  check "GET /api/drivers/online responds 200" "PASS"
else
  check "GET /api/drivers/online responds 200" "WARN"
fi

# ============================================================
# 5. CREATE TEST RIDE
# ============================================================

section "5. TEST RIDE CREATION"

TEST_TAG="LIVE-TRUTH-${STAMP}"

CREATE_PAYLOAD="$(cat <<JSON
{
  "pickup":"CabLink Runtime Truth Probe",
  "dropoff":"CabLink Runtime Truth Probe Destination",
  "vehicle":"standard",
  "fare":20,
  "distanceKm":1,
  "wallet":"TRUTH-PROBE-WALLET",
  "notes":"Automated runtime truth probe ${TEST_TAG}"
}
JSON
)"

echo "PAYLOAD:"
echo "$CREATE_PAYLOAD"

CREATE_CODE="$(post_http_code "$BASE/api/rides" "$CREATE_PAYLOAD")"
CREATE_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

echo
echo "HTTP: $CREATE_CODE"
echo "RESPONSE:"
echo "$CREATE_BODY"

if [ "$CREATE_CODE" = "200" ] || [ "$CREATE_CODE" = "201" ]; then
  check "POST /api/rides accepts test ride" "PASS"
else
  check "POST /api/rides accepts test ride" "FAIL"
fi

RIDE_ID="$(json_get "$CREATE_BODY" "ride.id")"

if [ -z "$RIDE_ID" ]; then
  RIDE_ID="$(json_get "$CREATE_BODY" "id")"
fi

echo
echo "EXTRACTED RIDE ID: $RIDE_ID"

if [ -n "$RIDE_ID" ]; then
  check "Ride ID returned by production API" "PASS"
else
  check "Ride ID returned by production API" "FAIL"
fi

# ============================================================
# 6. READ EXACT RIDE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "6. READ EXACT CREATED RIDE"

  READ_CODE="$(get_http_code "$BASE/api/rides/$RIDE_ID")"
  READ_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $READ_CODE"
  echo "BODY:"
  echo "$READ_BODY"

  if [ "$READ_CODE" = "200" ]; then
    check "Created ride can be read by ID" "PASS"
  else
    check "Created ride can be read by ID" "FAIL"
  fi

  if printf '%s' "$READ_BODY" | grep -q "$RIDE_ID"; then
    check "Read response contains exact ride ID" "PASS"
  else
    check "Read response contains exact ride ID" "FAIL"
  fi

else
  echo "SKIPPED: exact ride read — no ride ID"
fi

# ============================================================
# 7. LIST AND VERIFY RIDE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "7. RIDE LIST CONSISTENCY"

  LIST_CODE="$(get_http_code "$BASE/api/rides")"
  LIST_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $LIST_CODE"
  echo "Searching for: $RIDE_ID"

  if printf '%s' "$LIST_BODY" | grep -q "$RIDE_ID"; then
    check "Created ride appears in GET /api/rides" "PASS"
  else
    check "Created ride appears in GET /api/rides" "FAIL"
  fi

else
  echo "SKIPPED: ride list consistency"
fi

# ============================================================
# 8. DRIVER ACCEPTANCE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "8. DRIVER ACCEPTANCE"

  DRIVER_ID="TRUTH-PROBE-DRIVER-${STAMP}"

  ACCEPT_PAYLOAD="$(cat <<JSON
{
  "driverId":"$DRIVER_ID",
  "driverName":"CabLink Runtime Truth Probe Driver"
}
JSON
)"

  echo "PAYLOAD:"
  echo "$ACCEPT_PAYLOAD"

  ACCEPT_CODE="$(patch_http_code "$BASE/api/rides/$RIDE_ID/accept" "$ACCEPT_PAYLOAD")"
  ACCEPT_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo
  echo "HTTP: $ACCEPT_CODE"
  echo "RESPONSE:"
  echo "$ACCEPT_BODY"

  if [ "$ACCEPT_CODE" = "200" ]; then
    check "Driver can accept test ride" "PASS"
  else
    check "Driver can accept test ride" "FAIL"
  fi

  if printf '%s' "$ACCEPT_BODY" | grep -q "$DRIVER_ID"; then
    check "Accepted ride contains test driver ID" "PASS"
  else
    check "Accepted ride contains test driver ID" "WARN"
  fi

else
  echo "SKIPPED: driver acceptance"
fi

# ============================================================
# 9. READ AFTER ACCEPTANCE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "9. POST-ACCEPTANCE RIDE STATE"

  AFTER_ACCEPT_CODE="$(get_http_code "$BASE/api/rides/$RIDE_ID")"
  AFTER_ACCEPT_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $AFTER_ACCEPT_CODE"
  echo "BODY:"
  echo "$AFTER_ACCEPT_BODY"

  if [ "$AFTER_ACCEPT_CODE" = "200" ]; then
    check "Ride readable after acceptance" "PASS"
  else
    check "Ride readable after acceptance" "FAIL"
  fi

  if printf '%s' "$AFTER_ACCEPT_BODY" | grep -q "$DRIVER_ID"; then
    check "Driver assignment persisted in ride state" "PASS"
  else
    check "Driver assignment persisted in ride state" "WARN"
  fi

else
  echo "SKIPPED: post-acceptance read"
fi

# ============================================================
# 10. UPDATE RIDE STATE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "10. RIDE STATE UPDATE"

  UPDATE_PAYLOAD='{
    "status":"ARRIVED"
  }'

  UPDATE_CODE="$(patch_http_code "$BASE/api/rides/$RIDE_ID" "$UPDATE_PAYLOAD")"
  UPDATE_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $UPDATE_CODE"
  echo "BODY:"
  echo "$UPDATE_BODY"

  if [ "$UPDATE_CODE" = "200" ]; then
    check "Ride state update accepted" "PASS"
  else
    check "Ride state update accepted" "FAIL"
  fi

else
  echo "SKIPPED: ride state update"
fi

# ============================================================
# 11. READ AFTER STATE UPDATE
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "11. STATE UPDATE PERSISTENCE"

  STATE_CODE="$(get_http_code "$BASE/api/rides/$RIDE_ID")"
  STATE_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $STATE_CODE"
  echo "BODY:"
  echo "$STATE_BODY"

  if [ "$STATE_CODE" = "200" ]; then
    check "Ride readable after state update" "PASS"
  else
    check "Ride readable after state update" "FAIL"
  fi

  if printf '%s' "$STATE_BODY" | grep -qi "ARRIVED"; then
    check "ARRIVED state persisted" "PASS"
  else
    check "ARRIVED state persisted" "WARN"
  fi

else
  echo "SKIPPED: state persistence"
fi

# ============================================================
# 12. COMPLETION PATH
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "12. RIDE COMPLETION PATH"

  COMPLETE_PAYLOAD='{
    "status":"COMPLETED",
    "rating":5,
    "comment":"Automated runtime truth probe completion"
  }'

  COMPLETE_CODE="$(patch_http_code "$BASE/api/rides/$RIDE_ID" "$COMPLETE_PAYLOAD")"
  COMPLETE_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $COMPLETE_CODE"
  echo "BODY:"
  echo "$COMPLETE_BODY"

  if [ "$COMPLETE_CODE" = "200" ]; then
    check "Ride completion update accepted" "PASS"
  else
    check "Ride completion update accepted" "WARN"
  fi

else
  echo "SKIPPED: completion"
fi

# ============================================================
# 13. FINAL READ
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "13. FINAL RIDE STATE"

  FINAL_CODE="$(get_http_code "$BASE/api/rides/$RIDE_ID")"
  FINAL_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $FINAL_CODE"
  echo "BODY:"
  echo "$FINAL_BODY"

  if [ "$FINAL_CODE" = "200" ]; then
    check "Completed ride remains readable" "PASS"
  else
    check "Completed ride remains readable" "FAIL"
  fi

else
  echo "SKIPPED: final ride state"
fi

# ============================================================
# 14. PERSISTENCE TEST
# ============================================================

if [ -n "$RIDE_ID" ]; then

  section "14. PERSISTENCE TEST"

  echo "Waiting 3 seconds..."
  sleep 3

  PERSIST_CODE="$(get_http_code "$BASE/api/rides/$RIDE_ID")"
  PERSIST_BODY="$(cat /tmp/cablink_probe_body 2>/dev/null || true)"

  echo "HTTP: $PERSIST_CODE"
  echo "BODY:"
  echo "$PERSIST_BODY"

  if [ "$PERSIST_CODE" = "200" ] && printf '%s' "$PERSIST_BODY" | grep -q "$RIDE_ID"; then
    check "Ride persists after delay" "PASS"
  else
    check "Ride persists after delay" "FAIL"
  fi

else
  echo "SKIPPED: persistence test"
fi

# ============================================================
# 15. LOCAL SOURCE TRUTH CROSS-CHECK
# ============================================================

section "15. LOCAL SOURCE TRUTH CROSS-CHECK"

FILES=(
  "api/index.js"
  "backend/server/app.js"
  "backend/production/database_adapter.js"
  "backend/canonical/ride_engine.js"
  "backend/canonical/ride_repository.js"
  "backend/canonical/ride_repository_firestore_test.js"
  "backend/rides/ride_engine.js"
  "backend/rides/ride_state_engine.js"
  "backend/services/ride_completion_service.js"
  "backend/services/ride_economy_service.js"
  "backend/services/canonical_reward_service.js"
  "backend/data/rides.json"
  "database/production/cablink_store.json"
  "database/production/database.json"
  "backend/storage/cablink_db.json"
  "backend/storage/database.js"
  "vercel.json"
  "package.json"
)

for F in "${FILES[@]}"; do
  if [ -f "$F" ]; then
    echo "EXISTS: $F"
  else
    echo "MISSING: $F"
  fi
done

# ============================================================
# 16. SEARCH API ENTRYPOINT FOR RIDE WIRING
# ============================================================

section "16. API ENTRYPOINT RIDE WIRING"

echo "--- api/index.js ride references ---"

grep -nEi \
  "ride|canonical|firestore|repository|completion|economy|reward|dispatch" \
  api/index.js 2>/dev/null | head -n 250 || true

# ============================================================
# 17. SEARCH DEPLOYMENT CONFIG
# ============================================================

section "17. VERCEL DEPLOYMENT CONFIG"

cat vercel.json

# ============================================================
# 18. FINAL VERDICT
# ============================================================

section "18. FINAL VERDICT"

echo
echo "TOTAL PASS : $PASS"
echo "TOTAL FAIL : $FAIL"
echo "TOTAL WARN : $WARN"

echo
echo "============================================================"
echo "INTERPRETATION"
echo "============================================================"

if [ "$FAIL" -eq 0 ]; then
  echo "🟢 NO HARD FAILURES DETECTED BY THIS PROBE."
else
  echo "🔴 HARD FAILURES DETECTED."
fi

echo
echo "IMPORTANT:"
echo "A successful API lifecycle does NOT automatically prove Firestore."
echo "To prove Firestore specifically, the deployed API must be shown to"
echo "import/use the Firestore repository or the database adapter."
echo
echo "This probe proves:"
echo "  1. Production deployment availability"
echo "  2. Static asset availability"
echo "  3. API health"
echo "  4. Ride creation response"
echo "  5. Ride retrieval"
echo "  6. Ride listing"
echo "  7. Driver acceptance"
echo "  8. State mutation"
echo "  9. Completion attempt"
echo " 10. Post-mutation reads"
echo " 11. Persistence across delay"
echo
echo "It does NOT by itself prove:"
echo "  - Firestore is the persistence layer"
echo "  - The canonical repository is the active repository"
echo "  - The backend/server/app.js path is deployed"
echo "  - THB blockchain settlement occurred"
echo "  - Real driver/passenger clients are using the same API"
echo
echo "FULL REPORT:"
echo "$OUT"
echo "============================================================"
