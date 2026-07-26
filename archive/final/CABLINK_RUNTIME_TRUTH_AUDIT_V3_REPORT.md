# CABLINK RUNTIME TRUTH & CANONICAL ARCHITECTURE AUDIT v3

Generated: 2026-07-25T16:41:29.565Z
Repository: /data/data/com.termux/files/home/CabLink-pwa
Mode: READ-ONLY

> This audit attempts to determine what CabLink actually runs, what connects, and where canonical ownership is unresolved. It does not modify application source files.

## EXECUTIVE SUMMARY
- Files scanned: **1295**
- HTML entry candidates: **36**
- Backend server candidates: **7**
- Backend route definitions detected: **311**
- Frontend API calls detected: **270**
- Frontend API calls with detected matches: **266**
- Frontend API calls without detected matches: **4**
- Ride state-machine candidates: **22**
- Fare-related implementations: **14**
- Duplicate functions across files: **255**

## CANONICALITY SCORES
- Frontend ↔ Backend API Match: **99%**
- Build Readiness: **75%**
- Architecture Integrity Heuristic: **0%**

## CANONICAL FRONTEND CANDIDATES
- frontend/main.jsx — score 3
- frontend/index.html — score 2
- frontend/App.jsx — score 1
- index.html — score 1
- launcher.html — score 0

**Highest-scoring frontend candidate:** frontend/main.jsx

## CANONICAL BACKEND CANDIDATES
- archive/before_architecture_cleanup/backend_1784127601/server.js — score 5
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/backend/server.js — score 5
- backend/server.js — score 5
- archive/before_architecture_cleanup/backend_1784127601/server/app.js — score 3
- backend/server/app.js — score 3
- archive/before_architecture_cleanup/backend_1784127601/server/index.js — score 1
- backend/server/index.js — score 1
- api/index.js — score 0
- archive/before_architecture_cleanup/frontend_1784127601/js/app.js — score 0
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/frontend/js/app.js — score 0
- backend/socket/server_socket.js — score 0
- frontend/js/app.js — score 0
- migration_backup/frontend/js/app.js — score 0

**Highest-scoring backend candidate:** archive/before_architecture_cleanup/backend_1784127601/server.js

## HTML ENTRYPOINT INVENTORY
### archive/before_architecture_cleanup/frontend_1784127601/index.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 6

### archive/before_architecture_cleanup/index_1784127601.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app.js, frontend/js/core.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### archive/driver_upgrade/index_before_driver_upgrade_1784126025.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app.js, frontend/js/core.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### archive/driver_wiring/index_1784128009669.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 7

### archive/frontend_cleanup/index_before_bookride_migration_1784131014.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 9

### archive/frontend_cleanup/index_before_cleanup_1784131327228.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 9

### archive/frontend_cleanup/index_before_truth_bookride_1784131157245.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 9

### archive/frontend_cleanup/index_before_truth_migration.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 8

### archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/index.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js
- Inline scripts: 1

### archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/launcher.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: NONE
- Inline scripts: 1

### archive/old_backups/index_backup_before_cleanup_1783943720472.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, frontend/js/app.js, frontend/js/core.js, frontend/js/core.js
- Inline scripts: 2

### archive/old_backups/index_stable_backup_1784017647536.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911
- Inline scripts: 1

### archive/old_backups/index_stable_backup_1784017709341.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, role.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911
- Inline scripts: 1

### archive/old_backups/index_stable_backup_1784026555127.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911, role.js?v=1784018514838
- Inline scripts: 1

### archive/phase_scripts/index_backup_before_bookride_cleanup.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 6

### archive/phase_scripts/index_backup_before_driver_override_remove.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 4

### archive/phase_scripts/index_backup_before_real_engine.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 5

### archive/phase_scripts/index_backup_before_runtime_merge.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 6

### archive/phase_scripts/index_react_backup.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js
- Inline scripts: 1

### archive/server_conflicts/index_before_api_fix_1784125371.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app.js, frontend/js/core.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### archive/truth_cleanup_1784127676771/frontend_index.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 6

### frontend/index.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 10

### index.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app_core.js, role.js, fix.js, fare_engine.js, frontend/js/rides/rideStateMachine.js, frontend/js/rides/passengerRideStatus.js, frontend/js/driver/driverLifecycleControls.js, frontend/js/rides/completionRewardBridge.js
- Inline scripts: 2

### launcher.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: NONE
- Inline scripts: 1

### migration_backup/frontend/index.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: /main.jsx
- Inline scripts: 0

### migration_backup/index_legacy.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_booking_migration.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app.js, frontend/js/core.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_bookride_cleanup.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, frontend/js/app.js, frontend/js/core.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_bstm_mount.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, fare_engine.js, frontend/js/ride_engine.js, frontend/js/operations_core.js, frontend/js/financial_intelligence.js, frontend/js/simulation_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784018514838
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_module_cleanup.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_reality_cutover.html
- Root/App mount: YES
- React/Vite indicators: YES
- Module scripts: /main.jsx
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, /main.jsx
- Inline scripts: 5

### scripts/archive/root_migrations/index_before_role_auto_cleanup.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911, role.js?v=1784018514838
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_role_cleanup.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911, role.js?v=1784018514838
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_role_fix_1784018514824.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, role.js, fix.js, fare_engine.js, frontend/js/app.js?v=1784017559907, frontend/js/core.js?v=1784017559911, role.js?v=1784017559911
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_script_repair_1784017559902.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1

### scripts/archive/root_migrations/index_before_script_restore.html
- Root/App mount: YES
- React/Vite indicators: NO
- Module scripts: NONE
- Local scripts: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js, https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js, role.js, fix.js, fare_engine.js
- Inline scripts: 1


## BACKEND SERVER CANDIDATES
### archive/before_architecture_cleanup/backend_1784127601/server/app.js
- Express detected: true
- Server listen detected: false
- Ports/arguments: UNKNOWN
- Mounted prefixes: /api/rides, /api/users

### archive/before_architecture_cleanup/backend_1784127601/server/index.js
- Express detected: false
- Server listen detected: true
- Ports/arguments: PORT
- Mounted prefixes: NONE DETECTED

### archive/before_architecture_cleanup/backend_1784127601/server.js
- Express detected: true
- Server listen detected: true
- Ports/arguments: PORT
- Mounted prefixes: NONE DETECTED

### archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/backend/server.js
- Express detected: true
- Server listen detected: true
- Ports/arguments: PORT
- Mounted prefixes: NONE DETECTED

### backend/server/app.js
- Express detected: true
- Server listen detected: false
- Ports/arguments: UNKNOWN
- Mounted prefixes: /api/rides, /api/users

### backend/server/index.js
- Express detected: false
- Server listen detected: true
- Ports/arguments: PORT
- Mounted prefixes: NONE DETECTED

### backend/server.js
- Express detected: true
- Server listen detected: true
- Ports/arguments: PORT
- Mounted prefixes: NONE DETECTED


## UNMATCHED FRONTEND API CALLS
- ❌ GET/POST? /api/ecosystem/tasks — archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- ❌ GET/POST? /api/ecosystem/tasks/ — archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- ❌ GET/POST? /api/dispatch/requests — frontend/js/driver/driverDispatchBridge.js
- ❌ GET/POST? /api/dispatch/requests — scripts/archive/root_migrations/cablink_live_dispatch_bridge_install.js

## RIDE STATE MACHINE FORENSICS
### archive/before_architecture_cleanup/backend_1784127601/rides/ride_engine.js
States: REQUESTED, DRIVER_ACCEPTED, COMPLETED, CANCELLED

### archive/before_architecture_cleanup/backend_1784127601/rides/ride_lifecycle.js
States: REQUESTED

### archive/before_architecture_cleanup/backend_1784127601/rides/ride_state_engine.js
States: REQUESTED, DRIVER_ACCEPTED, COMPLETED

### archive/before_architecture_cleanup/backend_1784127601/services/rideService.js
States: COMPLETED

### archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
States: DRIVER_ASSIGNED, DRIVER_ARRIVED

### archive/before_architecture_cleanup/frontend_1784127601/js/ride_engine.js
States: REQUESTED, SEARCHING_DRIVER, DRIVER_ACCEPTED

### archive/phase_scripts/cablink_fix_orchestrator_identity.js
States: DRIVER_ASSIGNED

### archive/phase_scripts/cablink_phase51_orchestrator.js
States: DRIVER_ASSIGNED, DRIVER_ARRIVED

### archive/phase_scripts/install_ride_engine.js
States: REQUESTED, SEARCHING_DRIVER, DRIVER_ACCEPTED

### backend/rides/ride_engine.js
States: REQUESTED, DRIVER_ACCEPTED, COMPLETED, CANCELLED

### backend/rides/ride_lifecycle.js
States: REQUESTED

### backend/rides/ride_state_engine.js
States: REQUESTED, DRIVER_ACCEPTED, COMPLETED

### backend/services/rideService.js
States: COMPLETED

### backend/services/ride_orchestrator_service.js
States: DRIVER_ASSIGNED, DRIVER_ARRIVED

### frontend/js/driver/driverLifecycleControls.js
States: COMPLETED

### frontend/js/ride_engine.js
States: REQUESTED, SEARCHING_DRIVER, DRIVER_ACCEPTED

### frontend/js/rides/rideStateMachine.js
States: REQUESTED, COMPLETED, CANCELLED

### migration_backup/frontend/js/ride_engine.js
States: REQUESTED, SEARCHING_DRIVER, DRIVER_ACCEPTED

### scripts/archive/root_migrations/cablink_driver_lifecycle_controls_install.js
States: COMPLETED

### scripts/archive/root_migrations/cablink_passenger_state_listener_install.js
States: REQUESTED

### scripts/archive/root_migrations/cablink_ride_state_machine_install.js
States: REQUESTED, COMPLETED, CANCELLED

### scripts/archive/root_migrations/ride_engine_before_booking_merge.js
States: REQUESTED, SEARCHING_DRIVER, DRIVER_ACCEPTED


## FARE ENGINE FORENSICS
- archive/before_architecture_cleanup/frontend_1784127601/js/fare_engine.js — calculateFare, fare, baseFare, fuel, petrol
- archive/phase_scripts/cablink_driver_profit_audit.js — calculateFare, fare, fuel
- archive/phase_scripts/cablink_fare_test.js — calculateFare, fare, fuel
- archive/phase_scripts/cablink_final_intelligence_audit.js — calculateFare, fare, fuel
- archive/phase_scripts/cablink_final_release_engine.js — calculateFare, fare
- archive/phase_scripts/cablink_flow_audit.js — calculateFare, fare
- archive/phase_scripts/cablink_market_fare_audit.js — calculateFare, fare
- archive/phase_scripts/cablink_money_flow_audit.js — calculateFare, fare
- cablink_forensic_audit_v2.js — calculateFare, calcTotalFare, fare, baseFare, fuel, petrol, commission
- cablink_full_audit.js — calculateFare, calcTotalFare, fare
- cablink_runtime_truth_audit_v3.js — calculateFare, calcTotalFare, fare, distanceRate, baseFare, fuel, petrol, commission
- fare_engine.js — calculateFare, fare, baseFare, fuel, petrol
- frontend/js/fare_engine.js — calculateFare, fare, baseFare, fuel, petrol
- scripts/archive/root_migrations/cablink_financial_test.js — calculateFare, fare

