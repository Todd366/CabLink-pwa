#!/usr/bin/env bash

set +e

echo "============================================================"
echo "CABLINK — AUTHORITY RESOLUTION AUDIT"
echo "============================================================"
echo "READ-ONLY — NO FILES WILL BE MODIFIED"
echo "============================================================"

OUT="AUTHORITY_RESOLUTION_AUDIT.txt"

{
echo "============================================================"
echo "CABLINK — AUTHORITY RESOLUTION AUDIT"
echo "============================================================"
echo "DATE: $(date)"
echo "ROOT: $(pwd)"
echo "============================================================"

echo
echo "============================================================"
echo "1. SERVER ENTRY + MOUNTED ROUTES"
echo "============================================================"

echo "--- backend/server.js ---"
sed -n '1,240p' backend/server.js 2>/dev/null

echo
echo "--- backend/server/app.js ---"
sed -n '1,320p' backend/server/app.js 2>/dev/null

echo
echo "============================================================"
echo "2. CANONICAL RIDE CREATION PATH"
echo "============================================================"

echo "--- frontend ride creation calls ---"
grep -RInE \
'fetch\(["'\'']/api/rides|api\(["'\'']/api/rides|axios.*\/api\/rides' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "--- backend ride creation imports ---"
grep -RInE \
'rideEngine\.createRide|createRide\(|canonical/ride_engine|routes/rides' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- canonical ride engine ---"
sed -n '1,280p' backend/canonical/ride_engine.js 2>/dev/null

echo
echo "--- canonical ride repository ---"
sed -n '1,300p' backend/canonical/ride_repository.js 2>/dev/null

echo
echo "============================================================"
echo "3. RIDE ID GENERATION + ID RELATIONSHIPS"
echo "============================================================"

echo "--- all ride/request ID generators ---"
grep -RInE \
'"RIDE-"|"REQ-"|"TX-"|"CLAIM-"|id[[:space:]]*:' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- ride ID references across backend ---"
grep -RInE \
'rideId|requestId|req\.params\.id|req\.body\.rideId|req\.body\.id' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- ride ID references across frontend ---"
grep -RInE \
'rideId|requestId|/api/rides/|/api/dispatch/' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "============================================================"
echo "4. DISPATCH CREATION → RIDE RELATIONSHIP"
echo "============================================================"

echo "--- dispatch routes ---"
sed -n '1,320p' backend/routes/dispatch_api.js 2>/dev/null

echo
echo "--- dispatch service ---"
sed -n '1,320p' backend/services/dispatch_service.js 2>/dev/null

echo
echo "--- ride-dispatch bridge ---"
sed -n '1,260p' backend/services/ride_dispatch_bridge.js 2>/dev/null

echo
echo "--- dispatch engine ---"
sed -n '1,260p' backend/dispatch/dispatch_engine.js 2>/dev/null

echo
echo "--- driver matching service ---"
sed -n '1,320p' backend/services/driver_matching_service.js 2>/dev/null

echo
echo "============================================================"
echo "5. ALL DISPATCH SERVICE IMPORTS"
echo "============================================================"

grep -RInE \
'require\(["'\''].*dispatch_service|dispatchService\.|dispatchService|dispatchRide\(' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "6. DRIVER ACCEPTANCE AUTHORITY"
echo "============================================================"

echo "--- canonical acceptance references ---"
grep -RInE \
'acceptRide|PATCH.*accept|/accept|DRIVER_ASSIGNED|ALREADY_ACCEPTED' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- dispatch acceptance references ---"
grep -RInE \
'dispatch\.accept|function accept|status.*ACCEPTED|driver.*=' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- frontend acceptance calls ---"
grep -RInE \
'/api/rides/.*/accept|/api/dispatch/accept|acceptRide|accept' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "============================================================"
echo "7. COMPLETE DRIVER LIFECYCLE"
echo "============================================================"

grep -RInE \
'DRIVER_ASSIGNED|DRIVER_ARRIVED|PICKED_UP|STARTED|COMPLETED|CANCELLED' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "--- all transition writers ---"
grep -RInE \
'transition\(|status[[:space:]]*=[[:space:]]*["'\''](DRIVER_ASSIGNED|DRIVER_ARRIVED|PICKED_UP|STARTED|COMPLETED|CANCELLED)|status:[[:space:]]*["'\''](DRIVER_ASSIGNED|DRIVER_ARRIVED|PICKED_UP|STARTED|COMPLETED|CANCELLED)' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "8. COMPLETION RUNTIME PATH"
echo "============================================================"

echo "--- completion routes ---"
sed -n '1,380p' backend/routes/completion_api.js 2>/dev/null

echo
echo "--- completion service ---"
sed -n '1,420p' backend/services/ride_completion_service.js 2>/dev/null

echo
echo "--- completion frontend calls ---"
grep -RInE \
'/complete|completeRide|COMPLETED' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null

echo
echo "============================================================"
echo "9. ECONOMY LEDGER CONNECTION"
echo "============================================================"

echo "--- economy ledger service ---"
sed -n '1,360p' backend/services/economy_ledger_service.js 2>/dev/null

echo
echo "--- all economy ledger imports ---"
grep -RInE \
'economy_ledger_service|recordRide|recordReward|economy_ledger\.json' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "10. REWARD AUTHORITY CONNECTION"
echo "============================================================"

echo "--- canonical reward service ---"
sed -n '1,380p' backend/services/canonical_reward_service.js 2>/dev/null

echo
echo "--- all reward imports ---"
grep -RInE \
'canonical_reward_service|reward_service|reward_engine|thb_claim_engine|thb_service|delivery_reward_engine|delivery_reward_service' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "11. REWARD AMOUNT FIELD AUDIT"
echo "============================================================"

grep -RInE \
'amount[[:space:]]*=|amount:|fare.*0\.05|THB_REWARD|reward.*amount' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "12. CLAIM PIPELINE"
echo "============================================================"

echo "--- reward API ---"
sed -n '1,320p' backend/api/reward_api.js 2>/dev/null

echo
echo "--- claim engine ---"
sed -n '1,360p' backend/rewards/thb_claim_engine.js 2>/dev/null

echo
echo "--- claim engine imports ---"
grep -RInE \
'thb_claim_engine|requestClaim|completeClaim|CLAIM_COMPLETED|READY_FOR_TRANSFER' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "13. BLOCKCHAIN EXECUTION PIPELINE"
echo "============================================================"

echo "--- blockchain executor ---"
sed -n '1,320p' backend/blockchain/thb_real_executor.js 2>/dev/null

echo
echo "--- blockchain executor imports ---"
grep -RInE \
'thb_real_executor|executeTransfer|SUBMITTED|SIMULATION|CONTRACT_ADDRESS|PRIVATE_KEY' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "14. REWARD → CLAIM → BLOCKCHAIN BRIDGE SEARCH"
echo "============================================================"

grep -RInE \
'createRewardForCompletedRide|requestClaim|completeClaim|executeTransfer|THB_REWARD|CLAIM_COMPLETED|blockchain_transactions' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "15. FIRESTORE RUNTIME CONNECTION"
echo "============================================================"

echo "--- production database adapter ---"
sed -n '1,260p' backend/production/database_adapter.js 2>/dev/null

echo
echo "--- firestore adapter ---"
sed -n '1,360p' backend/firebase/firestore_adapter.js 2>/dev/null

echo
echo "--- all production database imports ---"
grep -RInE \
'production/database_adapter|firestore_adapter|firebase-admin|Firestore|firestore\.' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "16. CANONICAL REPOSITORY → PRODUCTION DB CHECK"
echo "============================================================"

echo "--- canonical repository imports ---"
grep -nE \
'require\(' \
backend/canonical/ride_repository.js \
2>/dev/null

echo
echo "--- canonical repository persistence targets ---"
grep -nE \
'FILE|DATA_DIR|readFileSync|writeFileSync|firestore|database_adapter' \
backend/canonical/ride_repository.js \
2>/dev/null

echo
echo "============================================================"
echo "17. ALL RIDE REPOSITORY IMPORTS"
echo "============================================================"

grep -RInE \
'require\(["'\''].*ride_repository|require\(["'\''].*rideRepository|require\(["'\''].*ride_store|rideRepository|ridesRepository' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "18. ALL RIDE STATE WRITERS"
echo "============================================================"

grep -RInE \
'createRide\(|transition\(|update\(|acceptRide\(|accept\(|status[[:space:]]*=' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "19. ALL RIDE API ROUTES"
echo "============================================================"

grep -RInE \
'router\.(get|post|patch|put|delete)|app\.(get|post|patch|put|delete)' \
backend \
--include='*.js' \
2>/dev/null

echo
echo "============================================================"
echo "20. ALL FRONTEND API ENDPOINTS"
echo "============================================================"

grep -RhoE \
'["'\'']/api/[^"'\'']+' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null \
| sort -u

echo
echo "============================================================"
echo "21. LEGACY RIDE SYSTEMS"
echo "============================================================"

for f in \
backend/database/ride_repository.js \
backend/database/rideRepository.js \
backend/ride_store.js \
backend/services/ride_service.js \
backend/services/ride_orchestrator_service.js \
backend/services/ride_state_service.js \
backend/rides/ride_engine.js \
backend/rides/ride_state_engine.js \
backend/ride_api_patch.js \
backend/routes/ride_state_api.js \
backend/routes/orchestrator_api.js \
backend/routes/live_ride_api.js \
backend/services/live_ride_service.js
do
    if [ -f "$f" ]; then
        echo
        echo "------------------------------------------------------------"
        echo "$f"
        echo "------------------------------------------------------------"
        grep -nE \
        'require\(|module\.exports|createRide|update|transition|status|writeFile|readFile|router\.|app\.' \
        "$f" \
        2>/dev/null
    fi
done

echo
echo "============================================================"
echo "22. PACKAGE RUNTIME"
echo "============================================================"

cat package.json 2>/dev/null

echo
echo "============================================================"
echo "23. ACTIVE NODE PROCESSES"
echo "============================================================"

ps aux | grep -E '[n]ode|[v]ite' 2>/dev/null

echo
echo "============================================================"
echo "24. DATA FILES"
echo "============================================================"

find backend/data backend/database \
-type f \
-maxdepth 3 \
2>/dev/null \
| sort

echo
echo "============================================================"
echo "25. DATA FILE CONTENT SUMMARY"
echo "============================================================"

for f in \
backend/data/rides.json \
backend/data/dispatch_requests.json \
backend/data/economy_ledger.json \
backend/data/drivers_live.json \
backend/database/rides.json
do
    if [ -f "$f" ]; then
        echo
        echo "------------------------------------------------------------"
        echo "$f"
        echo "------------------------------------------------------------"
        wc -c "$f"
        head -c 2000 "$f"
        echo
    fi
done

echo
echo "============================================================"
echo "26. FINAL AUTHORITY QUESTIONS"
echo "============================================================"

echo
echo "RIDE AUTHORITY:"
echo "  Canonical API: backend/routes/rides.js"
echo "  Canonical engine: backend/canonical/ride_engine.js"
echo "  Canonical repository: backend/canonical/ride_repository.js"

echo
echo "DATABASE AUTHORITY:"
echo "  Canonical ride storage currently appears to be:"
echo "  backend/data/rides.json"

echo
echo "FIRESTORE:"
echo "  Exists through production/database_adapter.js"
echo "  Must verify whether any live ride runtime imports it."

echo
echo "DISPATCH AUTHORITY:"
echo "  dispatch_api.js"
echo "  dispatch_service.js"
echo "  Must verify bridge to canonical ride lifecycle."

echo
echo "ACCEPTANCE AUTHORITY:"
echo "  canonical ride acceptance:"
echo "  rideEngine.acceptRide()"
echo
echo "  dispatch acceptance:"
echo "  dispatch.accept()"
echo
echo "  Must verify whether both mutate the same ride."

echo
echo "COMPLETION AUTHORITY:"
echo "  ride_completion_service.js"

echo
echo "REWARD AUTHORITY:"
echo "  canonical_reward_service.js"

echo
echo "CLAIM AUTHORITY:"
echo "  thb_claim_engine.js"

echo
echo "BLOCKCHAIN AUTHORITY:"
echo "  thb_real_executor.js"

echo
echo "============================================================"
echo "END OF AUTHORITY RESOLUTION AUDIT"
echo "============================================================"
echo "NO FILES WERE MODIFIED."
echo "============================================================"

} | tee "$OUT"

echo
echo "============================================================"
echo "AUDIT SAVED"
echo "============================================================"
echo "$OUT"
echo "============================================================"
