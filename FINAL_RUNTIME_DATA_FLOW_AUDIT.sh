#!/usr/bin/env bash

echo "============================================================"
echo "CABLINK — FINAL RUNTIME DATA-FLOW AUDIT"
echo "READ-ONLY — NO FILES WILL BE MODIFIED"
echo "============================================================"

echo
echo "============================================================"
echo "1. SERVER ENTRY"
echo "============================================================"
sed -n '1,220p' backend/server.js

echo
echo "============================================================"
echo "2. EXPRESS APPLICATION"
echo "============================================================"
sed -n '1,320p' backend/server/app.js

echo
echo "============================================================"
echo "3. CANONICAL RIDE ROUTE"
echo "============================================================"
sed -n '1,360p' backend/routes/rides.js

echo
echo "============================================================"
echo "4. CANONICAL RIDE ENGINE"
echo "============================================================"
sed -n '1,360p' backend/canonical/ride_engine.js

echo
echo "============================================================"
echo "5. CANONICAL RIDE REPOSITORY"
echo "============================================================"
sed -n '1,360p' backend/canonical/ride_repository.js

echo
echo "============================================================"
echo "6. RIDE COMPLETION ROUTES"
echo "============================================================"
sed -n '1,360p' backend/routes/completion_api.js

echo
echo "============================================================"
echo "7. RIDE COMPLETION SERVICE"
echo "============================================================"
sed -n '1,420p' backend/services/ride_completion_service.js

echo
echo "============================================================"
echo "8. DISPATCH ROUTES"
echo "============================================================"
sed -n '1,360p' backend/routes/dispatch_api.js

echo
echo "============================================================"
echo "9. DISPATCH SERVICE"
echo "============================================================"
sed -n '1,360p' backend/services/dispatch_service.js 2>/dev/null || true

echo
echo "============================================================"
echo "10. DRIVER MATCHING SERVICE"
echo "============================================================"
sed -n '1,360p' backend/services/driver_matching_service.js 2>/dev/null || true

echo
echo "============================================================"
echo "11. DISPATCH ENGINE"
echo "============================================================"
sed -n '1,360p' backend/dispatch/dispatch_engine.js 2>/dev/null || true

echo
echo "============================================================"
echo "12. RIDE-DISPATCH BRIDGE"
echo "============================================================"
sed -n '1,360p' backend/services/ride_dispatch_bridge.js 2>/dev/null || true

echo
echo "============================================================"
echo "13. REWARD SERVICE"
echo "============================================================"
sed -n '1,420p' backend/services/canonical_reward_service.js

echo
echo "============================================================"
echo "14. ECONOMY LEDGER"
echo "============================================================"
sed -n '1,360p' backend/services/economy_ledger_service.js

echo
echo "============================================================"
echo "15. WALLET SERVICE"
echo "============================================================"
sed -n '1,360p' backend/rewards/wallet_service.js

echo
echo "============================================================"
echo "16. REWARD CLAIM ENGINE"
echo "============================================================"
sed -n '1,360p' backend/rewards/thb_claim_engine.js

echo
echo "============================================================"
echo "17. BLOCKCHAIN EXECUTOR"
echo "============================================================"
sed -n '1,360p' backend/blockchain/thb_real_executor.js

echo
echo "============================================================"
echo "18. FIRESTORE ADAPTER"
echo "============================================================"
sed -n '1,360p' backend/firebase/firestore_adapter.js

echo
echo "============================================================"
echo "19. PRODUCTION DATABASE ADAPTER"
echo "============================================================"
sed -n '1,360p' backend/production/database_adapter.js

echo
echo "============================================================"
echo "20. ALL RIDE STATE WRITERS"
echo "============================================================"
grep -RInE \
'createRide|acceptRide|transition\(|completeRideById|repository\.create|repository\.update|repository\.accept|\.set\(|firestore\.write|database_adapter|rides\.json' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
2>/dev/null

echo
echo "============================================================"
echo "21. ALL RIDE API ROUTES"
echo "============================================================"
grep -RInE \
'router\.(get|post|patch|put|delete)|app\.(get|post|patch|put|delete)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
2>/dev/null | grep -E 'ride|dispatch|complete|accept'

echo
echo "============================================================"
echo "22. ALL RIDE REPOSITORY IMPORTS"
echo "============================================================"
grep -RInE \
'require\(["'\''].*(ride_repository|ride_store|rideRepository)|from ["'\''].*(ride_repository|ride_store|rideRepository)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
2>/dev/null

echo
echo "============================================================"
echo "23. ALL FIRESTORE / DATABASE IMPORTS"
echo "============================================================"
grep -RInE \
'require\(["'\''].*(database_adapter|firestore_adapter)|from ["'\''].*(database_adapter|firestore_adapter)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
2>/dev/null

echo
echo "============================================================"
echo "24. ALL REWARD IMPORTS"
echo "============================================================"
grep -RInE \
'require\(["'\''].*(canonical_reward_service|reward_service|reward_engine|thb_claim_engine|thb_service|delivery_reward)' \
backend \
--include='*.js' \
--exclude-dir=node_modules \
2>/dev/null

echo
echo "============================================================"
echo "25. FRONTEND RIDE API CALLS"
echo "============================================================"
grep -RInE \
'fetch\(|axios|api\(' \
frontend \
--include='*.js' \
--include='*.jsx' \
--include='*.html' \
2>/dev/null | grep -E '/api/ride|/api/rides|/api/dispatch|complete|accept'

echo
echo "============================================================"
echo "26. PACKAGE RUNTIME"
echo "============================================================"
cat package.json

echo
echo "============================================================"
echo "27. ACTIVE NODE PROCESSES"
echo "============================================================"
ps aux | grep -E '[n]ode|[v]ite'

echo
echo "============================================================"
echo "28. FINAL RUNTIME DATA-FLOW AUDIT COMPLETE"
echo "============================================================"
echo "NO FILES WERE MODIFIED."
echo "============================================================"
