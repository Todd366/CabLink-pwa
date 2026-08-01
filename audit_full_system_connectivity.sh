#!/data/data/com.termux/files/usr/bin/bash

set +e

echo "============================================================"
echo "CABLINK — FULL SYSTEM DATA FLOW & CONNECTIVITY AUDIT"
echo "============================================================"
echo "Purpose:"
echo "  Identify the REAL runtime path from:"
echo "  FRONTEND → ROUTE → SERVICE → CANONICAL ENGINE → REPOSITORY"
echo "  and expose duplicate authorities, storage paths, and dead paths."
echo "============================================================"

echo
echo "============================================================"
echo "1. SERVER ENTRYPOINTS"
echo "============================================================"

grep -RInE \
'listen\(|require\(.*server|require\(.*app|app\.use\(|module\.exports' \
backend/server.js \
backend/server \
backend/index.js \
2>/dev/null

echo
echo "============================================================"
echo "2. ROUTE REGISTRATION — ACTUAL SERVER"
echo "============================================================"

sed -n '1,240p' backend/server/app.js 2>/dev/null

echo
echo "============================================================"
echo "3. ALL ROUTE FILES"
echo "============================================================"

find backend/routes -type f -name '*.js' | sort

echo
echo "============================================================"
echo "4. ROUTE → SERVICE / ENGINE IMPORT GRAPH"
echo "============================================================"

grep -RInE \
'require\(["'\'']\.\.?/.*(services|canonical|database|rewards|dispatch|rides|tracking|drivers|realtime|tasks)' \
backend/routes \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "5. ALL RIDE CREATION PATHS"
echo "============================================================"

grep -RInE \
'createRide|create\(|rides\.push|createRequest|createRide\(' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "6. ALL RIDE READ PATHS"
echo "============================================================"

grep -RInE \
'findById|all\(\)|getRide|getRides|read\(\).*rides|rides\.find|rides\.filter' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "7. ALL RIDE UPDATE / STATE MUTATION PATHS"
echo "============================================================"

grep -RInE \
'updateRide|repository\.update|repository\.accept|transition\(|updateStatus|status\s*=|status:' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "8. ALL RIDE REPOSITORIES / STORES"
echo "============================================================"

find backend \
-type f \
\( -iname '*ride*repository*.js' \
-o -iname '*ride*store*.js' \
-o -iname '*ride*engine*.js' \
-o -iname '*ride*lifecycle*.js' \) \
| sort

echo
echo "============================================================"
echo "9. ALL RIDE REPOSITORY IMPORTS"
echo "============================================================"

grep -RInE \
'require\(["'\''][^"'\'']*(ride_repository|rideRepository|ride_store|ride_engine|ride_lifecycle)' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "10. ALL RIDE STORAGE FILES"
echo "============================================================"

find backend \
-type f \
\( -name 'rides.json' \
-o -name 'cablink_db.json' \
-o -name 'dispatch_requests.json' \
-o -name 'live_rides.json' \
-o -name 'ride_events.json' \
-o -name 'economy_ledger.json' \) \
-print \
-exec sh -c 'echo "--- $1"; wc -c "$1"' _ {} \;

echo
echo "============================================================"
echo "11. ALL DIRECT FILESYSTEM RIDE WRITES"
echo "============================================================"

grep -RInE \
'writeFileSync|writeFile|appendFileSync|mkdirSync' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "12. ALL RIDE ARRAY MUTATIONS"
echo "============================================================"

grep -RInE \
'rides\.push|rides\[.*\]\s*=|rides\.splice|rides\.filter|rides\.map' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "13. FRONTEND → BACKEND API CONTRACTS"
echo "============================================================"

grep -RInE \
'fetch\(|axios\.|api\(' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "============================================================"
echo "14. ALL FRONTEND RIDE API PATHS"
echo "============================================================"

grep -RInE \
'["'\'']?/api/(rides|ride|dispatch|drivers|driver|economy|rewards)' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "============================================================"
echo "15. ALL BACKEND HTTP API PATHS"
echo "============================================================"

grep -RInE \
'router\.(get|post|patch|put|delete)|app\.(get|post|patch|put|delete)' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "16. RIDE API PATH MISMATCH CHECK"
echo "============================================================"

echo "--- FRONTEND /api/rides ---"
grep -RInE \
'["'\'']/api/rides' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "--- FRONTEND /api/ride ---"
grep -RInE \
'["'\'']/api/ride/' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "--- BACKEND /api/rides ---"
grep -RInE \
'["'\'']/api/rides|router\.(get|post|patch).*rides' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "--- BACKEND /api/ride ---"
grep -RInE \
'["'\'']/api/ride|router\.(get|post|patch).*ride' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "17. DISPATCH AUTHORITY GRAPH"
echo "============================================================"

