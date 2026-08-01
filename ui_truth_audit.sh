#!/data/data/com.termux/files/usr/bin/bash

echo "============================================================"
echo "CABLINK UI TRUTH AUDIT"
echo "============================================================"

echo
echo "=== HTML ELEMENTS ==="

for ID in \
nav \
s-home \
s-driver \
s-rewards \
s-profile \
map \
walletCard \
vehicleGrid \
fb-total \
bookBtn \
claimBtn \
driverToggle \
onboarding \
sosModal
do
    grep -q "id=\"$ID\"" index.html \
    && echo "✅ $ID" \
    || echo "❌ missing $ID"
done


echo
echo "=== JAVASCRIPT FILES ==="

for FILE in \
frontend/js/app_core.js \
role.js \
fix.js \
fare_engine.js \
frontend/js/rides/rideStateMachine.js \
frontend/js/rides/passengerRideStatus.js \
frontend/js/driver/driverLifecycleControls.js \
frontend/js/rides/completionRewardBridge.js
do

    [ -f "$FILE" ] \
    && echo "✅ $FILE" \
    || echo "❌ missing $FILE"

done


echo
echo "=== INLINE FUNCTION CHECK ==="

python3 <<'PY'
import re

html=open("index.html",errors="ignore").read()

onclick=set(re.findall(r'onclick="(\w+)\(',html))

print("Buttons found:",len(onclick))

for x in sorted(onclick):
    print(" ",x)

PY


echo
echo "=== FILE SIZE ==="

wc -l index.html

echo
echo "============================================================"
echo "UI AUDIT COMPLETE"
echo "============================================================"
