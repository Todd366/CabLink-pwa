#!/data/data/com.termux/files/usr/bin/bash

set +e

echo "============================================================"
echo "CABLINK — FINAL CANONICAL RIDE MIGRATION AUDIT"
echo "============================================================"
echo "READ-ONLY — NO FILES WILL BE MODIFIED"
echo

echo "============================================================"
echo "1. ORCHESTRATOR SERVICE — FULL SOURCE"
echo "============================================================"
sed -n '1,320p' backend/services/ride_orchestrator_service.js

echo
echo "============================================================"
echo "2. ORCHESTRATOR API — FULL SOURCE"
echo "============================================================"
sed -n '1,240p' backend/routes/orchestrator_api.js

echo
echo "============================================================"
echo "3. DISPATCH SERVICE — FULL SOURCE"
echo "============================================================"
sed -n '1,320p' backend/services/dispatch_service.js

echo
echo "============================================================"
echo "4. DISPATCH API — FULL SOURCE"
echo "============================================================"
sed -n '1,320p' backend/routes/dispatch_api.js

echo
echo "============================================================"
echo "5. LIVE RIDE SERVICE — FULL SOURCE"
echo "============================================================"
sed -n '1,280p' backend/services/live_ride_service.js

echo
echo "============================================================"
echo "6. LIVE RIDE API — FULL SOURCE"
echo "============================================================"
sed -n '1,220p' backend/routes/live_ride_api.js

echo
echo "============================================================"
echo "7. RIDE STATE SERVICE — FULL SOURCE"
echo "============================================================"
sed -n '1,260p' backend/services/ride_state_service.js

echo
echo "============================================================"
echo "8. RIDE COMPLETION SERVICE — FULL SOURCE"
echo "============================================================"
sed -n '1,320p' backend/services/ride_completion_service.js

echo
echo "============================================================"
echo "9. COMPLETION API — FULL SOURCE"
echo "============================================================"
sed -n '1,220p' backend/routes/completion_api.js

echo
echo "============================================================"
echo "10. CANONICAL COMPATIBILITY LAYER — FULL SOURCE"
echo "============================================================"
sed -n '1,260p' backend/canonical/ride_compatibility.js

echo
echo "============================================================"
echo "11. CANONICAL RIDE ENGINE — FULL SOURCE"
echo "============================================================"
sed -n '1,320p' backend/canonical/ride_engine.js

echo
echo "============================================================"
echo "12. CANONICAL REPOSITORY — FULL SOURCE"
echo "============================================================"
sed -n '1,280p' backend/canonical/ride_repository.js

echo
echo "============================================================"
echo "13. LEGACY DATABASE RIDE REPOSITORY"
echo "============================================================"
sed -n '1,240p' backend/database/ride_repository.js

echo
echo "============================================================"
echo "14. LEGACY RIDE REPOSITORY VARIANT"
echo "============================================================"
sed -n '1,240p' backend/database/rideRepository.js

echo
echo "============================================================"
echo "15. LEGACY RIDE STORE"
echo "============================================================"
sed -n '1,240p' backend/ride_store.js

echo
echo "============================================================"
echo "16. LEGACY RIDE API PATCH"
echo "============================================================"
sed -n '1,240p' backend/ride_api_patch.js

echo
echo "============================================================"
echo "17. STORAGE DATABASE IMPLEMENTATION"
echo "============================================================"
sed -n '1,300p' backend/storage/database.js

echo
echo "============================================================"
echo "18. ALL IMPORTS OF LEGACY RIDE REPOSITORIES"
echo "============================================================"
grep -RInE \
'ride_repository|rideRepository|ride_store|trip_manager|live_ride_service|ride_orchestrator_service|dispatch_service' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "19. ALL DIRECT WRITES TO RIDE DATA FILES"
echo "============================================================"
grep -RInE \
'writeFileSync|writeFile|appendFileSync|appendFile|\.write\(|\.push\(|JSON\.stringify' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=testing \
2>/dev/null | \
grep -E \
'rides|ride|trip|cablink_db|live_rides|ride_events' \
2>/dev/null