## DATABASE / STORAGE FORENSICS
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transaction_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transfer_worker.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/cloud/cloud_adapter.js — /firebase/i, /supabase/i, /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/config/environment_validator.js — /firebase/i, /database/i
- archive/before_architecture_cleanup/backend_1784127601/database/rideRepository.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/before_architecture_cleanup/backend_1784127601/location/gps_event_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/onboarding/onboarding_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_transaction_layer.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/payments/transaction_recorder.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_claim_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_service.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_transfer_queue.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_persistence.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/routes/rides.js — /database/i, /repository/i
- archive/before_architecture_cleanup/backend_1784127601/routes/users.js — /database/i, /repository/i
- archive/before_architecture_cleanup/backend_1784127601/security/security_audit.js — /firebase/i, /database/i
- archive/before_architecture_cleanup/backend_1784127601/server.js — /firebase/i, /database/i, /repository/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/identity_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/passenger_intelligence_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/rideService.js — /database/i, /repository/i
- archive/before_architecture_cleanup/backend_1784127601/services/ride_event_service.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js — /database/i, /repository/i
- archive/before_architecture_cleanup/backend_1784127601/services/ride_state_service.js — /database/i, /repository/i
- archive/before_architecture_cleanup/backend_1784127601/storage/database.js — /readFileSync/i, /writeFileSync/i
- archive/before_architecture_cleanup/backend_1784127601/users/user_account_engine.js — /database/i, /store/i
- archive/before_architecture_cleanup/backend_1784127601/users/wallet_manager.js — /database/i, /store/i
- archive/before_architecture_cleanup/frontend_1784127601/js/firebase.js — /firebase/i, /firestore/i, /store/i
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js — /firebase/i, /firestore/i, /store/i
- archive/driver_upgrade/server_before_driver_upgrade_1784126025.js — /firebase/i, /database/i, /repository/i, /store/i
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/backend/server.js — /firebase/i, /firestore/i, /store/i
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js — /firebase/i, /firestore/i, /store/i
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/frontend/js/firebase.js — /firebase/i, /firestore/i, /store/i
- archive/phase_scripts/CABLINK_DEPENDENCY_GRAPH.json — /firebase/i, /store/i
- archive/phase_scripts/CABLINK_REACT_MIGRATION_PLAN.json — /firebase/i, /store/i
- archive/phase_scripts/autofix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_audit_now.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_backend_route_injector.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_beta_launch_engine.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_bookride_backend_connector.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_bookride_cleanup.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_bstm_hub_install.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_certification_driver_test_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_command_center_storage_fix.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_component_conversion_audit.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_connect_real_dispatch.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i
- archive/phase_scripts/cablink_core_transaction_manager.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_database_persistence_test.js — /database/i, /store/i
- archive/phase_scripts/cablink_database_wiring_upgrade.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_dependency_graph.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_dispatch_activation_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_driver_dispatch_fix_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_driver_mode_reality_patch.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_engine_map.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_final_dependency_audit.js — /database/i, /store/i
- archive/phase_scripts/cablink_final_freeze_audit.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_final_human_pilot_lock_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_final_intelligence_audit.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_final_pilot_bridge_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_final_pilot_readiness_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_final_production_gatekeeper_v2.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_final_readiness_gate.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_final_reality_layers_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_final_reality_transaction_engine.js — /readFileSync/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_final_release_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_fix_orchestrator_identity.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_fix_ride_state_identity.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_fix_server_api_imports.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_fix_state_create_order.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_force_rides_truth_endpoint.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_frontend_real_booking_bridge.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_full_reward_cycle_test.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_geo_fs_import_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_geo_report_path_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_human_pilot_control_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_human_pilot_protocol_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_kill_fake_ride_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_launch_certification_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_live_gps_foundation_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_live_network_layer_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_merge_ride_storage.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i
- archive/phase_scripts/cablink_missing_parts_completion_engine.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_missing_system_audit.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_mount_driver_online_route.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_mount_ride_api.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_persistent_pilot_database_install.js — /firebase/i, /supabase/i, /readFileSync/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i
- archive/phase_scripts/cablink_phase20_bstm_ui_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase21_marketplace_task_bridge_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_phase22_driver_task_dashboard_install.js — /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_phase24_task_route_mount_install.js — /readFileSync/i, /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_phase30_route_order_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase32_driver_dashboard_api_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase33_real_route_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase33_route_order_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase34_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase36_economy_ledger_bridge.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase37_ledger_sync_dashboard.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase37_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase39_driver_visibility_layer.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase39_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase40_live_demand_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase40_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase41_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase42_dispatch_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase42_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase46_live_ride_state.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase46_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase47_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase47_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase48_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase49_notification_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase49_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase50_fix.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase50_ride_state_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase50_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase51_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase52_driver_intelligence.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase52_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase53_identity_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase53_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase54_passenger_intelligence.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase54_route_mount.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase55_dashboard_connect.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_phase7_production_connection_install.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_pilot_command_center_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_pilot_command_center_repair.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_pilot_control_center_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_pilot_hardening_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_pilot_mission_control_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_pilot_operations_engine_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_pilot_operations_logger.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_pilot_trial_recorder_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_port_doctor.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_precision_audit.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_production_monitor.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_production_reality_completion_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_production_setup.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_production_wiring_fix.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_react_integration_audit.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_real_audit_engine.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_real_engine_replace.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_real_pilot_environment_install.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_real_world_completion_engine.js — /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js — /firebase/i, /supabase/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js — /firebase/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_bridge_phase5_install.js — /firebase/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_cutover.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/cablink_reality_hardening_engine.js — /readFileSync/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_reality_integration_engine.js — /readFileSync/i, /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_reality_runtime_bridge_install.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_remove_driver_override.js — /readFileSync/i, /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_remove_duplicate_rides_routes.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_repair_missing_server_imports.js — /readFileSync/i, /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_repair_plan.json — /firebase/i, /database/i, /repository/i
- archive/phase_scripts/cablink_ride_runtime_bridge_install.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_role_fix_v304.js — /readFileSync/i, /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_runtime_check_v305.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_runtime_syntax_doctor.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_stability_check_v303.js — /firebase/i, /readFileSync/i
- archive/phase_scripts/cablink_sync_server_imports.js — /readFileSync/i, /writeFileSync/i, /store/i
- archive/phase_scripts/cablink_sync_thb_configuration.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cablink_thb_blockchain_worker_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_thb_claim_verification_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_thb_transfer_simulator_install.js — /writeFileSync/i, /database/i, /store/i
- archive/phase_scripts/cablink_trace_repository.js — /readFileSync/i, /database/i, /repository/i
- archive/phase_scripts/cablink_unify_dispatch_storage.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i, /store/i
- archive/phase_scripts/cleanup_role_duplicate.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/cleanup_v301.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/fix_bookride.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/fix_nav_absolute.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/fix_onboarding.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/inject_role.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/install_cablink_api_layer.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/install_cablink_operational_core.js — /writeFileSync/i, /database/i
- archive/phase_scripts/install_cablink_production_monitor.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/install_cablink_production_monitor_v2.js — /readFileSync/i, /writeFileSync/i, /database/i
- archive/phase_scripts/install_financial_intelligence_v2.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/install_operations_core.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/install_ride_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/install_simulation_engine.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/mount_real_rides.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/navbar_fix.js — /readFileSync/i, /writeFileSync/i
- archive/phase_scripts/repair_scripts_v302.js — /readFileSync/i, /writeFileSync/i
- backend/blockchain/thb_transaction_engine.js — /database/i, /store/i
- backend/blockchain/thb_transfer_worker.js — /database/i, /store/i
- backend/cloud/cloud_adapter.js — /firebase/i, /supabase/i, /database/i, /store/i
- backend/config/environment_validator.js — /firebase/i, /database/i
- backend/database/rideRepository.js — /readFileSync/i, /writeFileSync/i, /database/i
- backend/location/gps_event_engine.js — /database/i, /store/i
- backend/onboarding/onboarding_engine.js — /database/i, /store/i
- backend/payments/payment_transaction_layer.js — /database/i, /store/i
- backend/payments/transaction_recorder.js — /database/i, /store/i
- backend/rewards/thb_claim_engine.js — /database/i, /store/i
- backend/rewards/thb_service.js — /database/i, /store/i
- backend/rewards/thb_transfer_queue.js — /database/i, /store/i
- backend/ride_store.js — /readFileSync/i, /writeFileSync/i
- backend/rides/ride_engine.js — /database/i, /store/i
- backend/rides/ride_persistence.js — /database/i, /store/i
- backend/routes/rides.js — /database/i, /repository/i
- backend/routes/users.js — /database/i, /repository/i
- backend/security/security_audit.js — /firebase/i, /database/i
- backend/services/dispatch_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/driver_location_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/driver_matching_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/economy_ledger_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/identity_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/live_demand_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/live_ride_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/passenger_intelligence_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/rideService.js — /database/i, /repository/i
- backend/services/ride_event_service.js — /readFileSync/i, /writeFileSync/i
- backend/services/ride_orchestrator_service.js — /database/i, /repository/i
- backend/services/ride_state_service.js — /database/i, /repository/i
- backend/storage/database.js — /readFileSync/i, /writeFileSync/i
- backend/users/user_account_engine.js — /database/i, /store/i
- backend/users/wallet_manager.js — /database/i, /store/i
- beta/human_pilot/feedback/feedback_engine.js — /readFileSync/i, /writeFileSync/i
- beta/human_pilot/participants/registry.js — /readFileSync/i, /writeFileSync/i
- beta/human_pilot/reports/pilot_summary.js — /readFileSync/i, /writeFileSync/i
- beta/live_gps/live_location_engine.js — /readFileSync/i, /writeFileSync/i
- beta/operations/event_logger.js — /readFileSync/i, /writeFileSync/i
- beta/operations/reports/daily_report.js — /readFileSync/i, /writeFileSync/i
- beta/operations/session_engine.js — /readFileSync/i, /writeFileSync/i
- beta/pilot/issues/issue_tracker.js — /readFileSync/i, /writeFileSync/i
- beta/pilot/rides/ride_registry.js — /readFileSync/i, /writeFileSync/i
- beta/pilot/users/registry.js — /readFileSync/i, /writeFileSync/i
- beta/pilot_mission/pilot_session.js — /readFileSync/i, /writeFileSync/i
- beta/pilot_mission/reports/pilot_evidence_report.js — /readFileSync/i, /writeFileSync/i
- cablink.js — /readFileSync/i, /writeFileSync/i
- cablink_forensic_audit_v2.js — /firebase/i, /firestore/i, /supabase/i, /mongoose/i, /postgres/i, /mysql/i, /sqlite/i, /readFileSync/i, /writeFileSync/i, /database/i, /repository/i, /store/i
- cablink_full_audit.js — /readFileSync/i, /writeFileSync/i
- cablink_reality_doctor.js — /readFileSync/i, /writeFileSync/i, /database/i
- cablink_runtime_truth_audit_v3.js — /firebase/i, /firestore/i, /supabase/i, /mongodb/i, /mongoose/i, /postgres/i, /mysql/i, /sqlite/i, /jsonfile/i, /readFileSync/i, /writeFileSync/i, /database/i, /repository/i, /store/i
- database/production/database_health.js — /database/i, /store/i
- database/production/store_engine.js — /readFileSync/i, /writeFileSync/i, /database/i, /store/i
- fix.js — /firebase/i, /firestore/i, /store/i
- frontend/js/firebase.js — /firebase/i, /firestore/i, /store/i
- frontend/js/fix.js — /firebase/i, /firestore/i, /store/i
- migration_backup/frontend/js/firebase.js — /firebase/i, /firestore/i, /store/i
- pilot/dashboard/pilot_status.js — /database/i, /store/i
- pilot/operations/pilot_metrics.js — /database/i, /store/i
- pilot/trials/trial_recorder.js — /database/i, /store/i
- runtime_dependency_graph.json — /firebase/i, /database/i, /store/i
- scripts/archive/root_migrations/cablink_accept_state_bridge_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_add_single_ride_read.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i
- scripts/archive/root_migrations/cablink_architecture_cleanup.js — /writeFileSync/i, /database/i, /repository/i
- scripts/archive/root_migrations/cablink_bookride_truth_migration.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_completion_finance_reward_bridge_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_connect_ride_routes.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_disable_fake_driver_requests.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_doctor.js — /mongoose/i, /sqlite/i, /readFileSync/i, /writeFileSync/i, /database/i
- scripts/archive/root_migrations/cablink_driver_bridge_repair.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_driver_lifecycle_controls_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_driver_wiring_engine.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_extract_fake_logic.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_final_deployment_cleanup.js — /readFileSync/i, /writeFileSync/i, /database/i
- scripts/archive/root_migrations/cablink_fix_driver_accept_truth.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_fix_https_readiness_check.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_fix_production_gate_scope.js — /readFileSync/i, /writeFileSync/i, /repository/i
- scripts/archive/root_migrations/cablink_fix_start_script.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_force_production_gate_fix.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_force_server_newline_fix.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_frontend_cleanup_v2.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_frontend_ride_truth_bridge.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_frontend_truth_bridge.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_frontend_truth_status_sync.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_live_dispatch_bridge_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_live_driver_bridge.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_passenger_state_listener_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_production_url_fix.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_reality_doctor.js — /readFileSync/i, /writeFileSync/i, /database/i
- scripts/archive/root_migrations/cablink_release_readiness_audit.js — /readFileSync/i, /database/i, /repository/i
- scripts/archive/root_migrations/cablink_remove_fake_completion.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_repair_gate_scan_engine.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_repair_server_newline.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_replace_driver_accept.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_restore_and_clean_server.js — /readFileSync/i, /writeFileSync/i, /store/i
- scripts/archive/root_migrations/cablink_ride_state_machine_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_ride_truth_engine.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i
- scripts/archive/root_migrations/cablink_role_switch_install.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_separate_frontend_completion.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_unify_ride_creation.js — /readFileSync/i, /writeFileSync/i, /repository/i
- scripts/archive/root_migrations/cablink_unify_ride_reads.js — /readFileSync/i, /writeFileSync/i, /database/i, /repository/i, /store/i
- scripts/archive/root_migrations/cablink_wire_dispatch_bridge.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/cablink_wire_role_controller.js — /readFileSync/i, /writeFileSync/i
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js — /firebase/i, /firestore/i, /store/i

