#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK CANONICAL FULL LIFECYCLE GATE"
echo "============================================================"

PASS=0
FAIL=0

check() {
    if [ "$1" = "true" ]; then
        echo "✅ $2"
        PASS=$((PASS+1))
    else
        echo "❌ $2"
        FAIL=$((FAIL+1))
    fi
}

echo
echo "=== CREATE RIDE ==="

CREATE=$(curl -s -X POST \
http://localhost:3000/api/rides \
-H "Content-Type: application/json" \
-d '{
"passenger":"CANONICAL-GATE",
"pickup":"BSTM HQ",
"dropoff":"Airport Junction"
}')

echo "$CREATE"

RID=$(echo "$CREATE" | python3 -c \
"import sys,json; print(json.load(sys.stdin)['ride']['id'])")

check "$([ -n "$RID" ] && echo true || echo false)" \
"Ride creation ID generated"

echo
echo "RIDE ID=$RID"


echo
echo "=== ACCEPT ==="

ACCEPT=$(curl -s -X PATCH \
http://localhost:3000/api/rides/$RID/accept \
-H "Content-Type: application/json" \
-d '{
"driverId":"GATE-DRIVER-001",
"driverName":"Gate Driver"
}')

echo "$ACCEPT"

check "$(echo "$ACCEPT" | grep -q 'DRIVER_ASSIGNED' && echo true || echo false)" \
"Driver assigned"


echo
echo "=== STATE TRANSITIONS ==="

for STATE in DRIVER_ARRIVED PICKED_UP STARTED
do

    RESPONSE=$(curl -s -X PATCH \
    http://localhost:3000/api/rides/$RID/state \
    -H "Content-Type: application/json" \
    -d "{\"state\":\"$STATE\"}")

    echo "$RESPONSE"

    check "$(echo "$RESPONSE" | grep -q "\"status\":\"$STATE\"" && echo true || echo false)" \
    "Transition $STATE"

done


echo
echo "=== COMPLETE ==="

COMPLETE=$(curl -s -X PATCH \
http://localhost:3000/api/rides/$RID/complete \
-H "Content-Type: application/json" \
-d '{
"driverId":"GATE-DRIVER-001",
"driverName":"Gate Driver"
}')

echo "$COMPLETE"

check "$(echo "$COMPLETE" | grep -q 'COMPLETED' && echo true || echo false)" \
"Ride completed"

check "$(echo "$COMPLETE" | grep -q 'REWARD_CREATED' && echo true || echo false)" \
"THB reward created"


echo
echo "=== PERSISTENCE CHECK ==="

FINAL=$(curl -s \
http://localhost:3000/api/rides/$RID)

echo "$FINAL"

check "$(echo "$FINAL" | grep -q 'COMPLETED' && echo true || echo false)" \
"Final state persisted"


echo
echo "=== DATABASE SEARCH ==="

grep -q "$RID" backend/storage/cablink_db.json

check "$([ $? -eq 0 ] && echo true || echo false)" \
"Ride exists in database"


echo
echo "============================================================"
echo "RESULT"
echo "============================================================"

echo "PASSED: $PASS"
echo "FAILED: $FAIL"

if [ "$FAIL" -eq 0 ]; then
    echo
    echo "🚕 CABLINK CANONICAL LIFECYCLE: HEALTHY"
    exit 0
else
    echo
    echo "❌ CABLINK LIFECYCLE: FAILED"
    exit 1
fi

