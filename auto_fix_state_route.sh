#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK AUTO FIX — CANONICAL STATE ROUTE"
echo "============================================================"

python3 <<'PY'
from pathlib import Path

p = Path("backend/routes/rides.js")

text = p.read_text()

if 'router.patch("/:id/state"' not in text:

    marker = "module.exports = router;"

    patch = r'''

// ============================================================
// PATCH /api/rides/:id/state
//
// Canonical lifecycle transition bridge
// ============================================================

router.patch("/:id/state", async (req,res)=>{

    try {

        const { state } = req.body || {};

        if(!state){

            return res.status(400).json({
                success:false,
                error:"State required"
            });

        }

        const result =
            await rideEngine.transition(
                req.params.id,
                state
            );

        return res.json(result);

    } catch(error){

        console.error(
            "State transition error:",
            error
        );

        return res.status(500).json({
            success:false,
            error:"Failed state transition"
        });

    }

});

'''

    text = text.replace(
        marker,
        patch + "\n" + marker
    )

    p.write_text(text)

    print("STATE ROUTE ADDED")

else:
    print("STATE ROUTE ALREADY EXISTS")

PY


echo
echo "=== SYNTAX CHECK ==="

node --check backend/routes/rides.js

echo "OK"


echo
echo "=== RESTART BACKEND ==="

pkill -f "node backend/server.js" || true

nohup node backend/server.js > backend.log 2>&1 &

sleep 3

cat backend.log


echo
echo "=== FULL LIFECYCLE TEST ==="


RID=$(curl -s -X POST http://localhost:3000/api/rides \
-H "Content-Type: application/json" \
-d '{
"passenger":"AUTO-LIFECYCLE-TEST",
"pickup":"BSTM HQ",
"dropoff":"Airport Junction"
}' | python3 -c "import sys,json; print(json.load(sys.stdin)['ride']['id'])")


echo "RIDE=$RID"


curl -s -X PATCH \
http://localhost:3000/api/rides/$RID/accept \
-H "Content-Type: application/json" \
-d '{
"driverId":"AUTO-DRIVER",
"driverName":"Auto Driver"
}'


echo


for STATE in DRIVER_ARRIVED PICKED_UP STARTED
do

echo "STATE=$STATE"

curl -s -X PATCH \
http://localhost:3000/api/rides/$RID/state \
-H "Content-Type: application/json" \
-d "{\"state\":\"$STATE\"}"

echo

done


echo "COMPLETE"

curl -s -X PATCH \
http://localhost:3000/api/rides/$RID/complete \
-H "Content-Type: application/json" \
-d '{
"driverId":"AUTO-DRIVER",
"driverName":"Auto Driver"
}'


echo

echo "FINAL RECORD"

curl -s \
http://localhost:3000/api/rides/$RID


echo

echo "============================================================"
echo "AUTO FIX COMPLETE"
echo "============================================================"

