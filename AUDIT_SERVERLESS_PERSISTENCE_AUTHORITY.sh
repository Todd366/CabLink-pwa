#!/data/data/com.termux/files/usr/bin/bash
set -e

ROOT="$HOME/CabLink-pwa"
cd "$ROOT"

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT="AUDIT_SERVERLESS_PERSISTENCE_AUTHORITY_$STAMP.txt"

echo "============================================================"
echo "CABLINK — SERVERLESS PERSISTENCE AUTHORITY AUDIT"
echo "============================================================"
echo "ROOT: $ROOT"
echo "REPORT: $REPORT"
echo

{
echo "CABLINK — SERVERLESS PERSISTENCE AUTHORITY AUDIT"
echo "================================================"
echo "Timestamp: $STAMP"
echo "Root: $ROOT"
echo

echo "============================================================"
echo "1. SERVERLESS ENTRYPOINT"
echo "============================================================"

echo "--- api/index.js imports ---"
grep -nE \
'require\(|from |import ' \
api/index.js \
2>/dev/null || true

echo

echo "============================================================"
echo "2. PRODUCTION DATABASE ADAPTER"
echo "============================================================"

if [ -f backend/production/database_adapter.js ]; then
    echo "--- backend/production/database_adapter.js ---"
    sed -n '1,320p' backend/production/database_adapter.js
else
    echo "MISSING: backend/production/database_adapter.js"
fi

echo

echo "============================================================"
echo "3. FIRESTORE ADAPTER"
echo "============================================================"

if [ -f backend/firebase/firestore_adapter.js ]; then
    echo "--- backend/firebase/firestore_adapter.js ---"
    sed -n '1,360p' backend/firebase/firestore_adapter.js
else
    echo "MISSING: backend/firebase/firestore_adapter.js"
fi

echo

echo "============================================================"
echo "4. FIRESTORE CANONICAL TEST REPOSITORY"
echo "============================================================"

if [ -f backend/canonical/ride_repository_firestore_test.js ]; then
    echo "--- backend/canonical/ride_repository_firestore_test.js ---"
    sed -n '1,420p' backend/canonical/ride_repository_firestore_test.js
else
    echo "MISSING: backend/canonical/ride_repository_firestore_test.js"
fi

echo

echo "============================================================"
echo "5. CANONICAL LOCAL REPOSITORY"
echo "============================================================"

echo "--- backend/canonical/ride_repository.js ---"
sed -n '1,320p' backend/canonical/ride_repository.js

echo

echo "============================================================"
echo "6. CANONICAL ENGINE"
echo "============================================================"

echo "--- backend/canonical/ride_engine.js ---"
sed -n '1,320p' backend/canonical/ride_engine.js

echo

echo "============================================================"
echo "7. ALL DATABASE ADAPTER IMPORTS"
echo "============================================================"

grep -RInE \
'require\(["'\''][^"'\'']*production/database_adapter|from ["'\''][^"'\'']*production/database_adapter' \
. \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=.git \
--exclude='*.bak' \
--exclude='*.backup' \
2>/dev/null || true

echo

echo "============================================================"
echo "8. ALL FIRESTORE ADAPTER IMPORTS"
echo "============================================================"

grep -RInE \
'require\(["'\''][^"'\'']*firebase/firestore_adapter|from ["'\''][^"'\'']*firebase/firestore_adapter' \
. \
--include='*.js' \
--exclude-dir=node_modules \
--exclude-dir=.git \
--exclude='*.bak' \
--exclude='*.backup' \
2>/dev/null || true

echo

echo "============================================================"
echo "9. ALL FIRESTORE REFERENCES"
echo "============================================================"

grep -RInE \
'firestore|Firestore|firebase|Firebase|collection\(|doc\(|set\(|update\(|get\(' \
backend \
api \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.bak' \
--exclude='*.backup' \
2>/dev/null || true

echo

echo "============================================================"
echo "10. ALL RIDE PERSISTENCE WRITE OPERATIONS"
echo "============================================================"

grep -RInE \
'writeFileSync|database\.write|db\.write|firestore\.write|collection\(.*rides|rides.*collection|repository\.create|repository\.update|repository\.accept' \
backend \
api \
--include='*.js' \
--exclude-dir=node_modules \
--exclude='*.bak' \
--exclude='*.backup' \
2>/dev/null || true

echo

echo "============================================================"
echo "11. RIDE PERSISTENCE FILES"
echo "============================================================"

for file in \
backend/data/rides.json \
backend/database/rides.json \
backend/storage/cablink_db.json \
backend/data/live_rides.json
do
    if [ -f "$file" ]; then
        echo "$file:"
        node - <<NODE
const fs = require("fs");
try {
  const data = JSON.parse(fs.readFileSync("$file","utf8"));
  if (Array.isArray(data)) {
    console.log("  type: array");
    console.log("  ride count:", data.length);
  } else {
    console.log("  type: object");
    console.log("  ride count:", Array.isArray(data.rides) ? data.rides.length : "N/A");
  }
} catch(e) {
  console.log("  INVALID JSON:", e.message);
}
NODE
    else
        echo "$file: MISSING"
    fi
done

echo

echo "============================================================"
echo "12. MODULE LOAD IDENTITY TEST"
echo "============================================================"

node - <<'NODE'
function load(label, path) {
    try {
        const mod = require(path);

        console.log();
        console.log(label);
        console.log("PATH:", path);
        console.log("LOAD: PASS");
        console.log("EXPORTS:", Object.keys(mod));

        return mod;
    } catch (e) {
        console.log();
        console.log(label);
        console.log("PATH:", path);
        console.log("LOAD: FAIL");
        console.log("ERROR:", e.message);

        return null;
    }
}

const production =
    load(
        "PRODUCTION DATABASE ADAPTER",
        "./backend/production/database_adapter"
    );

const localRepo =
    load(
        "CANONICAL LOCAL REPOSITORY",
        "./backend/canonical/ride_repository"
    );

const firestoreRepo =
    load(
        "CANONICAL FIRESTORE TEST REPOSITORY",
        "./backend/canonical/ride_repository_firestore_test"
    );

const firestoreAdapter =
    load(
        "FIRESTORE ADAPTER",
        "./backend/firebase/firestore_adapter"
    );

console.log();
console.log("============================================================");
console.log("AUTHORITY COMPARISON");
console.log("============================================================");

function methods(mod) {
    return mod
        ? Object.keys(mod).sort().join(", ")
        : "UNAVAILABLE";
}

console.log(
    "Production adapter methods:",
    methods(production)
);

console.log(
    "Local repository methods:",
    methods(localRepo)
);

console.log(
    "Firestore repository methods:",
    methods(firestoreRepo)
);

console.log(
    "Firestore adapter methods:",
    methods(firestoreAdapter)
);
NODE

echo

echo "============================================================"
echo "13. SERVERLESS RIDE OPERATION TRACE"
echo "============================================================"

grep -nE \
'repository\.(create|findById|update|accept|all)|database\.(create|findById|update|accept|write)|firestore' \
api/index.js \
2>/dev/null || true

echo

echo "============================================================"
echo "14. FINAL CLASSIFICATION"
echo "============================================================"

echo "The following must be determined from the evidence above:"
echo
echo "A. Is api/index.js using the canonical local repository?"
echo "B. Is api/index.js using Firestore?"
echo "C. Is ride_repository_firestore_test.js production-safe?"
echo "D. Does production/database_adapter.js write to the same authority?"
echo "E. Is rides.json development-only or production authority?"
echo "F. Is there one logical ride authority across runtimes?"
echo

echo "============================================================"
echo "AUDIT COMPLETE"
echo "============================================================"

} | tee "$REPORT"

echo
echo "============================================================"
echo "REPORT CREATED"
echo "============================================================"
echo "$REPORT"
echo
echo "NO FILES MODIFIED."
echo "NO RIDE DATA MODIFIED."
echo "NO FILES DELETED."
echo "============================================================"