## GPS / ROUTING FORENSICS
- archive/before_architecture_cleanup/backend_1784127601/maps/gps_engine.js — distance, route, maps
- archive/before_architecture_cleanup/backend_1784127601/maps/map_provider.js — distance, route, maps, OpenStreetMap
- archive/before_architecture_cleanup/backend_1784127601/providers/maps_connector.js — route, maps
- archive/before_architecture_cleanup/backend_1784127601/routes/driver_intelligence_api.js — distance, route
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js — distance, ETA
- archive/before_architecture_cleanup/backend_1784127601/testing/pilot_activation_test.js — route, maps
- archive/before_architecture_cleanup/frontend_1784127601/index.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/before_architecture_cleanup/index_1784127601.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/driver_upgrade/index_before_driver_upgrade_1784126025.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/driver_wiring/index_1784128009669.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/frontend_cleanup/index_before_bookride_migration_1784131014.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/frontend_cleanup/index_before_cleanup_1784131327228.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/frontend_cleanup/index_before_truth_bookride_1784131157245.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/frontend_cleanup/index_before_truth_migration.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/backend/server.js — routing, ETA
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/index.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- archive/old_backups/index_backup_before_cleanup_1783943720472.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- archive/old_backups/index_stable_backup_1784017647536.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- archive/old_backups/index_stable_backup_1784017709341.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- archive/old_backups/index_stable_backup_1784026555127.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- archive/phase_scripts/cablink_core_transaction_manager.js — distance, ETA
- archive/phase_scripts/cablink_fare_test.js — distance, ETA
- archive/phase_scripts/cablink_final_intelligence_audit.js — distance, ETA
- archive/phase_scripts/cablink_final_pilot_bridge_install.js — maps, Mapbox, Google Maps
- archive/phase_scripts/cablink_final_reality_layers_install.js — distance, route, maps, Mapbox, Google Maps
- archive/phase_scripts/cablink_final_reality_test.js — route, maps
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js — distance, ETA
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js — route, maps
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js — route, maps
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js — distance, route, maps
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js — distance, route, maps, OpenStreetMap
- archive/phase_scripts/cablink_phase17_human_interface_install.js — route, maps
- archive/phase_scripts/cablink_phase30_route_order_fix.js — routing, route
- archive/phase_scripts/cablink_phase32_driver_dashboard_api_mount.js — routing, route
- archive/phase_scripts/cablink_phase33_real_route_fix.js — routing, route
- archive/phase_scripts/cablink_phase34_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase37_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase39_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase40_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js — distance, route
- archive/phase_scripts/cablink_phase41_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase42_dispatch_engine.js — distance, route
- archive/phase_scripts/cablink_phase42_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase46_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js — distance, route, ETA
- archive/phase_scripts/cablink_phase47_fix.js — distance, route, ETA
- archive/phase_scripts/cablink_phase47_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase48_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase49_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase50_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase51_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase52_driver_intelligence.js — distance, route
- archive/phase_scripts/cablink_phase52_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase53_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase54_route_mount.js — routing, route
- archive/phase_scripts/cablink_phase9_backend_api_server_install.js — routing, route
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js — distance, maps
- archive/phase_scripts/cablink_pilot_operations_core_install.js — ETA, maps, Mapbox, Google Maps
- archive/phase_scripts/cablink_pilot_test_001_engine.js — distance, ETA
- archive/phase_scripts/cablink_production_setup.js — route, ETA
- archive/phase_scripts/cablink_real_audit_engine.js — distance, ETA
- archive/phase_scripts/cablink_real_hailing_completion_engine.js — distance, ETA
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js — distance, maps
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js — route, maps
- archive/phase_scripts/cablink_reality_phase2_test.js — route, maps
- archive/phase_scripts/index_backup_before_bookride_cleanup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/phase_scripts/index_backup_before_driver_override_remove.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/phase_scripts/index_backup_before_real_engine.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/phase_scripts/index_backup_before_runtime_merge.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/phase_scripts/index_react_backup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/server_conflicts/index_before_api_fix_1784125371.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- archive/truth_cleanup_1784127676771/frontend_index.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- backend/maps/gps_engine.js — distance, route, maps
- backend/maps/map_provider.js — distance, route, maps, OpenStreetMap
- backend/providers/maps_connector.js — route, maps
- backend/routes/driver_intelligence_api.js — distance, route
- backend/server.js — distance, route
- backend/services/driver_location_service.js — distance, ETA
- backend/testing/pilot_activation_test.js — route, maps
- cablink_forensic_audit_v2.js — geolocation, watchPosition, getCurrentPosition, haversine, distance, routing, route, ETA, maps, leaflet, Mapbox, Google Maps, OSRM
- cablink_full_audit.js — navigator.geolocation, geolocation, haversine, distance, route
- cablink_reality_doctor.js — route, ETA
- cablink_runtime_truth_audit_v3.js — navigator.geolocation, geolocation, watchPosition, getCurrentPosition, haversine, distance, routing, route, ETA, maps, leaflet, Mapbox, Google Maps, OpenStreetMap, OSRM
- frontend/index.html — navigator.geolocation, geolocation, getCurrentPosition, haversine, distance, route, ETA, maps, leaflet
- frontend/js/app_core.js — navigator.geolocation, geolocation, getCurrentPosition, haversine, distance, routing, route, ETA, maps, leaflet, OpenStreetMap
- index.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- migration_backup/index_legacy.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js — route, ETA
- scripts/archive/root_migrations/cablink_reality_doctor.js — route, ETA
- scripts/archive/root_migrations/index_before_booking_migration.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- scripts/archive/root_migrations/index_before_bookride_cleanup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- scripts/archive/root_migrations/index_before_bstm_mount.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- scripts/archive/root_migrations/index_before_module_cleanup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- scripts/archive/root_migrations/index_before_reality_cutover.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet
- scripts/archive/root_migrations/index_before_role_auto_cleanup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- scripts/archive/root_migrations/index_before_role_cleanup.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- scripts/archive/root_migrations/index_before_role_fix_1784018514824.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- scripts/archive/root_migrations/index_before_script_repair_1784017559902.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps
- scripts/archive/root_migrations/index_before_script_restore.html — navigator.geolocation, geolocation, getCurrentPosition, route, ETA, maps, leaflet

## PAYMENT / SETTLEMENT / REWARD FORENSICS
- archive/before_architecture_cleanup/backend_1784127601/api/reward_api.js — wallet, blockchain, claim
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_claim_engine.js — reward, THB, wallet
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_claim_engine.js — wallet, transaction, claim
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_transfer_queue.js — reward, THB, wallet
- archive/before_architecture_cleanup/backend_1784127601/rewards/wallet_service.js — reward, THB, wallet
- archive/before_architecture_cleanup/backend_1784127601/rides/settlement_engine.js — payment, reward, wallet
- archive/before_architecture_cleanup/backend_1784127601/services/ride_completion_service.js — reward, THB, wallet
- archive/before_architecture_cleanup/backend_1784127601/services/ride_economy_service.js — reward, THB, wallet
- archive/before_architecture_cleanup/backend_1784127601/testing/reward_wallet_test.js — reward, THB, wallet
- archive/phase_scripts/cablink_beta_reality_simulator.js — payment, reward, THB
- archive/phase_scripts/cablink_core_transaction_manager.js — payment, reward, THB, wallet, transaction
- archive/phase_scripts/cablink_database_wiring_upgrade.js — payment, reward, blockchain
- archive/phase_scripts/cablink_final_human_pilot_lock_engine.js — payment, THB, wallet
- archive/phase_scripts/cablink_final_reality_transaction_engine.js — payment, THB, wallet, blockchain, transaction
- archive/phase_scripts/cablink_flow_audit.js — payment, reward, THB, wallet, transaction
- archive/phase_scripts/cablink_full_reward_cycle_test.js — reward, THB, wallet, blockchain, claim
- archive/phase_scripts/cablink_human_pilot_final_verification.js — settlement, reward, wallet
- archive/phase_scripts/cablink_intelligence_layer_install.js — reward, THB, wallet, blockchain, claim
- archive/phase_scripts/cablink_launch_certification_engine.js — payment, reward, THB
- archive/phase_scripts/cablink_missing_parts_completion_engine.js — payment, settlement, reward, THB, wallet
- archive/phase_scripts/cablink_persistent_pilot_database_install.js — payment, reward, THB
- archive/phase_scripts/cablink_phase26_thb_delivery_rewards_install.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js — reward, THB, wallet, transaction
- archive/phase_scripts/cablink_phase28_auto_reward_trigger_install.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase29_driver_economy_dashboard_install.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase30_live_driver_data_install.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase33_driver_economy_ui_install.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase34_ride_economy_loop.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js — reward, THB, transaction
- archive/phase_scripts/cablink_phase48_completion_economy.js — reward, THB, wallet
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js — payment, reward, THB
- archive/phase_scripts/cablink_production_wiring_fix.js — payment, settlement, reward, THB, wallet
- archive/phase_scripts/cablink_production_wiring_test.js — settlement, reward, wallet
- archive/phase_scripts/cablink_real_audit_engine.js — payment, reward, THB, blockchain
- archive/phase_scripts/cablink_real_end_to_end_test.js — settlement, reward, wallet
- archive/phase_scripts/cablink_real_pilot_environment_install.js — payment, reward, THB, blockchain
- archive/phase_scripts/cablink_reality_hardening_engine.js — payment, reward, THB, wallet, transaction
- archive/phase_scripts/cablink_reality_integration_engine.js — payment, reward, THB, wallet, blockchain
- archive/phase_scripts/cablink_reward_api_bridge_install.js — reward, wallet, blockchain, claim
- archive/phase_scripts/cablink_sync_thb_configuration.js — payment, THB, wallet
- archive/phase_scripts/cablink_thb_blockchain_worker_install.js — reward, THB, wallet, blockchain, transaction
- archive/phase_scripts/cablink_thb_claim_verification_install.js — reward, THB, wallet, transaction, claim
- archive/phase_scripts/cablink_thb_real_chain_connector.js — THB, wallet, blockchain
- archive/phase_scripts/cablink_thb_real_executor_install.js — THB, wallet, blockchain, transaction
- archive/phase_scripts/cablink_thb_transfer_simulation_test.js — wallet, blockchain, transaction, claim
- archive/phase_scripts/cablink_thb_transfer_simulator_install.js — THB, wallet, blockchain, transaction, claim
- archive/phase_scripts/cablink_thb_worker_test.js — reward, wallet, blockchain
- archive/phase_scripts/install_cablink_operational_core.js — reward, THB, wallet
- backend/api/reward_api.js — wallet, blockchain, claim
- backend/rewards/reward_claim_engine.js — reward, THB, wallet
- backend/rewards/thb_claim_engine.js — wallet, transaction, claim
- backend/rewards/thb_transfer_queue.js — reward, THB, wallet
- backend/rewards/wallet_service.js — reward, THB, wallet
- backend/rides/settlement_engine.js — payment, reward, wallet
- backend/services/ride_completion_service.js — reward, THB, wallet
- backend/services/ride_economy_service.js — reward, THB, wallet
- backend/testing/reward_wallet_test.js — reward, THB, wallet
- cablink_forensic_audit_v2.js — payment, settlement, commission, reward, THB, wallet, blockchain, transaction, claim
- cablink_runtime_truth_audit_v3.js — payment, settlement, commission, reward, THB, wallet, blockchain, transaction, claim
- frontend/js/rides/completionRewardBridge.js — reward, THB, transaction
- scripts/archive/root_migrations/cablink_completion_finance_reward_bridge_install.js — reward, THB, wallet, transaction

## DUPLICATE FUNCTION FORENSICS
### getRole
- .block8_check.js
- archive/before_architecture_cleanup/frontend_1784127601/js/role.js
- archive/before_architecture_cleanup/frontend_1784127601/services/role_service.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/role.js
- archive/phase_scripts/cablink_phase45_app_shell.js
- frontend/js/role.js
- frontend/services/role_service.js
- migration_backup/frontend/services/role_service.js
- role.js

### setRole
- .block8_check.js
- archive/before_architecture_cleanup/frontend_1784127601/js/role.js
- archive/before_architecture_cleanup/frontend_1784127601/services/role_service.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/role.js
- archive/phase_scripts/cablink_phase45_app_shell.js
- frontend/js/role.js
- frontend/services/role_service.js
- migration_backup/frontend/services/role_service.js
- role.js

### isDriver
- .block8_check.js
- archive/before_architecture_cleanup/frontend_1784127601/js/role.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/role.js
- frontend/js/role.js
- role.js

### dashboard
- archive/before_architecture_cleanup/backend_1784127601/admin/admin_monitor.js
- archive/before_architecture_cleanup/frontend_1784127601/components/mobile_dashboard.js
- archive/before_architecture_cleanup/frontend_1784127601/screens/driver_dashboard.js
- archive/before_architecture_cleanup/frontend_1784127601/screens/passenger_dashboard.js
- archive/phase_scripts/cablink_phase11_frontend_reality_ui_install.js
- archive/phase_scripts/cablink_phase17_human_interface_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- backend/admin/admin_monitor.js
- frontend/components/mobile_dashboard.js
- frontend/screens/driver_dashboard.js
- frontend/screens/passenger_dashboard.js
- migration_backup/frontend/components/mobile_dashboard.js
- migration_backup/frontend/screens/driver_dashboard.js
- migration_backup/frontend/screens/passenger_dashboard.js

### report
- archive/before_architecture_cleanup/backend_1784127601/admin/operator_dashboard.js
- archive/phase_scripts/cablink_human_pilot_control_engine.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_pilot_control_center_install.js
- backend/admin/operator_dashboard.js
- beta/pilot/issues/issue_tracker.js
- pilot/dashboard/pilot_status.js

### calculate
- archive/before_architecture_cleanup/backend_1784127601/analytics/pilot_analytics.js
- archive/before_architecture_cleanup/backend_1784127601/economy/delivery_fare_engine.js
- archive/before_architecture_cleanup/backend_1784127601/fare/fare_engine.js
- archive/before_architecture_cleanup/backend_1784127601/pricing/fare_calculator.js
- archive/before_architecture_cleanup/backend_1784127601/rewards/delivery_reward_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/before_architecture_cleanup/frontend_1784127601/js/financial_intelligence.js
- archive/phase_scripts/cablink_phase25_delivery_economy_install.js
- archive/phase_scripts/cablink_phase26_thb_delivery_rewards_install.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- archive/phase_scripts/install_financial_intelligence_v2.js
- backend/analytics/pilot_analytics.js
- backend/economy/delivery_fare_engine.js
- backend/fare/fare_engine.js
- backend/pricing/fare_calculator.js
- backend/rewards/delivery_reward_engine.js
- backend/services/driver_location_service.js
- backend/services/live_demand_service.js
- frontend/js/financial_intelligence.js
- frontend/js/rides/completionRewardBridge.js
- migration_backup/frontend/js/financial_intelligence.js
- scripts/archive/root_migrations/cablink_completion_finance_reward_bridge_install.js

### record
- archive/before_architecture_cleanup/backend_1784127601/analytics/pilot_failure_tracker.js
- archive/before_architecture_cleanup/backend_1784127601/location/gps_event_engine.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- backend/analytics/pilot_failure_tracker.js
- backend/location/gps_event_engine.js

### all
- archive/before_architecture_cleanup/backend_1784127601/analytics/pilot_failure_tracker.js
- archive/before_architecture_cleanup/backend_1784127601/database/ride_repository.js
- archive/before_architecture_cleanup/backend_1784127601/database/user_repository.js
- archive/before_architecture_cleanup/backend_1784127601/devices/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/drivers/driver_state.js
- archive/before_architecture_cleanup/backend_1784127601/logs/system_logger.js
- archive/before_architecture_cleanup/backend_1784127601/mobile/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/notifications/notification_center.js
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_history.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_lifecycle.js
- archive/before_architecture_cleanup/backend_1784127601/safety/safety_engine.js
- archive/before_architecture_cleanup/backend_1784127601/support/ticket_system.js
- archive/before_architecture_cleanup/backend_1784127601/tasks/task_manager.js
- archive/before_architecture_cleanup/backend_1784127601/transactions/transaction_record.js
- archive/before_architecture_cleanup/backend_1784127601/trips/trip_manager.js
- archive/before_architecture_cleanup/frontend_1784127601/ecosystem/bstm_links.js
- archive/phase_scripts/cablink_bstm_hub_install.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_human_pilot_protocol_engine.js
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js
- archive/phase_scripts/cablink_phase13_realtime_tracking_install.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_phase21_marketplace_task_bridge_install.js
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js
- archive/phase_scripts/cablink_pilot_hardening_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- archive/phase_scripts/cablink_pilot_operations_logger.js
- archive/phase_scripts/cablink_production_reality_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- backend/analytics/pilot_failure_tracker.js
- backend/database/ride_repository.js
- backend/database/user_repository.js
- backend/devices/device_registry.js
- backend/drivers/driver_state.js
- backend/logs/system_logger.js
- backend/mobile/device_registry.js
- backend/notifications/notification_center.js
- backend/rewards/reward_history.js
- backend/rides/ride_lifecycle.js
- backend/safety/safety_engine.js
- backend/support/ticket_system.js
- backend/tasks/task_manager.js
- backend/transactions/transaction_record.js
- backend/trips/trip_manager.js
- beta/human_pilot/feedback/feedback_engine.js
- beta/human_pilot/rides/test_framework.js
- beta/operations/event_logger.js
- frontend/ecosystem/bstm_links.js
- migration_backup/frontend/ecosystem/bstm_links.js
- pilot/devices/device_registry.js

