#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "============================================================"
echo "CABLINK FINAL CANONICAL MIGRATION + HEALTH CHECK"
echo "============================================================"

ROOT="$(pwd)"

echo
echo "[1] Updating frontend ride API contract"

python3 - <<'PY'
from pathlib import Path

p = Path("frontend/services/ride_service.js")

if p.exists():
    text = p.read_text()

    text = text.replace(
        '"/api/rides/request"',
        '"/api/rides"'
    )

    p.write_text(text)

    print("Updated frontend/services/ride_service.js")
else:
    print("ride_service.js not found")
PY


echo
echo "[2] Searching for old ride endpoints"

grep -RInE \
"/api/rides/request|/api/ride/" \
frontend backend api \
--include="*.js" \
--exclude-dir=node_modules || true


echo
echo "[3] JavaScript syntax validation"

find backend api frontend \
-name "*.js" \
-not -path "*node_modules*" \
-exec node --check {} \;

echo "JS syntax OK"


echo
echo "[4] Backend startup health test"

timeout 8 node backend/server.js > /tmp/cablink_server_test.log 2>&1 || true

cat /tmp/cablink_server_test.log


echo
echo "[5] Canonical ride creation test"

RESULT=$(curl -s \
-X POST http://localhost:3000/api/rides \
-H "Content-Type: application/json" \
-d '{
"passenger":"Health Test Passenger",
"pickup":"Game City Mall",
"dropoff":"Airport Junction"
}')

echo "$RESULT"


echo
echo "[6] Ride read test"

curl -s http://localhost:3000/api/rides

echo


echo
echo "[7] Search remaining legacy ride writers"

grep -RInE \
"rides\.push|live_rides|ride_store|rideRepository|/api/rides/request" \
backend api frontend \
--include="*.js" \
--exclude-dir=node_modules || true


echo
echo "[8] Dependency check"

npx depcheck || true


echo
echo "[9] Git cleanup preview"

git status --short | wc -l

echo
echo "============================================================"
echo "CABLINK HEALTH CHECK COMPLETE"
echo "============================================================"
