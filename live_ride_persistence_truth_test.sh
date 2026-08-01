#!/data/data/com.termux/files/usr/bin/bash

BASE="https://cab-link-pwa.vercel.app"
STAMP="$(date +%s)"
RIDE_ID="CABLINK-TRUTH-$STAMP"

echo "============================================================"
echo "CABLINK — LIVE RIDE PERSISTENCE TRUTH TEST"
echo "============================================================"
echo "BASE: $BASE"
echo "TEST RIDE ID: $RIDE_ID"
echo

echo "============================================================"
echo "1. LIVE API HEALTH"
echo "============================================================"

curl -sS -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/health"

echo

echo "============================================================"
echo "2. CREATE ONE REAL TEST RIDE THROUGH LIVE /api/rides"
echo "============================================================"

CREATE_RESPONSE="$(
curl -sS -X POST \
  "$BASE/api/rides" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\":\"$RIDE_ID\",
    \"pickup\":\"BSTM HQ\",
    \"dropoff\":\"Game City Mall\",
    \"vehicle\":\"standard\",
    \"fare\":20,
    \"distanceKm\":5.2,
    \"passenger\":\"CABLINK-TRUTH-TEST\",
    \"wallet\":null
  }"
)"

echo "$CREATE_RESPONSE"
echo

echo "============================================================"
echo "3. READ THE SAME RIDE THROUGH LIVE /api/rides/:id"
echo "============================================================"

curl -sS -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/rides/$RIDE_ID"

echo

echo "============================================================"
echo "4. LIVE RIDE LIST — SEARCH FOR TEST RIDE"
echo "============================================================"

curl -sS \
  "$BASE/api/rides"

echo

echo "============================================================"
echo "5. ATTEMPT FIRST DRIVER ACCEPTANCE"
echo "============================================================"

curl -sS -X PATCH \
  "$BASE/api/rides/$RIDE_ID/accept" \
  -H "Content-Type: application/json" \
  -d '{
    "driverId":"CABLINK-TRUTH-DRIVER-001",
    "driverName":"CabLink Truth Test Driver"
  }' \
  -w "\nHTTP_CODE=%{http_code}\n"

echo

echo "============================================================"
echo "6. READ AFTER DRIVER ACCEPTANCE"
echo "============================================================"

curl -sS -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/rides/$RIDE_ID"

echo

echo "============================================================"
echo "7. SECOND DRIVER ACCEPTANCE — MUST RETURN 409"
echo "============================================================"

curl -sS -X PATCH \
  "$BASE/api/rides/$RIDE_ID/accept" \
  -H "Content-Type: application/json" \
  -d '{
    "driverId":"CABLINK-TRUTH-DRIVER-002",
    "driverName":"Second Truth Test Driver"
  }' \
  -w "\nHTTP_CODE=%{http_code}\n"

echo

echo "============================================================"
echo "8. FIRESTORE LIFECYCLE TEST — CONTROL COMPARISON"
echo "============================================================"

curl -sS -w "\nHTTP_CODE=%{http_code}\n" \
  "$BASE/api/canonical-firestore-lifecycle"

echo

echo "============================================================"
echo "9. LOCAL FILE CHECK"
echo "============================================================"

echo "--- backend/data/rides.json ---"

if [ -f backend/data/rides.json ]; then
    grep -n "$RIDE_ID" backend/data/rides.json || \
        echo "TEST RIDE NOT FOUND IN LOCAL canonical rides.json"
else
    echo "backend/data/rides.json DOES NOT EXIST"
fi

echo

echo "--- backend/storage/cablink_db.json ---"

if [ -f backend/storage/cablink_db.json ]; then
    grep -n "$RIDE_ID" backend/storage/cablink_db.json || \
        echo "TEST RIDE NOT FOUND IN local cablink_db.json"
else
    echo "backend/storage/cablink_db.json DOES NOT EXIST"
fi

echo

echo "============================================================"
echo "10. FINAL TEST ID"
echo "============================================================"

echo "$RIDE_ID"

echo
echo "============================================================"
echo "TEST COMPLETE"
echo "============================================================"