grep -RInE \
'dispatchService|dispatchEngine|matchingService|driver_matching|ride_dispatch_bridge|/dispatch/' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "18. COMPLETION AUTHORITY GRAPH"
echo "============================================================"

grep -RInE \
'completeRide|completeRideById|COMPLETED|completion|ride_completion' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "19. ECONOMY / REWARD AUTHORITY GRAPH"
echo "============================================================"

grep -RInE \
'canonical_reward|rewardService|economy_ledger|wallet_service|reward_engine|thb_|THB_REWARD|recordReward' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "20. FIRESTORE / PRODUCTION DATABASE CONNECTION GRAPH"
echo "============================================================"

grep -RInE \
'production/database_adapter|firestore_adapter|Firestore|firestore\.read|firestore\.write' \
backend \
--include='*.js' \
--exclude-dir=testing \
2>/dev/null

echo
echo "============================================================"
echo "21. CHECK WHETHER CANONICAL REPOSITORY USES PRODUCTION DB"
echo "============================================================"

echo "--- canonical/ride_repository.js ---"
sed -n '1,240p' backend/canonical/ride_repository.js 2>/dev/null

echo
echo "--- production/database_adapter.js ---"
sed -n '1,180p' backend/production/database_adapter.js 2>/dev/null

echo
echo "--- firestore_adapter.js ---"
sed -n '1,240p' backend/firebase/firestore_adapter.js 2>/dev/null

echo
echo "============================================================"
echo "22. CANONICAL RIDE ENGINE"
echo "============================================================"

sed -n '1,280p' backend/canonical/ride_engine.js 2>/dev/null

echo
echo "============================================================"
echo "23. RIDE ROUTE"
echo "============================================================"

sed -n '1,330p' backend/routes/rides.js 2>/dev/null

echo
echo "============================================================"
echo "24. RIDE COMPLETION SERVICE"
echo "============================================================"

sed -n '1,360p' backend/services/ride_completion_service.js 2>/dev/null

echo
echo "============================================================"
echo "25. SERVER RUNTIME"
echo "============================================================"

echo "--- backend/server.js ---"
sed -n '1,260p' backend/server.js 2>/dev/null

echo
echo "--- backend/server/app.js ---"
sed -n '1,260p' backend/server/app.js 2>/dev/null

echo
echo "============================================================"
echo "26. ACTIVE NODE PROCESSES"
echo "============================================================"

ps -ef | grep '[n]ode' 2>/dev/null

echo
echo "============================================================"
echo "27. PACKAGE / START COMMANDS"
echo "============================================================"

cat package.json 2>/dev/null

echo
echo "============================================================"
echo "28. FINAL AUTHORITY CANDIDATES"
echo "============================================================"

echo
echo "RIDE AUTHORITY CANDIDATES:"
printf '%s\n' \
"  backend/canonical/ride_engine.js" \
"  backend/canonical/ride_repository.js" \
"  backend/database/ride_repository.js" \
"  backend/database/rideRepository.js" \
"  backend/ride_store.js" \
"  backend/services/ride_service.js" \
"  backend/services/ride_orchestrator_service.js" \
"  backend/services/ride_state_service.js" \
"  backend/rides/ride_engine.js" \
"  backend/rides/ride_state_engine.js" \
"  backend/ride_api_patch.js"

echo
echo "DATABASE AUTHORITY CANDIDATES:"
printf '%s\n' \
"  backend/canonical/ride_repository.js" \
"  backend/database/ride_repository.js" \
"  backend/database/rideRepository.js" \
"  backend/storage/database.js" \
"  backend/production/database_adapter.js" \
"  backend/firebase/firestore_adapter.js"

echo
echo "REWARD AUTHORITY CANDIDATES:"
printf '%s\n' \
"  backend/services/canonical_reward_service.js" \
"  backend/services/reward_service.js" \
"  backend/rewards/reward_engine.js" \
"  backend/rewards/thb_claim_engine.js" \
"  backend/rewards/thb_service.js" \
"  backend/rewards/delivery_reward_engine.js" \
"  backend/rewards/delivery_reward_service.js"

echo
echo "============================================================"
echo "AUDIT COMPLETE"
echo "============================================================"
echo "IMPORTANT:"
echo "This audit is READ-ONLY."
echo "No production files were modified."
echo
echo "NEXT STEP:"
echo "Paste the COMPLETE output back into the conversation."
echo "We will build the final runtime data-flow map before changing"
echo "or deleting any architecture files."
echo "============================================================"