echo
echo "============================================================"
echo "20. ALL RIDE STATUS MUTATIONS"
echo "============================================================"
grep -RInE \
'status[[:space:]]*=|status:|["'\'']status["'\'']|transition\(|acceptRide\(|update\(' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=testing \
2>/dev/null | \
grep -E \
'ride|Ride|trip|Trip|status|transition|accept' \
2>/dev/null

echo
echo "============================================================"
echo "21. LEGACY STATE NAMES"
echo "============================================================"
grep -RInE \
'SEARCHING|DRIVER_FOUND|ACCEPTED|DRIVER_ARRIVING|TRIP_STARTED|TRIP_COMPLETED|ASSIGNED' \
backend frontend \
--include='*.js' \
--include='*.html' \
--exclude-dir=node_modules \
2>/dev/null

echo
echo "============================================================"
echo "22. CANONICAL STATE NAMES"
echo "============================================================"
grep -RInE \
'REQUESTED|MATCHING|DRIVER_ASSIGNED|DRIVER_ARRIVED|PICKED_UP|STARTED|COMPLETED|CANCELLED' \
backend/canonical \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "23. ALL RIDE DATA FILES"
echo "============================================================"
find backend \
-type f \
\( -iname '*ride*.json' -o -iname '*trip*.json' -o -iname '*cablink_db*.json' \) \
-print \
-exec sh -c 'echo "--- $1"; wc -c "$1"' _ {} \;

echo
echo "============================================================"
echo "24. RIDE DATA COUNTS"
echo "============================================================"

for FILE in \
backend/data/rides.json \
backend/data/live_rides.json \
backend/data/ride_events.json \
backend/database/rides.json \
backend/storage/cablink_db.json
do
    if [ -f "$FILE" ]; then
        echo
        echo "FILE: $FILE"
        node - "$FILE" <<'NODE'
const fs = require("fs");

const file = process.argv[2];

try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);

    if (Array.isArray(data)) {
        console.log("ARRAY LENGTH:", data.length);
        console.log("FIRST ITEM:", JSON.stringify(data[0] || null, null, 2));
    } else {
        console.log("ROOT TYPE: OBJECT");
        console.log("KEYS:", Object.keys(data));

        if (Array.isArray(data.rides)) {
            console.log("rides LENGTH:", data.rides.length);
            console.log(
                "FIRST RIDE:",
                JSON.stringify(data.rides[0] || null, null, 2)
            );
        }
    }
} catch (e) {
    console.log("READ ERROR:", e.message);
}
NODE
    fi
done

echo
echo "============================================================"
echo "25. CANONICAL REPOSITORY RUNTIME TEST"
echo "============================================================"

node <<'NODE'
const repo = require("./backend/canonical/ride_repository");

console.log("Canonical repository exports:");
console.log(Object.keys(repo));

console.log("Canonical ride count:");
console.log(repo.all().length);

console.log("Canonical statuses:");

const counts = {};

for (const ride of repo.all()) {
    counts[ride.status] = (counts[ride.status] || 0) + 1;
}

console.log(JSON.stringify(counts, null, 2));
NODE

echo
echo "============================================================"
echo "26. CANONICAL ENGINE RUNTIME TEST"
echo "============================================================"

node <<'NODE'
const engine = require("./backend/canonical/ride_engine");

console.log("States:");
console.log(JSON.stringify(engine.STATES, null, 2));

console.log("Transitions:");
console.log(JSON.stringify(engine.TRANSITIONS, null, 2));

console.log("Engine exports:");
console.log(Object.keys(engine));
NODE

echo
echo "============================================================"
echo "27. LEGACY DATABASE RUNTIME TEST"
echo "============================================================"

node <<'NODE'
try {
    const repo = require("./backend/database/ride_repository");

    console.log("Legacy repository exports:");
    console.log(Object.keys(repo));

    console.log("Legacy ride count:");

    try {
        const rides = repo.all();
        console.log(Array.isArray(rides) ? rides.length : "NOT ARRAY");
    } catch (e) {
        console.log("COUNT ERROR:", e.message);
    }
} catch (e) {
    console.log("LOAD ERROR:", e.message);
}
NODE

echo
echo "============================================================"
echo "28. FINAL WRITE-TARGET CLASSIFICATION"
echo "============================================================"

echo
echo "CANONICAL:"
echo "  backend/data/rides.json"
echo "  backend/canonical/ride_repository.js"
echo "  backend/canonical/ride_engine.js"

echo
echo "LEGACY / TO BE REVIEWED:"
echo "  backend/storage/cablink_db.json"
echo "  backend/database/rides.json"
echo "  backend/ride_store.js"
echo "  backend/data/live_rides.json"
echo "  backend/data/ride_events.json"

echo
echo "============================================================"
echo "29. AUDIT COMPLETE"
echo "============================================================"
echo "NO FILES MODIFIED"
echo "NO FILES DELETED"
echo "NO DATA MIGRATED"
echo "============================================================"