### rideRequest
- archive/before_architecture_cleanup/backend_1784127601/api/cablink_gateway.js
- archive/phase_scripts/cablink_final_pilot_bridge_install.js
- backend/api/cablink_gateway.js

### claimReward
- archive/before_architecture_cleanup/backend_1784127601/api/reward_api.js
- archive/phase_scripts/cablink_reward_api_bridge_install.js
- backend/api/reward_api.js

### check
- archive/before_architecture_cleanup/backend_1784127601/audit/production_audit.js
- archive/before_architecture_cleanup/backend_1784127601/blockchain/chain_health.js
- archive/before_architecture_cleanup/backend_1784127601/environment/readiness_check.js
- archive/before_architecture_cleanup/backend_1784127601/fraud/reward_guard.js
- archive/before_architecture_cleanup/backend_1784127601/heartbeat/device_monitor.js
- archive/before_architecture_cleanup/backend_1784127601/monitoring/system_health.js
- archive/before_architecture_cleanup/frontend_1784127601/monitoring/ui_health.js
- archive/phase_scripts/cablink_audit_now.js
- archive/phase_scripts/cablink_beta_launch_engine.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_final_production_gatekeeper_v2.js
- archive/phase_scripts/cablink_phase11_frontend_reality_ui_install.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js
- archive/phase_scripts/cablink_pilot_hardening_install.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- archive/phase_scripts/cablink_runtime_connection_audit.js
- archive/phase_scripts/cablink_thb_real_chain_connector.js
- archive/phase_scripts/install_cablink_production_monitor.js
- backend/audit/production_audit.js
- backend/blockchain/chain_health.js
- backend/environment/readiness_check.js
- backend/fraud/reward_guard.js
- backend/heartbeat/device_monitor.js
- backend/monitoring/system_health.js
- beta/health/production_health.js
- deployment/service_readiness_check.js
- frontend/monitoring/ui_health.js
- migration_backup/frontend/monitoring/ui_health.js
- scripts/archive/root_migrations/cablink_launch_verification.js
- scripts/archive/root_migrations/cablink_production_gate.js

### status
- archive/before_architecture_cleanup/backend_1784127601/auth/auth_connector.js
- archive/before_architecture_cleanup/backend_1784127601/drivers/heartbeat_engine.js
- archive/before_architecture_cleanup/backend_1784127601/firebase/firebase_adapter.js
- archive/before_architecture_cleanup/backend_1784127601/providers/cloud_provider.js
- archive/before_architecture_cleanup/backend_1784127601/providers/maps_connector.js
- archive/before_architecture_cleanup/frontend_1784127601/components/status_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/pwa/install_manager.js
- archive/phase_scripts/cablink_phase11_frontend_reality_ui_install.js
- archive/phase_scripts/cablink_phase18_pwa_mobile_activation_install.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- archive/phase_scripts/cablink_real_pilot_environment_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- archive/phase_scripts/fix_bookride.js
- backend/auth/auth_connector.js
- backend/drivers/heartbeat_engine.js
- backend/firebase/firebase_adapter.js
- backend/providers/cloud_provider.js
- backend/providers/maps_connector.js
- frontend/components/status_panel.js
- frontend/pwa/install_manager.js
- migration_backup/frontend/components/status_panel.js
- migration_backup/frontend/pwa/install_manager.js

### createSession
- archive/before_architecture_cleanup/backend_1784127601/auth/auth_connector.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- backend/auth/auth_connector.js

### register
- archive/before_architecture_cleanup/backend_1784127601/auth/auth_engine.js
- archive/before_architecture_cleanup/backend_1784127601/devices/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/extensions/extension_registry.js
- archive/before_architecture_cleanup/backend_1784127601/mobile/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/realtime/realtime_bridge.js
- archive/before_architecture_cleanup/backend_1784127601/security/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_service.js
- archive/before_architecture_cleanup/frontend_1784127601/services/user_service.js
- archive/phase_scripts/cablink_beta_launch_engine.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- archive/phase_scripts/cablink_production_reality_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- archive/phase_scripts/install_cablink_operational_core.js
- backend/auth/auth_engine.js
- backend/devices/device_registry.js
- backend/extensions/extension_registry.js
- backend/mobile/device_registry.js
- backend/realtime/realtime_bridge.js
- backend/security/device_registry.js
- backend/services/driver_service.js
- beta/onboarding/driver_system.js
- beta/onboarding/passenger_system.js
- frontend/services/user_service.js
- migration_backup/frontend/services/user_service.js
- pilot/devices/device_registry.js

### login
- archive/before_architecture_cleanup/backend_1784127601/auth/auth_engine.js
- archive/phase_scripts/cablink_production_reality_completion_engine.js
- backend/auth/auth_engine.js

### send
- archive/before_architecture_cleanup/backend_1784127601/auth/otp_service.js
- archive/before_architecture_cleanup/backend_1784127601/notifications/notification_center.js
- archive/before_architecture_cleanup/backend_1784127601/notifications/push_bridge.js
- archive/before_architecture_cleanup/backend_1784127601/services/notifications/notification_service.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/auth/otp_service.js
- backend/notifications/notification_center.js
- backend/notifications/push_bridge.js
- backend/services/notifications/notification_service.js

### verify
- archive/before_architecture_cleanup/backend_1784127601/auth/otp_service.js
- archive/before_architecture_cleanup/backend_1784127601/auth/phone_verification_engine.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- backend/auth/otp_service.js
- backend/auth/phone_verification_engine.js

### sendCode
- archive/before_architecture_cleanup/backend_1784127601/auth/phone_verification_engine.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- backend/auth/phone_verification_engine.js

### executeTransfer
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_real_executor.js
- archive/phase_scripts/cablink_thb_real_executor_install.js
- backend/blockchain/thb_real_executor.js

### createTransaction
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transaction_engine.js
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_transaction_layer.js
- archive/before_architecture_cleanup/frontend_1784127601/js/operations_core.js
- archive/phase_scripts/cablink_final_reality_transaction_engine.js
- archive/phase_scripts/cablink_thb_transfer_simulator_install.js
- archive/phase_scripts/install_operations_core.js
- backend/blockchain/thb_transaction_engine.js
- backend/payments/payment_transaction_layer.js
- frontend/js/operations_core.js
- migration_backup/frontend/js/operations_core.js

### submit
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transaction_engine.js
- archive/phase_scripts/cablink_thb_transfer_simulator_install.js
- backend/blockchain/thb_transaction_engine.js

### confirm
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transaction_engine.js
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_engine.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_thb_transfer_simulator_install.js
- backend/blockchain/thb_transaction_engine.js
- backend/payments/payment_engine.js

### transfer
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transfer_service.js
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_engine.js
- archive/phase_scripts/cablink_thb_real_chain_connector.js
- backend/blockchain/thb_transfer_service.js
- backend/rewards/reward_engine.js

### processReward
- archive/before_architecture_cleanup/backend_1784127601/blockchain/thb_transfer_worker.js
- archive/phase_scripts/cablink_thb_blockchain_worker_install.js
- backend/blockchain/thb_transfer_worker.js

### valid
- archive/before_architecture_cleanup/backend_1784127601/blockchain/wallet_validator.js
- archive/phase_scripts/cablink_thb_real_chain_connector.js
- backend/blockchain/wallet_validator.js

### broadcast
- archive/before_architecture_cleanup/backend_1784127601/broadcast/ride_broadcast.js
- archive/before_architecture_cleanup/backend_1784127601/realtime/channel_manager.js
- archive/before_architecture_cleanup/backend_1784127601/services/realtime/realtime_service.js
- archive/before_architecture_cleanup/backend_1784127601/socket/socket_manager.js
- archive/before_architecture_cleanup/backend_1784127601/sync/live_sync_engine.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_final_pilot_bridge_install.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- backend/broadcast/ride_broadcast.js
- backend/realtime/channel_manager.js
- backend/services/realtime/realtime_service.js
- backend/socket/socket_manager.js
- backend/sync/live_sync_engine.js

### sync
- archive/before_architecture_cleanup/backend_1784127601/cloud/cloud_adapter.js
- archive/phase_scripts/cablink_final_pilot_bridge_install.js
- backend/cloud/cloud_adapter.js

### connect
- archive/before_architecture_cleanup/backend_1784127601/cloud/production_adapter.js
- archive/before_architecture_cleanup/backend_1784127601/providers/cloud_database_connector.js
- archive/before_architecture_cleanup/backend_1784127601/realtime/presence_engine.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- backend/cloud/production_adapter.js
- backend/providers/cloud_database_connector.js
- backend/realtime/presence_engine.js

### validate
- archive/before_architecture_cleanup/backend_1784127601/config/env_check.js
- archive/before_architecture_cleanup/backend_1784127601/config/environment_validator.js
- archive/before_architecture_cleanup/backend_1784127601/fraud/ride_validation.js
- archive/before_architecture_cleanup/frontend_1784127601/js/ride_engine.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_reality_bridge_phase5_install.js
- archive/phase_scripts/install_ride_engine.js
- backend/config/env_check.js
- backend/config/environment_validator.js
- backend/fraud/ride_validation.js
- frontend/js/ride_engine.js
- migration_backup/frontend/js/ride_engine.js
- scripts/archive/root_migrations/ride_engine_before_booking_merge.js

### migrate
- archive/before_architecture_cleanup/backend_1784127601/database/migration_engine.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- backend/database/migration_engine.js

### getSchema
- archive/before_architecture_cleanup/backend_1784127601/database/production_schema.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- backend/database/production_schema.js

### load
- archive/before_architecture_cleanup/backend_1784127601/database/rideRepository.js
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/identity_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/passenger_intelligence_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_event_service.js
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_economy_screen_service.js
- archive/phase_scripts/cablink_final_reality_transaction_engine.js
- archive/phase_scripts/cablink_human_pilot_control_engine.js
- archive/phase_scripts/cablink_human_pilot_protocol_engine.js
- archive/phase_scripts/cablink_live_gps_foundation_engine.js
- archive/phase_scripts/cablink_persistent_pilot_database_install.js
- archive/phase_scripts/cablink_phase33_driver_economy_ui_install.js
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- archive/phase_scripts/cablink_phase53_identity_engine.js
- archive/phase_scripts/cablink_phase54_passenger_intelligence.js
- archive/phase_scripts/cablink_pilot_operations_logger.js
- archive/phase_scripts/cablink_reality_integration_engine.js
- backend/database/rideRepository.js
- backend/ride_store.js
- backend/services/dispatch_service.js
- backend/services/driver_intelligence_service.js
- backend/services/driver_location_service.js
- backend/services/driver_matching_service.js
- backend/services/economy_ledger_service.js
- backend/services/identity_service.js
- backend/services/live_demand_service.js
- backend/services/live_ride_service.js
- backend/services/passenger_intelligence_service.js
- backend/services/ride_event_service.js
- beta/human_pilot/participants/registry.js
- beta/live_gps/live_location_engine.js
- beta/operations/event_logger.js
- beta/pilot/users/registry.js
- database/production/store_engine.js
- frontend/services/driver_economy_screen_service.js
- migration_backup/frontend/services/driver_economy_screen_service.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js

### save
- archive/before_architecture_cleanup/backend_1784127601/database/rideRepository.js
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/location/location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_event_service.js
- archive/phase_scripts/cablink_final_reality_transaction_engine.js
- archive/phase_scripts/cablink_human_pilot_control_engine.js
- archive/phase_scripts/cablink_persistent_pilot_database_install.js
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- archive/phase_scripts/cablink_reality_hardening_engine.js
- archive/phase_scripts/cablink_reality_integration_engine.js
- backend/database/rideRepository.js
- backend/ride_store.js
- backend/services/dispatch_service.js
- backend/services/driver_location_service.js
- backend/services/driver_matching_service.js
- backend/services/economy_ledger_service.js
- backend/services/live_demand_service.js
- backend/services/live_ride_service.js
- backend/services/location/location_service.js
- backend/services/ride_event_service.js
- beta/pilot/rides/ride_registry.js
- database/production/store_engine.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js

### create
- archive/before_architecture_cleanup/backend_1784127601/database/ride_repository.js
- archive/before_architecture_cleanup/backend_1784127601/database/user_repository.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_lifecycle.js
- archive/before_architecture_cleanup/backend_1784127601/safety/incident_report.js
- archive/before_architecture_cleanup/backend_1784127601/safety/safety_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/payment_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/reward_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_state_service.js
- archive/before_architecture_cleanup/backend_1784127601/sessions/session_engine.js
- archive/before_architecture_cleanup/backend_1784127601/support/ticket_system.js
- archive/before_architecture_cleanup/backend_1784127601/tasks/task_manager.js
- archive/before_architecture_cleanup/backend_1784127601/transactions/transaction_record.js
- archive/before_architecture_cleanup/frontend_1784127601/js/ride_engine.js
- archive/phase_scripts/cablink_fix_state_create_order.js
- archive/phase_scripts/cablink_merge_ride_storage.js
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js
- archive/phase_scripts/cablink_phase21_marketplace_task_bridge_install.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_phase7_production_connection_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- archive/phase_scripts/cablink_real_pilot_environment_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- archive/phase_scripts/install_cablink_operational_core.js
- archive/phase_scripts/install_ride_engine.js
- backend/database/ride_repository.js
- backend/database/user_repository.js
- backend/rides/ride_lifecycle.js
- backend/safety/incident_report.js
- backend/safety/safety_engine.js
- backend/services/live_ride_service.js
- backend/services/payment_service.js
- backend/services/reward_service.js
- backend/services/ride_service.js
- backend/services/ride_state_service.js
- backend/sessions/session_engine.js
- backend/support/ticket_system.js
- backend/tasks/task_manager.js
- backend/transactions/transaction_record.js
- frontend/js/ride_engine.js
- migration_backup/frontend/js/ride_engine.js
- scripts/archive/root_migrations/ride_engine_before_booking_merge.js

### update
- archive/before_architecture_cleanup/backend_1784127601/database/ride_repository.js
- archive/before_architecture_cleanup/backend_1784127601/drivers/driver_state.js
- archive/before_architecture_cleanup/backend_1784127601/gps/gps_service.js
- archive/before_architecture_cleanup/backend_1784127601/location/location_service.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_lifecycle.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_state_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_state_service.js
- archive/before_architecture_cleanup/backend_1784127601/tracking/location_session.js
- archive/before_architecture_cleanup/backend_1784127601/tracking/location_tracker.js
- archive/before_architecture_cleanup/backend_1784127601/trips/trip_manager.js
- archive/before_architecture_cleanup/frontend_1784127601/js/gps/location_engine.js
- archive/before_architecture_cleanup/frontend_1784127601/js/ride_engine.js
- archive/before_architecture_cleanup/frontend_1784127601/state/ride_ui_state.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_merge_ride_storage.js
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js
- archive/phase_scripts/cablink_phase13_realtime_tracking_install.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- archive/phase_scripts/cablink_phase17_human_interface_install.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_pilot_command_center_engine.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- archive/phase_scripts/install_ride_engine.js
- backend/database/ride_repository.js
- backend/drivers/driver_state.js
- backend/gps/gps_service.js
- backend/location/location_service.js
- backend/rides/ride_lifecycle.js
- backend/rides/ride_state_engine.js
- backend/services/driver_location_service.js
- backend/services/live_ride_service.js
- backend/services/ride_state_service.js
- backend/tracking/location_session.js
- backend/tracking/location_tracker.js
- backend/trips/trip_manager.js
- frontend/js/gps/location_engine.js
- frontend/js/ride_engine.js
- frontend/js/rides/passengerRideStatus.js
- frontend/state/ride_ui_state.js
- migration_backup/frontend/js/gps/location_engine.js
- migration_backup/frontend/js/ride_engine.js
- migration_backup/frontend/state/ride_ui_state.js
- scripts/archive/root_migrations/cablink_passenger_state_listener_install.js
- scripts/archive/root_migrations/ride_engine_before_booking_merge.js

### calculateScore
- archive/before_architecture_cleanup/backend_1784127601/dispatch/dispatch_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/dispatch/dispatch_engine.js

### select
- archive/before_architecture_cleanup/backend_1784127601/dispatch/dispatch_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/dispatch/dispatch_engine.js

### get
- archive/before_architecture_cleanup/backend_1784127601/drivers/driver_state.js
- archive/before_architecture_cleanup/backend_1784127601/gps/gps_service.js
- archive/before_architecture_cleanup/backend_1784127601/location/location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_state_service.js
- archive/before_architecture_cleanup/backend_1784127601/tracking/location_session.js
- archive/before_architecture_cleanup/backend_1784127601/tracking/location_tracker.js
- archive/before_architecture_cleanup/frontend_1784127601/js/gps/location_engine.js
- archive/before_architecture_cleanup/frontend_1784127601/state/ride_ui_state.js
- archive/before_architecture_cleanup/frontend_1784127601/state/session_store.js
- archive/before_architecture_cleanup/frontend_1784127601/state/task_state.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_merge_ride_storage.js
- archive/phase_scripts/cablink_persistent_pilot_database_install.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- archive/phase_scripts/cablink_phase13_realtime_tracking_install.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- archive/phase_scripts/cablink_phase17_human_interface_install.js
- archive/phase_scripts/cablink_phase22_driver_task_dashboard_install.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_pilot_command_center_engine.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/drivers/driver_state.js
- backend/gps/gps_service.js
- backend/location/location_service.js
- backend/services/live_ride_service.js
- backend/services/ride_state_service.js
- backend/tracking/location_session.js
- backend/tracking/location_tracker.js
- database/production/store_engine.js
- frontend/js/gps/location_engine.js
- frontend/js/rides/rideStateMachine.js
- frontend/state/ride_ui_state.js
- frontend/state/session_store.js
- frontend/state/task_state.js
- migration_backup/frontend/js/gps/location_engine.js
- migration_backup/frontend/state/ride_ui_state.js
- migration_backup/frontend/state/session_store.js
- migration_backup/frontend/state/task_state.js
- scripts/archive/root_migrations/cablink_ride_state_machine_install.js

### heartbeat
- archive/before_architecture_cleanup/backend_1784127601/drivers/heartbeat_engine.js
- archive/before_architecture_cleanup/backend_1784127601/mobile/device_registry.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- backend/drivers/heartbeat_engine.js
- backend/mobile/device_registry.js

### receiveOrder
- archive/before_architecture_cleanup/backend_1784127601/ecosystem/marketplace_bridge.js
- archive/phase_scripts/cablink_phase21_marketplace_task_bridge_install.js
- backend/ecosystem/marketplace_bridge.js

### publish
- archive/before_architecture_cleanup/backend_1784127601/events/ride_event_bus.js
- archive/before_architecture_cleanup/backend_1784127601/location/location_stream.js
- archive/before_architecture_cleanup/backend_1784127601/realtime/event_bus.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_phase13_realtime_tracking_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- backend/events/ride_event_bus.js
- backend/location/location_stream.js
- backend/realtime/event_bus.js

### history
- archive/before_architecture_cleanup/backend_1784127601/events/ride_event_bus.js
- archive/before_architecture_cleanup/backend_1784127601/location/gps_event_engine.js
- archive/before_architecture_cleanup/backend_1784127601/realtime/event_bus.js
- archive/before_architecture_cleanup/backend_1784127601/safety/emergency_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_event_service.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_phase13_realtime_tracking_install.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- archive/phase_scripts/cablink_pilot_operations_core_install.js
- backend/events/ride_event_bus.js
- backend/location/gps_event_engine.js
- backend/realtime/event_bus.js
- backend/safety/emergency_engine.js
- backend/services/ride_event_service.js

### list
- archive/before_architecture_cleanup/backend_1784127601/extensions/extension_registry.js
- archive/before_architecture_cleanup/backend_1784127601/security/device_registry.js
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_economy_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_service.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_phase34_ride_economy_loop.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- archive/phase_scripts/install_cablink_operational_core.js
- backend/extensions/extension_registry.js
- backend/security/device_registry.js
- backend/services/dispatch_service.js
- backend/services/ride_economy_service.js
- backend/services/ride_service.js

### write
- archive/before_architecture_cleanup/backend_1784127601/firebase/firebase_adapter.js
- archive/before_architecture_cleanup/backend_1784127601/logs/system_logger.js
- archive/before_architecture_cleanup/backend_1784127601/storage/database.js
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js
- archive/phase_scripts/cablink_pilot_hardening_install.js
- archive/phase_scripts/cablink_reality_bridge_phase3_install.js
- backend/firebase/firebase_adapter.js
- backend/logs/system_logger.js
- backend/storage/database.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js

### stream
- archive/before_architecture_cleanup/backend_1784127601/gps/location_stream.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- backend/gps/location_stream.js

### read
- archive/before_architecture_cleanup/backend_1784127601/location/location_stream.js
- archive/before_architecture_cleanup/backend_1784127601/storage/database.js
- archive/phase_scripts/cablink_phase12_persistent_storage_install.js
- archive/phase_scripts/cablink_pilot_operations_logger.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- backend/location/location_stream.js
- backend/storage/database.js
- beta/operations/reports/daily_report.js
- cablink_runtime_truth_audit_v3.js

### findNearbyDrivers
- archive/before_architecture_cleanup/backend_1784127601/location/radar_engine.js
- archive/phase_scripts/cablink_intelligence_layer_install.js
- backend/location/radar_engine.js

### calculateDistance
- archive/before_architecture_cleanup/backend_1784127601/maps/gps_engine.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- backend/maps/gps_engine.js

### route
- archive/before_architecture_cleanup/backend_1784127601/maps/gps_engine.js
- archive/before_architecture_cleanup/backend_1784127601/maps/map_provider.js
- archive/before_architecture_cleanup/backend_1784127601/providers/maps_connector.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- archive/phase_scripts/cablink_reality_bridge_phase2_install.js
- backend/maps/gps_engine.js
- backend/maps/map_provider.js
- backend/providers/maps_connector.js

### provider
- archive/before_architecture_cleanup/backend_1784127601/maps/map_provider.js
- archive/before_architecture_cleanup/backend_1784127601/production/database_adapter.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/maps/map_provider.js
- backend/production/database_adapter.js

### find
- archive/before_architecture_cleanup/backend_1784127601/matching/driver_matcher.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- backend/matching/driver_matcher.js

### findDriver
- archive/before_architecture_cleanup/backend_1784127601/matching/driver_matching_engine.js
- archive/before_architecture_cleanup/backend_1784127601/matching/matching_engine.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- backend/matching/driver_matching_engine.js
- backend/matching/matching_engine.js

### sendRideRequest
- archive/before_architecture_cleanup/backend_1784127601/notifications/notification_engine.js
- archive/phase_scripts/cablink_intelligence_layer_install.js
- backend/notifications/notification_engine.js

### registerDevice
- archive/before_architecture_cleanup/backend_1784127601/notifications/push_bridge.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/notifications/push_bridge.js

### registerDriver
- archive/before_architecture_cleanup/backend_1784127601/onboarding/onboarding_engine.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- backend/onboarding/onboarding_engine.js

### registerPassenger
- archive/before_architecture_cleanup/backend_1784127601/onboarding/onboarding_engine.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- backend/onboarding/onboarding_engine.js

### createPayment
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_adapter.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_production_reality_completion_engine.js
- archive/phase_scripts/cablink_reality_integration_engine.js
- backend/payments/payment_adapter.js

### createCheckout
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_provider_adapter.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_production_wiring_fix.js
- backend/payments/payment_provider_adapter.js

### verifyWebhook
- archive/before_architecture_cleanup/backend_1784127601/payments/payment_provider_adapter.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_production_wiring_fix.js
- backend/payments/payment_provider_adapter.js

### recordPayment
- archive/before_architecture_cleanup/backend_1784127601/payments/transaction_recorder.js
- archive/phase_scripts/cablink_reality_hardening_engine.js
- backend/payments/transaction_recorder.js

### notify
- archive/before_architecture_cleanup/backend_1784127601/push/push_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/notification_service.js
- archive/phase_scripts/cablink_final_pilot_bridge_install.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- backend/push/push_engine.js
- backend/services/notification_service.js

### subscribe
- archive/before_architecture_cleanup/backend_1784127601/realtime/channel_manager.js
- archive/phase_scripts/cablink_final_gap_closure_engine.js
- backend/realtime/channel_manager.js

### disconnect
- archive/before_architecture_cleanup/backend_1784127601/realtime/presence_engine.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- backend/realtime/presence_engine.js

### online
- archive/before_architecture_cleanup/backend_1784127601/realtime/presence_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_service.js
- archive/phase_scripts/cablink_beta_launch_engine.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/install_cablink_operational_core.js
- backend/realtime/presence_engine.js
- backend/services/driver_service.js
- beta/onboarding/driver_system.js

### emit
- archive/before_architecture_cleanup/backend_1784127601/realtime/realtime_bridge.js
- archive/phase_scripts/cablink_reality_bridge_phase1_install.js
- backend/realtime/realtime_bridge.js

### passengerJoin
- archive/before_architecture_cleanup/backend_1784127601/realtime/ride_channel.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/realtime/ride_channel.js

### driverJoin
- archive/before_architecture_cleanup/backend_1784127601/realtime/ride_channel.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/realtime/ride_channel.js

### sendUpdate
- archive/before_architecture_cleanup/backend_1784127601/realtime/ride_channel.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/realtime/ride_channel.js

### processCompletion
- archive/before_architecture_cleanup/backend_1784127601/rewards/auto_reward_trigger.js
- archive/phase_scripts/cablink_phase28_auto_reward_trigger_install.js
- backend/rewards/auto_reward_trigger.js

### createReward
- archive/before_architecture_cleanup/backend_1784127601/rewards/blockchain_reward_adapter.js
- archive/phase_scripts/cablink_reality_integration_engine.js
- backend/rewards/blockchain_reward_adapter.js

### complete
- archive/before_architecture_cleanup/backend_1784127601/rewards/delivery_completion.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_economy_service.js
- archive/phase_scripts/cablink_human_pilot_protocol_engine.js
- archive/phase_scripts/cablink_phase26_thb_delivery_rewards_install.js
- archive/phase_scripts/cablink_phase34_ride_economy_loop.js
- archive/phase_scripts/cablink_pilot_command_center_engine.js
- backend/rewards/delivery_completion.js
- backend/services/ride_economy_service.js
- beta/human_pilot/rides/test_framework.js

### completeDelivery
- archive/before_architecture_cleanup/backend_1784127601/rewards/delivery_reward_service.js
- archive/phase_scripts/cablink_phase28_auto_reward_trigger_install.js
- backend/rewards/delivery_reward_service.js

### createClaim
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_claim_engine.js
- archive/phase_scripts/cablink_intelligence_layer_install.js
- backend/rewards/reward_claim_engine.js

### decimals
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_engine.js
- backend/rewards/reward_engine.js

### issue
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_engine.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- backend/rewards/reward_engine.js

### add
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_history.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_event_service.js
- archive/phase_scripts/cablink_human_pilot_control_engine.js
- archive/phase_scripts/cablink_human_pilot_protocol_engine.js
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- archive/phase_scripts/cablink_pilot_command_center_engine.js
- backend/rewards/reward_history.js
- backend/services/ride_event_service.js
- beta/human_pilot/feedback/feedback_engine.js
- beta/human_pilot/participants/registry.js
- beta/pilot/users/registry.js

### getDriver
- archive/before_architecture_cleanup/backend_1784127601/rewards/reward_history.js
- archive/before_architecture_cleanup/frontend_1784127601/js/realtime/tracking_engine.js
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- backend/rewards/reward_history.js
- frontend/js/realtime/tracking_engine.js
- migration_backup/frontend/js/realtime/tracking_engine.js

### requestClaim
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_claim_engine.js
- archive/phase_scripts/cablink_thb_claim_verification_install.js
- backend/rewards/thb_claim_engine.js

### completeClaim
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_claim_engine.js
- archive/phase_scripts/cablink_thb_claim_verification_install.js
- backend/rewards/thb_claim_engine.js

### prepareTransfer
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_contract_adapter.js
- archive/phase_scripts/cablink_reality_hardening_engine.js
- backend/rewards/thb_contract_adapter.js

### recordPendingReward
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_service.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_production_wiring_fix.js
- backend/rewards/thb_service.js

### createTHBTransaction
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_transaction_layer.js
- archive/phase_scripts/cablink_final_reality_transaction_engine.js
- backend/rewards/thb_transaction_layer.js

### queueReward
- archive/before_architecture_cleanup/backend_1784127601/rewards/thb_transfer_queue.js
- archive/phase_scripts/cablink_thb_blockchain_worker_install.js
- backend/rewards/thb_transfer_queue.js

### wallet
- archive/before_architecture_cleanup/backend_1784127601/rewards/wallet_service.js
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js
- backend/rewards/wallet_service.js

### createRide
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/rideService.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- backend/ride_store.js
- backend/rides/ride_engine.js
- backend/services/rideService.js
- backend/services/ride_orchestrator_service.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js

### getRides
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- backend/ride_store.js

### getRide
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- archive/before_architecture_cleanup/frontend_1784127601/services/live_ride_api.js
- archive/before_architecture_cleanup/frontend_1784127601/services/passenger_dashboard_api.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase54_passenger_dashboard.js
- backend/ride_store.js
- frontend/services/live_ride_api.js
- frontend/services/passenger_dashboard_api.js
- migration_backup/frontend/services/live_ride_api.js
- migration_backup/frontend/services/passenger_dashboard_api.js

### updateRide
- archive/before_architecture_cleanup/backend_1784127601/ride_store.js
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_engine.js
- archive/before_architecture_cleanup/backend_1784127601/services/passenger_intelligence_service.js
- archive/before_architecture_cleanup/frontend_1784127601/services/live_ride_api.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase54_passenger_intelligence.js
- backend/ride_store.js
- backend/rides/ride_engine.js
- backend/services/passenger_intelligence_service.js
- frontend/services/live_ride_api.js
- migration_backup/frontend/services/live_ride_api.js

### saveRide
- archive/before_architecture_cleanup/backend_1784127601/rides/ride_persistence.js
- archive/phase_scripts/cablink_final_reality_transaction_engine.js
- backend/rides/ride_persistence.js

### settle
- archive/before_architecture_cleanup/backend_1784127601/rides/settlement_engine.js
- archive/phase_scripts/cablink_production_wiring_fix.js
- backend/rides/settlement_engine.js

### trigger
- archive/before_architecture_cleanup/backend_1784127601/safety/emergency_engine.js
- archive/phase_scripts/cablink_phase6_human_pilot_protection_install.js
- backend/safety/emergency_engine.js

### checkRide
- archive/before_architecture_cleanup/backend_1784127601/security/fraud_engine.js
- archive/phase_scripts/cablink_pilot_deployment_readiness_install.js
- backend/security/fraud_engine.js

### audit
- archive/before_architecture_cleanup/backend_1784127601/security/security_audit.js
- archive/before_architecture_cleanup/backend_1784127601/security/security_engine.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- archive/phase_scripts/cablink_phase8_pilot_deployment_command_center.js
- archive/phase_scripts/cablink_reality_bridge_phase5_install.js
- backend/security/security_audit.js
- backend/security/security_engine.js
- deployment/go_live_audit.js

### rateLimit
- archive/before_architecture_cleanup/backend_1784127601/security/security_engine.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- backend/security/security_engine.js

### getDemand
- archive/before_architecture_cleanup/backend_1784127601/services/demand_service.js
- archive/before_architecture_cleanup/frontend_1784127601/services/demand_api.js
- archive/phase_scripts/cablink_phase39_driver_visibility_layer.js
- backend/services/demand_service.js
- frontend/services/demand_api.js
- migration_backup/frontend/services/demand_api.js

### createRequest
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- backend/services/dispatch_service.js

### dispatch
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/before_architecture_cleanup/frontend_1784127601/js/operations_core.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- archive/phase_scripts/install_operations_core.js
- backend/services/dispatch_service.js
- frontend/js/operations_core.js
- migration_backup/frontend/js/operations_core.js

### accept
- archive/before_architecture_cleanup/backend_1784127601/services/dispatch_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_economy_service.js
- archive/before_architecture_cleanup/frontend_1784127601/services/task_service.js
- archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- archive/phase_scripts/cablink_phase34_ride_economy_loop.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- backend/services/dispatch_service.js
- backend/services/ride_economy_service.js
- frontend/services/task_service.js
- migration_backup/frontend/services/task_service.js

### score
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- archive/phase_scripts/cablink_pilot_command_center_engine.js
- backend/services/driver_intelligence_service.js

### rank
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- backend/services/driver_intelligence_service.js

### best
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- backend/services/driver_intelligence_service.js

### ratingScore
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- backend/services/driver_intelligence_service.js

### acceptanceScore
- archive/before_architecture_cleanup/backend_1784127601/services/driver_intelligence_service.js
- archive/phase_scripts/cablink_phase52_driver_intelligence.js
- backend/services/driver_intelligence_service.js

### distance
- archive/before_architecture_cleanup/backend_1784127601/services/driver_location_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- backend/services/driver_location_service.js
- backend/services/driver_matching_service.js
- beta/geo/geo_engine.js

### updateDriver
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js
- archive/before_architecture_cleanup/frontend_1784127601/js/realtime/tracking_engine.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- backend/services/driver_matching_service.js
- frontend/js/realtime/tracking_engine.js
- migration_backup/frontend/js/realtime/tracking_engine.js

### nearby
- archive/before_architecture_cleanup/backend_1784127601/services/driver_matching_service.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- backend/services/driver_matching_service.js

### available
- archive/before_architecture_cleanup/backend_1784127601/services/driver_service.js
- archive/before_architecture_cleanup/backend_1784127601/status/ride_status.js
- archive/phase_scripts/cablink_beta_launch_engine.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- archive/phase_scripts/install_cablink_operational_core.js
- backend/services/driver_service.js
- backend/status/ride_status.js
- beta/onboarding/driver_system.js

### recordRide
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js
- backend/services/economy_ledger_service.js

### recordReward
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js
- backend/services/economy_ledger_service.js

### updateRideStatus
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/phase_scripts/cablink_phase37_ledger_sync_dashboard.js
- backend/services/economy_ledger_service.js

### driverEconomy
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/phase_scripts/cablink_phase37_ledger_sync_dashboard.js
- backend/services/economy_ledger_service.js

### driverHistory
- archive/before_architecture_cleanup/backend_1784127601/services/economy_ledger_service.js
- archive/phase_scripts/cablink_phase35_persistent_economy_ledger.js
- archive/phase_scripts/cablink_phase37_ledger_sync_dashboard.js
- backend/services/economy_ledger_service.js

### getUser
- archive/before_architecture_cleanup/backend_1784127601/services/identity_service.js
- archive/before_architecture_cleanup/backend_1784127601/users/user_account_engine.js
- archive/before_architecture_cleanup/frontend_1784127601/services/identity_api.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_phase53_identity_engine.js
- backend/services/identity_service.js
- backend/users/user_account_engine.js
- frontend/services/identity_api.js
- migration_backup/frontend/services/identity_api.js

### createUser
- archive/before_architecture_cleanup/backend_1784127601/services/identity_service.js
- archive/before_architecture_cleanup/backend_1784127601/users/user_account_engine.js
- archive/phase_scripts/cablink_live_network_layer_install.js
- archive/phase_scripts/cablink_phase53_identity_engine.js
- backend/services/identity_service.js
- backend/users/user_account_engine.js

### verifyRole
- archive/before_architecture_cleanup/backend_1784127601/services/identity_service.js
- archive/phase_scripts/cablink_phase53_identity_engine.js
- backend/services/identity_service.js

### addRequest
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- backend/services/live_demand_service.js

### completeRequest
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- backend/services/live_demand_service.js

### hotspots
- archive/before_architecture_cleanup/backend_1784127601/services/live_demand_service.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- backend/services/live_demand_service.js

### assignDriver
- archive/before_architecture_cleanup/backend_1784127601/services/live_ride_service.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_fix_orchestrator_identity.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- backend/services/live_ride_service.js
- backend/services/ride_orchestrator_service.js

### latest
- archive/before_architecture_cleanup/backend_1784127601/services/location/location_service.js
- archive/phase_scripts/cablink_live_gps_foundation_engine.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- backend/services/location/location_service.js
- beta/live_gps/live_location_engine.js

### profile
- archive/before_architecture_cleanup/backend_1784127601/services/passenger_intelligence_service.js
- archive/phase_scripts/cablink_phase54_passenger_intelligence.js
- backend/services/passenger_intelligence_service.js

### acceptRide
- archive/before_architecture_cleanup/backend_1784127601/services/rideService.js
- backend/services/rideService.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js

### completeRide
- archive/before_architecture_cleanup/backend_1784127601/services/rideService.js
- archive/before_architecture_cleanup/backend_1784127601/services/ride_completion_service.js
- archive/before_architecture_cleanup/frontend_1784127601/js/operations_core.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_phase48_completion_economy.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- archive/phase_scripts/install_operations_core.js
- backend/services/rideService.js
- backend/services/ride_completion_service.js
- frontend/js/operations_core.js
- frontend/js/rides/completionRewardBridge.js
- migration_backup/frontend/js/operations_core.js
- scripts/archive/root_migrations/cablink_completion_finance_reward_bridge_install.js
- scripts/archive/root_migrations/cablink_ride_truth_engine.js
- scripts/archive/root_migrations/cablink_separate_frontend_completion.js

### dispatchRide
- archive/before_architecture_cleanup/backend_1784127601/services/ride_dispatch_bridge.js
- backend/services/ride_dispatch_bridge.js

### driverArrived
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- backend/services/ride_orchestrator_service.js

### startTrip
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- backend/services/ride_orchestrator_service.js

### finishTrip
- archive/before_architecture_cleanup/backend_1784127601/services/ride_orchestrator_service.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- backend/services/ride_orchestrator_service.js

### updateStatus
- archive/before_architecture_cleanup/backend_1784127601/services/ride_service.js
- archive/phase_scripts/install_cablink_operational_core.js
- backend/services/ride_service.js

### active
- archive/before_architecture_cleanup/backend_1784127601/sessions/session_engine.js
- archive/phase_scripts/cablink_real_pilot_environment_install.js
- backend/sessions/session_engine.js

### sendOTP
- archive/before_architecture_cleanup/backend_1784127601/sms/sms_engine.js
- archive/phase_scripts/cablink_final_reality_layers_install.js
- backend/sms/sms_engine.js

### initialize
- archive/before_architecture_cleanup/backend_1784127601/socket/server_socket.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/socket/server_socket.js

### join
- archive/before_architecture_cleanup/backend_1784127601/socket/socket_manager.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/socket/socket_manager.js

### users
- archive/before_architecture_cleanup/backend_1784127601/socket/socket_manager.js
- archive/before_architecture_cleanup/frontend_1784127601/services/user_service.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- archive/phase_scripts/cablink_phase14_websocket_realtime_install.js
- backend/socket/socket_manager.js
- frontend/services/user_service.js
- migration_backup/frontend/services/user_service.js

### change
- archive/before_architecture_cleanup/backend_1784127601/status/ride_status.js
- archive/phase_scripts/cablink_phase16_gps_maps_pilot_install.js
- backend/status/ride_status.js

### assign
- archive/before_architecture_cleanup/backend_1784127601/tasks/task_manager.js
- archive/phase_scripts/cablink_phase21_marketplace_task_bridge_install.js
- backend/tasks/task_manager.js

### post
- archive/before_architecture_cleanup/backend_1784127601/testing/phase34_economy_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase40_demand_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase41_matching_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase42_dispatch_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase46_live_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase47_eta_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase48_completion_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase49_notification_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase50_state_test.js
- archive/before_architecture_cleanup/backend_1784127601/testing/phase51_orchestrator_test.js
- archive/phase_scripts/cablink_phase34_ride_economy_loop.js
- archive/phase_scripts/cablink_phase40_live_demand_engine.js
- archive/phase_scripts/cablink_phase41_driver_matching_engine.js
- archive/phase_scripts/cablink_phase42_dispatch_engine.js
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- archive/phase_scripts/cablink_phase47_driver_eta_engine.js
- archive/phase_scripts/cablink_phase47_fix.js
- archive/phase_scripts/cablink_phase48_completion_economy.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- archive/phase_scripts/cablink_phase50_fix.js
- archive/phase_scripts/cablink_phase50_ride_state_engine.js
- archive/phase_scripts/cablink_phase51_orchestrator.js
- backend/testing/phase34_economy_test.js
- backend/testing/phase40_demand_test.js
- backend/testing/phase41_matching_test.js
- backend/testing/phase42_dispatch_test.js
- backend/testing/phase46_live_test.js
- backend/testing/phase47_eta_test.js
- backend/testing/phase48_completion_test.js
- backend/testing/phase49_notification_test.js
- backend/testing/phase50_state_test.js
- backend/testing/phase51_orchestrator_test.js

### simulate
- archive/before_architecture_cleanup/backend_1784127601/testing/two_phone_pilot.js
- archive/phase_scripts/cablink_reality_bridge_phase5_install.js
- backend/testing/two_phone_pilot.js

### start
- archive/before_architecture_cleanup/backend_1784127601/trips/trip_manager.js
- archive/before_architecture_cleanup/frontend_1784127601/js/realtime/tracking_engine.js
- archive/phase_scripts/cablink_phase15_real_device_activation_install.js
- archive/phase_scripts/cablink_pilot_mission_control_engine.js
- archive/phase_scripts/cablink_pilot_operations_logger.js
- archive/phase_scripts/cablink_real_world_completion_engine.js
- backend/trips/trip_manager.js
- beta/operations/session_engine.js
- beta/pilot_mission/pilot_session.js
- frontend/js/driver/driverDispatchBridge.js
- frontend/js/realtime/tracking_engine.js
- migration_backup/frontend/js/realtime/tracking_engine.js
- scripts/archive/root_migrations/cablink_live_dispatch_bridge_install.js

### evaluateDriver
- archive/before_architecture_cleanup/backend_1784127601/trust/trust_engine.js
- archive/phase_scripts/cablink_intelligence_layer_install.js
- backend/trust/trust_engine.js

### attachWallet
- archive/before_architecture_cleanup/backend_1784127601/users/wallet_manager.js
- archive/phase_scripts/cablink_missing_parts_completion_engine.js
- archive/phase_scripts/cablink_production_wiring_fix.js
- backend/users/wallet_manager.js

### required
- archive/before_architecture_cleanup/backend_1784127601/validation/input_validator.js
- archive/phase_scripts/cablink_pilot_hardening_install.js
- backend/validation/input_validator.js

### App
- archive/before_architecture_cleanup/frontend_1784127601/App.jsx
- archive/phase_scripts/cablink_phase45_app_shell.js
- frontend/App.jsx
- migration_backup/frontend/App.jsx

### test
- archive/before_architecture_cleanup/frontend_1784127601/api/bridge_test.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- frontend/api/bridge_test.js
- migration_backup/frontend/api/bridge_test.js

### request
- archive/before_architecture_cleanup/frontend_1784127601/api/cablink_api.js
- archive/before_architecture_cleanup/frontend_1784127601/mobile/device_permissions.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- archive/phase_scripts/cablink_phase11_window_fix.js
- archive/phase_scripts/cablink_phase18_pwa_mobile_activation_install.js
- frontend/api/cablink_api.js
- frontend/mobile/device_permissions.js
- migration_backup/frontend/api/cablink_api.js
- migration_backup/frontend/mobile/device_permissions.js
- scripts/archive/root_migrations/cablink_accept_complete_truth_test.js
- scripts/archive/root_migrations/cablink_full_dispatch_truth_test.js
- scripts/archive/root_migrations/cablink_ride_truth_test.js

### getTasks
- archive/before_architecture_cleanup/frontend_1784127601/api/task_api.js
- archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- archive/phase_scripts/cablink_phase30_api_test_fix.js
- frontend/api/task_api.js
- migration_backup/frontend/api/task_api.js

### acceptTask
- archive/before_architecture_cleanup/frontend_1784127601/api/task_api.js
- archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- archive/phase_scripts/cablink_phase30_api_test_fix.js
- frontend/api/task_api.js
- migration_backup/frontend/api/task_api.js

### BottomNavigation
- archive/before_architecture_cleanup/frontend_1784127601/components/BottomNavigation.jsx
- frontend/components/BottomNavigation.jsx
- migration_backup/frontend/components/BottomNavigation.jsx

### CabLinkHeader
- archive/before_architecture_cleanup/frontend_1784127601/components/CabLinkHeader.jsx
- frontend/components/CabLinkHeader.jsx
- migration_backup/frontend/components/CabLinkHeader.jsx

### DashboardCard
- archive/before_architecture_cleanup/frontend_1784127601/components/DashboardCard.jsx
- frontend/components/DashboardCard.jsx
- migration_backup/frontend/components/DashboardCard.jsx

### LegacyCabLink
- archive/before_architecture_cleanup/frontend_1784127601/components/LegacyCabLink.jsx
- frontend/components/LegacyCabLink.jsx
- migration_backup/frontend/components/LegacyCabLink.jsx

### button
- archive/before_architecture_cleanup/frontend_1784127601/components/bstm_delivery_button.js
- archive/phase_scripts/cablink_phase24_task_route_mount_install.js
- frontend/components/bstm_delivery_button.js
- migration_backup/frontend/components/bstm_delivery_button.js

### menu
- archive/before_architecture_cleanup/frontend_1784127601/components/bstm_menu.js
- archive/phase_scripts/cablink_phase19_bstm_visible_ui_install.js
- frontend/components/bstm_menu.js
- migration_backup/frontend/components/bstm_menu.js

### render
- archive/before_architecture_cleanup/frontend_1784127601/components/delivery_earnings_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/components/demand_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/components/driver_dashboard.js
- archive/before_architecture_cleanup/frontend_1784127601/components/driver_demand_map.js
- archive/before_architecture_cleanup/frontend_1784127601/components/driver_economy_dashboard.js
- archive/before_architecture_cleanup/frontend_1784127601/components/driver_economy_screen.js
- archive/before_architecture_cleanup/frontend_1784127601/components/driver_task_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/components/live_driver_dashboard.js
- archive/before_architecture_cleanup/frontend_1784127601/components/passenger_trip_status.js
- archive/before_architecture_cleanup/frontend_1784127601/components/thb_reward_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/components/thb_wallet_panel.js
- archive/before_architecture_cleanup/frontend_1784127601/components/updates_center.js
- archive/before_architecture_cleanup/frontend_1784127601/maps/live_map_component.js
- archive/before_architecture_cleanup/frontend_1784127601/screens/driver_control_screen.js
- archive/before_architecture_cleanup/frontend_1784127601/screens/ecosystem_hub_screen.js
- archive/before_architecture_cleanup/frontend_1784127601/screens/passenger_ride_screen.js
- archive/phase_scripts/cablink_bstm_hub_install.js
- archive/phase_scripts/cablink_phase17_human_interface_install.js
- archive/phase_scripts/cablink_phase22_driver_task_dashboard_install.js
- archive/phase_scripts/cablink_phase25_delivery_economy_install.js
- archive/phase_scripts/cablink_phase26_thb_delivery_rewards_install.js
- archive/phase_scripts/cablink_phase27_reward_wallet_install.js
- archive/phase_scripts/cablink_phase29_driver_economy_dashboard_install.js
- archive/phase_scripts/cablink_phase31_live_driver_dashboard_refresh.js
- archive/phase_scripts/cablink_phase33_driver_economy_ui_install.js
- archive/phase_scripts/cablink_phase39_driver_visibility_layer.js
- archive/phase_scripts/cablink_phase43_ui_integration.js
- frontend/components/delivery_earnings_panel.js
- frontend/components/demand_panel.js
- frontend/components/driver_dashboard.js
- frontend/components/driver_demand_map.js
- frontend/components/driver_economy_dashboard.js
- frontend/components/driver_economy_screen.js
- frontend/components/driver_task_panel.js
- frontend/components/live_driver_dashboard.js
- frontend/components/passenger_trip_status.js
- frontend/components/thb_reward_panel.js
- frontend/components/thb_wallet_panel.js
- frontend/components/updates_center.js
- frontend/maps/live_map_component.js
- frontend/screens/driver_control_screen.js
- frontend/screens/ecosystem_hub_screen.js
- frontend/screens/passenger_ride_screen.js
- migration_backup/frontend/components/delivery_earnings_panel.js
- migration_backup/frontend/components/demand_panel.js
- migration_backup/frontend/components/driver_dashboard.js
- migration_backup/frontend/components/driver_demand_map.js
- migration_backup/frontend/components/driver_economy_dashboard.js
- migration_backup/frontend/components/driver_economy_screen.js
- migration_backup/frontend/components/driver_task_panel.js
- migration_backup/frontend/components/live_driver_dashboard.js
- migration_backup/frontend/components/passenger_trip_status.js
- migration_backup/frontend/components/thb_reward_panel.js
- migration_backup/frontend/components/thb_wallet_panel.js
- migration_backup/frontend/components/updates_center.js
- migration_backup/frontend/maps/live_map_component.js
- migration_backup/frontend/screens/driver_control_screen.js
- migration_backup/frontend/screens/ecosystem_hub_screen.js
- migration_backup/frontend/screens/passenger_ride_screen.js

### createCard
- archive/before_architecture_cleanup/frontend_1784127601/components/ecosystem_card.js
- archive/phase_scripts/cablink_phase19_bstm_visible_ui_install.js
- frontend/components/ecosystem_card.js
- migration_backup/frontend/components/ecosystem_card.js

### PassengerDashboard
- archive/before_architecture_cleanup/frontend_1784127601/components/passenger_dashboard.jsx
- archive/phase_scripts/cablink_phase54_passenger_dashboard.js
- frontend/components/passenger_dashboard.jsx
- migration_backup/frontend/components/passenger_dashboard.jsx

### PassengerProfileCard
- archive/before_architecture_cleanup/frontend_1784127601/components/passenger_profile_card.jsx
- archive/phase_scripts/cablink_phase54_passenger_intelligence.js
- frontend/components/passenger_profile_card.jsx
- migration_backup/frontend/components/passenger_profile_card.jsx

### PassengerTripStatus
- archive/before_architecture_cleanup/frontend_1784127601/components/passenger_trip_status.jsx
- frontend/components/passenger_trip_status.jsx
- migration_backup/frontend/components/passenger_trip_status.jsx

### RideStatusCard
- archive/before_architecture_cleanup/frontend_1784127601/components/ride_status_card.jsx
- archive/phase_scripts/cablink_phase46_live_ride_state.js
- frontend/components/ride_status_card.jsx
- migration_backup/frontend/components/ride_status_card.jsx

### RideTimeline
- archive/before_architecture_cleanup/frontend_1784127601/components/ride_timeline.jsx
- archive/phase_scripts/cablink_phase49_notification_engine.js
- frontend/components/ride_timeline.jsx
- migration_backup/frontend/components/ride_timeline.jsx

### StatusCard
- archive/before_architecture_cleanup/frontend_1784127601/components/status_card.jsx
- archive/phase_scripts/cablink_phase45_app_shell.js
- frontend/components/status_card.jsx
- migration_backup/frontend/components/status_card.jsx

### THBRewardPanel
- archive/before_architecture_cleanup/frontend_1784127601/components/thb_reward_panel.jsx
- frontend/components/thb_reward_panel.jsx
- migration_backup/frontend/components/thb_reward_panel.jsx

### CABLINK_STATE_RECOVERY
- archive/before_architecture_cleanup/frontend_1784127601/js/app.js
- archive/truth_cleanup_1784127676771/frontend_js_app.js
- frontend/js/app.js

### sendRideToBackend
- archive/before_architecture_cleanup/frontend_1784127601/js/app.js
- archive/phase_scripts/cablink_frontend_real_booking_bridge.js
- archive/state_recovery/app_before_state_recovery_1784127025.js
- archive/truth_cleanup_1784127676771/frontend_js_app.js
- frontend/js/app.js
- scripts/archive/root_migrations/app_before_booking_migration.js
- scripts/archive/root_migrations/app_before_bookride_cleanup.js
- scripts/archive/root_migrations/app_before_cleanup_final.js

### total
- archive/before_architecture_cleanup/frontend_1784127601/js/fare_engine.js
- frontend/js/fare_engine.js

### type
- archive/before_architecture_cleanup/frontend_1784127601/js/fare_engine.js
- fare_engine.js
- frontend/js/app_core.js
- frontend/js/fare_engine.js

### surge
- archive/before_architecture_cleanup/frontend_1784127601/js/fare_engine.js
- fare_engine.js
- frontend/js/fare_engine.js

### patchProfile
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### loadFB
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### initFB
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### name
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### phone
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### lic
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### veh
- archive/before_architecture_cleanup/frontend_1784127601/js/fix.js
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- frontend/js/fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### gate
- archive/before_architecture_cleanup/frontend_1784127601/js/role.js
- frontend/js/role.js
- role.js

### run
- archive/before_architecture_cleanup/frontend_1784127601/js/simulation_engine.js
- archive/phase_scripts/cablink_phase11_frontend_reality_ui_install.js
- archive/phase_scripts/cablink_phase11_ui_test.js
- archive/phase_scripts/cablink_port_doctor.js
- archive/phase_scripts/install_simulation_engine.js
- frontend/js/simulation_engine.js
- migration_backup/frontend/js/simulation_engine.js
- scripts/archive/root_migrations/cablink_accept_complete_truth_test.js
- scripts/archive/root_migrations/cablink_full_dispatch_truth_test.js
- scripts/archive/root_migrations/cablink_ride_truth_test.js
- scripts/archive/root_migrations/cablink_test_accept_complete.js

### enter
- archive/before_architecture_cleanup/frontend_1784127601/mobile/mobile_entry.js
- archive/phase_scripts/cablink_phase18_pwa_mobile_activation_install.js
- frontend/mobile/mobile_entry.js
- migration_backup/frontend/mobile/mobile_entry.js

### DriverDashboard
- archive/before_architecture_cleanup/frontend_1784127601/pages/DriverDashboard.jsx
- archive/phase_scripts/cablink_phase44_pwa_pages.js
- frontend/pages/DriverDashboard.jsx
- migration_backup/frontend/pages/DriverDashboard.jsx

### PassengerRide
- archive/before_architecture_cleanup/frontend_1784127601/pages/PassengerRide.jsx
- archive/phase_scripts/cablink_phase44_pwa_pages.js
- frontend/pages/PassengerRide.jsx
- migration_backup/frontend/pages/PassengerRide.jsx

### requestRide
- archive/before_architecture_cleanup/frontend_1784127601/pages/PassengerRide.jsx
- archive/before_architecture_cleanup/frontend_1784127601/services/ride_service.js
- archive/phase_scripts/cablink_database_wiring_upgrade.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- archive/phase_scripts/cablink_phase44_pwa_pages.js
- archive/phase_scripts/cablink_real_hailing_completion_engine.js
- frontend/js/rides/rideService.js
- frontend/pages/PassengerRide.jsx
- frontend/services/ride_service.js
- migration_backup/frontend/pages/PassengerRide.jsx
- migration_backup/frontend/services/ride_service.js
- scripts/archive/root_migrations/cablink_module_builder.js

### UpdatesCenter
- archive/before_architecture_cleanup/frontend_1784127601/pages/UpdatesCenter.jsx
- archive/phase_scripts/cablink_phase44_pwa_pages.js
- frontend/pages/UpdatesCenter.jsx
- migration_backup/frontend/pages/UpdatesCenter.jsx

### getDriverEconomy
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_dashboard_api.js
- archive/phase_scripts/cablink_phase43_ui_integration.js
- frontend/services/driver_dashboard_api.js
- migration_backup/frontend/services/driver_dashboard_api.js

### getHotspots
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_dashboard_api.js
- archive/phase_scripts/cablink_phase43_ui_integration.js
- frontend/services/driver_dashboard_api.js
- migration_backup/frontend/services/driver_dashboard_api.js

### getUpdates
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_dashboard_api.js
- archive/before_architecture_cleanup/frontend_1784127601/services/updates_api.js
- archive/phase_scripts/cablink_phase39_driver_visibility_layer.js
- archive/phase_scripts/cablink_phase43_ui_integration.js
- frontend/services/driver_dashboard_api.js
- frontend/services/updates_api.js
- migration_backup/frontend/services/driver_dashboard_api.js
- migration_backup/frontend/services/updates_api.js

### loadDashboard
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_dashboard_live.js
- archive/phase_scripts/cablink_phase31_live_driver_dashboard_refresh.js
- frontend/services/driver_dashboard_live.js
- migration_backup/frontend/services/driver_dashboard_live.js

### build
- archive/before_architecture_cleanup/frontend_1784127601/services/driver_economy_service.js
- archive/phase_scripts/cablink_phase29_driver_economy_dashboard_install.js
- frontend/services/driver_economy_service.js
- migration_backup/frontend/services/driver_economy_service.js

### getDriverDashboard
- archive/before_architecture_cleanup/frontend_1784127601/services/economy_dashboard_api.js
- archive/phase_scripts/cablink_phase32_driver_dashboard_api_mount.js
- archive/phase_scripts/cablink_phase33_api_test_fix.js
- frontend/services/economy_dashboard_api.js
- migration_backup/frontend/services/economy_dashboard_api.js

### loadDriverEconomy
- archive/before_architecture_cleanup/frontend_1784127601/services/live_driver_economy.js
- archive/phase_scripts/cablink_phase30_live_driver_data_install.js
- frontend/services/live_driver_economy.js
- migration_backup/frontend/services/live_driver_economy.js

### getTimeline
- archive/before_architecture_cleanup/frontend_1784127601/services/notification_api.js
- archive/phase_scripts/cablink_phase49_notification_engine.js
- frontend/services/notification_api.js
- migration_backup/frontend/services/notification_api.js

### rides
- archive/before_architecture_cleanup/frontend_1784127601/services/ride_service.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- frontend/services/ride_service.js
- migration_backup/frontend/services/ride_service.js

### refresh
- archive/before_architecture_cleanup/frontend_1784127601/services/task_service.js
- archive/phase_scripts/cablink_phase23_live_task_api_bridge_install.js
- frontend/services/task_service.js
- migration_backup/frontend/services/task_service.js

### setUser
- archive/before_architecture_cleanup/frontend_1784127601/state/session_store.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- frontend/state/session_store.js
- migration_backup/frontend/state/session_store.js

### setRide
- archive/before_architecture_cleanup/frontend_1784127601/state/session_store.js
- archive/phase_scripts/cablink_phase10_frontend_backend_bridge_install.js
- frontend/state/session_store.js
- migration_backup/frontend/state/session_store.js

### set
- archive/before_architecture_cleanup/frontend_1784127601/state/task_state.js
- archive/phase_scripts/cablink_phase22_driver_task_dashboard_install.js
- frontend/js/rides/rideStateMachine.js
- frontend/state/task_state.js
- migration_backup/frontend/state/task_state.js
- scripts/archive/root_migrations/cablink_ride_state_machine_install.js

### p
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### d
- archive/old_backups/backups_v67/recovery_backup_20260713_110611/CabLink-pwa/fix.js
- fix.js
- scripts/archive/root_migrations/fix_before_bookride_cleanup.js

### approve
- archive/phase_scripts/cablink_beta_launch_engine.js
- beta/onboarding/driver_system.js

### locationPermission
- archive/phase_scripts/cablink_beta_launch_engine.js
- beta/onboarding/passenger_system.js

### walk
- archive/phase_scripts/cablink_dependency_graph.js
- archive/phase_scripts/cablink_react_integration_audit.js
- cablink_forensic_audit_v2.js
- cablink_reality_doctor.js
- cablink_runtime_truth_audit_v3.js
- scripts/archive/root_migrations/cablink_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### scan
- archive/phase_scripts/cablink_driver_api_reality_check.js
- archive/phase_scripts/cablink_final_production_gatekeeper_v2.js
- archive/phase_scripts/cablink_find_ride_truth.js
- archive/phase_scripts/cablink_production_monitor.js
- archive/phase_scripts/cablink_reality_connection_scanner.js
- archive/phase_scripts/install_cablink_production_monitor.js
- archive/phase_scripts/install_cablink_production_monitor_v2.js
- cablink_architecture_health_audit.js
- scripts/archive/root_migrations/cablink_architecture_health_audit.js

### addEventListener
- archive/phase_scripts/cablink_driver_profit_audit.js
- archive/phase_scripts/cablink_fare_test.js
- archive/phase_scripts/cablink_final_intelligence_audit.js
- archive/phase_scripts/cablink_final_release_engine.js
- archive/phase_scripts/cablink_launch_certification_engine.js
- archive/phase_scripts/cablink_market_fare_audit.js
- archive/phase_scripts/cablink_money_flow_audit.js
- archive/phase_scripts/cablink_simulation_test.js
- scripts/archive/root_migrations/cablink_financial_test.js

### getElementById
- archive/phase_scripts/cablink_driver_profit_audit.js
- archive/phase_scripts/cablink_fare_test.js
- archive/phase_scripts/cablink_final_intelligence_audit.js
- archive/phase_scripts/cablink_final_release_engine.js
- archive/phase_scripts/cablink_launch_certification_engine.js
- archive/phase_scripts/cablink_market_fare_audit.js
- archive/phase_scripts/cablink_money_flow_audit.js
- archive/phase_scripts/cablink_simulation_test.js
- scripts/archive/root_migrations/cablink_financial_test.js

### querySelectorAll
- archive/phase_scripts/cablink_driver_profit_audit.js
- archive/phase_scripts/cablink_fare_test.js
- archive/phase_scripts/cablink_final_intelligence_audit.js
- archive/phase_scripts/cablink_final_release_engine.js
- archive/phase_scripts/cablink_launch_certification_engine.js
- archive/phase_scripts/cablink_market_fare_audit.js
- archive/phase_scripts/cablink_money_flow_audit.js
- archive/phase_scripts/cablink_simulation_test.js
- scripts/archive/root_migrations/cablink_financial_test.js

### exists
- archive/phase_scripts/cablink_final_production_gatekeeper_v2.js
- archive/phase_scripts/cablink_final_release_engine.js
- archive/phase_scripts/cablink_launch_certification_engine.js
- archive/phase_scripts/install_cablink_production_monitor.js
- cablink.js
- cablink_forensic_audit_v2.js
- cablink_runtime_truth_audit_v3.js
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js

### nearbyDrivers
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js
- beta/geo/geo_engine.js

### fare
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js
- beta/geo/geo_engine.js

### dLat
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js
- beta/geo/geo_engine.js
- frontend/js/app_core.js

### dLon
- archive/phase_scripts/cablink_geo_intelligence_certification_engine.js
- beta/geo/geo_engine.js

### pass
- archive/phase_scripts/cablink_launch_certification_engine.js
- archive/phase_scripts/cablink_real_audit_engine.js

### updateLocation
- archive/phase_scripts/cablink_live_gps_foundation_engine.js
- beta/live_gps/live_location_engine.js

### health
- archive/phase_scripts/cablink_persistent_pilot_database_install.js
- database/production/database_health.js

### event
- archive/phase_scripts/cablink_pilot_mission_control_engine.js
- beta/pilot_mission/pilot_session.js

### metrics
- archive/phase_scripts/cablink_pilot_operations_engine_install.js
- pilot/operations/pilot_metrics.js

### log
- archive/phase_scripts/cablink_pilot_operations_logger.js
- beta/operations/event_logger.js

### recordTrial
- archive/phase_scripts/cablink_pilot_trial_recorder_install.js
- pilot/trials/trial_recorder.js

### allTrials
- archive/phase_scripts/cablink_pilot_trial_recorder_install.js
- pilot/trials/trial_recorder.js

### count
- archive/phase_scripts/cablink_precision_audit.js
- archive/phase_scripts/cablink_stability_check_v303.js
- scripts/archive/root_migrations/cablink_dispatch_connection_audit.js
- scripts/archive/root_migrations/cablink_frontend_truth_audit.js

### checkSection
- archive/phase_scripts/cablink_production_monitor.js
- archive/phase_scripts/install_cablink_production_monitor_v2.js

### bookRide
- archive/phase_scripts/cablink_real_engine_replace.js
- archive/phase_scripts/fix_bookride.js

### simulateRide
- archive/phase_scripts/cablink_reality_cutover.js
- scripts/archive/root_migrations/cablink_frontend_cleanup_v2.js
- scripts/archive/root_migrations/cablink_remove_fake_completion.js

### section
- archive/phase_scripts/install_cablink_production_monitor.js
- cablink_forensic_audit_v2.js
- cablink_runtime_truth_audit_v3.js

### rel
- cablink_forensic_audit_v2.js
- cablink_runtime_truth_audit_v3.js

### main
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### relative
- cablink_full_audit.js
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### lineNumberAt
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### extractBraceBody
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### findFunctionDefinitions
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### getScriptLoadOrder
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### annotateLoadOrder
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### scanFakePatterns
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### scanBackendRoutes
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### checkRequiredEndpoints
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### findMatchingParenEnd
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### scanFrontendFetches
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### buildConnectionMap
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### scanDeadCode
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### httpGetJson
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### runLiveHealthTests
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### writeJson
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### classifySummaryColor
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### buildTruthReportMarkdown
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### definitions
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### MODE
- cablink_reality_doctor.js
- scripts/archive/root_migrations/cablink_reality_doctor.js

### pending
- fix.js
- frontend/js/app_core.js

### submitApplication
- frontend/js/driver/applicationService.js
- scripts/archive/root_migrations/cablink_driver_wiring_engine.js

### goOnline
- frontend/js/driver/driverController.js
- frontend/js/driver/driverModeBridge.js
- scripts/archive/root_migrations/cablink_driver_bridge_repair.js
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js

### showRequest
- frontend/js/driver/driverDispatchBridge.js
- scripts/archive/root_migrations/cablink_live_dispatch_bridge_install.js

### setState
- frontend/js/driver/driverLifecycleControls.js
- scripts/archive/root_migrations/cablink_driver_lifecycle_controls_install.js

### createControls
- frontend/js/driver/driverLifecycleControls.js
- scripts/archive/root_migrations/cablink_driver_lifecycle_controls_install.js

### createDriverPanel
- frontend/js/driver/driverModeBridge.js
- scripts/archive/root_migrations/cablink_driver_bridge_repair.js

### goOffline
- frontend/js/driver/driverModeBridge.js
- scripts/archive/root_migrations/cablink_driver_bridge_repair.js
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js

### updateUI
- frontend/js/driver/driverModeBridge.js
- scripts/archive/root_migrations/cablink_driver_bridge_repair.js
- scripts/archive/root_migrations/cablink_driver_mode_bridge_install.js

### driverOnline
- frontend/js/driver/driverService.js
- scripts/archive/root_migrations/cablink_module_builder.js

### getRideRequests
- frontend/js/driver/driverService.js
- scripts/archive/root_migrations/cablink_module_builder.js

### createStatus
- frontend/js/rides/passengerRideStatus.js
- scripts/archive/root_migrations/cablink_passenger_state_listener_install.js

### if
- scripts/archive/root_migrations/cablink_driver_wiring_engine.js
- scripts/archive/root_migrations/cablink_frontend_ride_truth_bridge.js


## BUILD / RUNTIME EVIDENCE
### npm run build
- Exit code: 1

STDERR:
```
npm error Missing script: "build"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: /data/data/com.termux/files/home/.npm/_logs/2026-07-25T16_41_35_013Z-debug-0.log

```
### npm run dev
- Exit code: 1

STDERR:
```
npm error Missing script: "dev"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: /data/data/com.termux/files/home/.npm/_logs/2026-07-25T16_41_36_404Z-debug-0.log

```

## RISK REGISTER
### HIGH — No production build script
package.json does not define a build script. Production frontend reproducibility is not established.

### HIGH — Multiple HTML entry candidates
36 HTML files exist. Runtime truth must establish which one is actually served in production.

### HIGH — Multiple backend server candidates
7 server-like files contain server startup or Express logic.

### HIGH — Frontend API calls without detected backend matches
4 frontend API calls could not be mapped to detected backend routes.

### HIGH — Multiple ride state implementations
22 files contain ride-state logic. A single authoritative state machine must be verified.

### HIGH — Fare logic is distributed across multiple files
14 files contain significant fare-related logic.

### HIGH — Multiple competing storage implementations
The repository contains substantial evidence of multiple database/storage strategies.

### HIGH — Duplicate critical function: bookRide
Found in 2 files. Runtime authority is unresolved.

### HIGH — Duplicate critical function: requestRide
Found in 12 files. Runtime authority is unresolved.

### HIGH — Duplicate critical function: completeRide
Found in 16 files. Runtime authority is unresolved.


## FINAL CANONICALITY VERDICT

The purpose of this audit is to answer five questions:

1. Which frontend is actually canonical?
2. Which backend server is actually canonical?
3. Which API contracts actually connect?
4. Which ride/fare/location implementations are authoritative?
5. Which parts of CabLink remain duplicated, conflicting, or unverified?

### Classification Rules

🟢 VERIFIED LIVE
- Runtime evidence confirms the component is active and connected.

🟡 PRESENT BUT UNVERIFIED
- Code exists but runtime execution was not proven.

🟠 CONFLICTING
- Multiple competing implementations exist.

🔴 BROKEN
- Runtime or static evidence shows a failed dependency or disconnected contract.

⚫ DEAD / UNUSED
- No active runtime path could be established.

### IMPORTANT

This audit is intentionally conservative.

The existence of a function, route, database adapter, or UI component does NOT prove that it is part of the production runtime.

The final source of truth must be established from:

- package scripts
- actual Vite entry chain
- actual backend startup
- actual mounted routes
- API request/response contracts
- runtime build results
- real end-to-end smoke tests

No source files were modified by this audit.
