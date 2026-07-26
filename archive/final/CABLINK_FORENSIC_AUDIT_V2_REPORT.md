# CABLINK FORENSIC SYSTEM AUDIT v2

Generated: 2026-07-25T16:35:58.686Z
Repository: /data/data/com.termux/files/home/CabLink-pwa

> READ-ONLY AUDIT. No application source files were modified.

This report is an evidence-based static forensic analysis. It identifies architectural conflicts, broken references, missing connections, duplicated logic, and likely operational gaps. It does not claim that a feature is runtime-healthy merely because a function or route exists.

## EXECUTIVE SUMMARY

- Total files scanned: **482**
- Total folders discovered: **136**
- JavaScript syntax errors: **0**
- Broken local imports: **0**
- Frontend API calls without a detected backend match: **19**
- Core functions with duplicate implementations: **11**
- HTML entry candidates detected: **6**
- Vite configuration: **vite.config.js**
- Production build directory: **FOUND**

### Immediate risk classification

- 🔴 **HIGH:** Frontend API calls exist without a detected backend route match.
- 🟠 **HIGH:** Multiple competing implementations of core business functions exist.
- 🟠 **HIGH:** Multiple possible application entry points exist. Determine the single canonical production entry.


## 1. REPOSITORY STRUCTURE

Total files: **482**
Total folders: **136**

### Files by top-level area

- `backend`: 230
- `frontend`: 116
- `(root)`: 51
- `beta`: 42
- `database`: 13
- `pilot`: 11
- `deployment`: 10
- `docs`: 3
- `.vercel`: 2
- `admin`: 1
- `api`: 1
- `config`: 1
- `future`: 1

### Files by extension

- `.js`: 347
- `.json`: 52
- `.md`: 19
- `.jsx`: 16
- `.py`: 11
- `.sh`: 7
- `.txt`: 4
- `.bak`: 4
- `(no extension)`: 3
- `.html`: 3
- `.example`: 1
- `.zip`: 1
- `.disabled`: 1
- `.backup`: 1
- `.backup_truth_1784102755787`: 1
- `.backup_1784096856161`: 1
- `.backup_route_cleanup_1784103021100`: 1
- `.backup_orchestrator_1784101867069`: 1
- `.backup_create_order_1784101726427`: 1
- `.backup_identity_1784101614431`: 1
- `.backup_single_storage_1784102172187`: 1
- `.log`: 1
- `.bak_before_sync`: 1
- `.backup_1784097007863`: 1
- `.backup_booking_1784097198231`: 1
- `.css`: 1

## 2. ACTUAL APPLICATION ARCHITECTURE

### Potential entry points

- `index.html`
- `frontend/index.html`
- `launcher.html`
- `frontend/main.jsx`
- `frontend/js/app.js`
- `frontend/js/app_core.js`

### HTML files

- `frontend/index.html`
- `index.html`
- `launcher.html`

### React / JSX / TSX files

React-like source files detected: 16
- `frontend/App.jsx`
- `frontend/components/BottomNavigation.jsx`
- `frontend/components/CabLinkHeader.jsx`
- `frontend/components/DashboardCard.jsx`
- `frontend/components/LegacyCabLink.jsx`
- `frontend/components/passenger_dashboard.jsx`
- `frontend/components/passenger_profile_card.jsx`
- `frontend/components/passenger_trip_status.jsx`
- `frontend/components/ride_status_card.jsx`
- `frontend/components/ride_timeline.jsx`
- `frontend/components/status_card.jsx`
- `frontend/components/thb_reward_panel.jsx`
- `frontend/main.jsx`
- `frontend/pages/DriverDashboard.jsx`
- `frontend/pages/PassengerRide.jsx`
- `frontend/pages/UpdatesCenter.jsx`

Vite configuration: vite.config.js

### Package scripts

- `start`: `node backend/server.js`
- `backend`: `node backend/server.js`

### Likely production/development commands

- `start`: `node backend/server.js`
- `backend`: `node backend/server.js`

## 3. HTML SCRIPT LOADING AND ENTRYPOINT HEALTH

### frontend/index.html

- Script #1: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — external
- Script #2: `https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js` — external
- Inline script #3 at approximately line 657
- Script #4: `/main.jsx` — FOUND
- Inline script #5 at approximately line 1747
- Inline script #6 at approximately line 1870
- Inline script #7 at approximately line 2021
- Inline script #8 at approximately line 2056
- Inline script #9 at approximately line 2136
- Inline script #10 at approximately line 2213
- Inline script #11 at approximately line 2267
- Inline script #12 at approximately line 2358
- Inline script #13 at approximately line 2370

### index.html

- Script #1: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` — external
- Script #2: `https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js` — external
- Inline script #3 at approximately line 664
- Inline script #4 at approximately line 1700
- Script #5: `frontend/js/app_core.js` — FOUND
- Script #6: `role.js` — FOUND
- Script #7: `fix.js` — FOUND
- Script #8: `fare_engine.js` — FOUND
- Script #9: `frontend/js/rides/rideStateMachine.js` — FOUND
- Script #10: `frontend/js/rides/passengerRideStatus.js` — FOUND
- Script #11: `frontend/js/driver/driverLifecycleControls.js` — FOUND
- Script #12: `frontend/js/rides/completionRewardBridge.js` — FOUND

### launcher.html

- Inline script #1 at approximately line 15


## 4. IMPORT / MODULE INTEGRITY

Total imports/requires detected: 308
Broken local imports: 0

✅ No unresolved local imports detected by static resolution.

## 5. JAVASCRIPT SYNTAX HEALTH

Checked JavaScript files: 347
Broken JavaScript files: 0

✅ No standalone `.js` syntax errors detected.

## 6. FRONTEND → BACKEND API FORENSIC CHECK

Frontend API calls detected: 58
Backend routes detected: 176
Matched API calls: 39
Unmatched API calls: 19

### FRONTEND CALLS WITH NO DETECTED BACKEND MATCH
- ❌ FETCH /api/ride/ — frontend/components/passenger_dashboard.jsx:16
- ❌ FETCH /api/ride/ — frontend/components/passenger_dashboard.jsx:21
- ❌ FETCH /api/dispatch/requests — frontend/js/driver/driverDispatchBridge.js:44
- ❌ FETCH /api/dispatch/accept — frontend/js/driver/driverDispatchBridge.js:127
- ❌ FETCH /api/driver/DRIVER001/economy — frontend/pages/DriverDashboard.jsx:14
- ❌ FETCH /api/driver/hotspots — frontend/pages/DriverDashboard.jsx:19
- ❌ FETCH /api/dispatch/request — frontend/pages/PassengerRide.jsx:25
- ❌ FETCH /api/updates — frontend/pages/UpdatesCenter.jsx:13
- ❌ FETCH /api/driver/demand — frontend/services/demand_api.js:5
- ❌ FETCH /api/driver/ — frontend/services/driver_dashboard_api.js:4
- ❌ FETCH /api/driver/hotspots — frontend/services/driver_dashboard_api.js:15
- ❌ FETCH /api/updates — frontend/services/driver_dashboard_api.js:26
- ❌ FETCH /api/user/ — frontend/services/identity_api.js:6
- ❌ FETCH /api/ride/ — frontend/services/live_ride_api.js:6
- ❌ FETCH /api/ride/status — frontend/services/live_ride_api.js:18
- ❌ FETCH /api/ride/ — frontend/services/notification_api.js:4
- ❌ FETCH /api/ride/ — frontend/services/passenger_dashboard_api.js:5
- ❌ FETCH /api/ride/ — frontend/services/passenger_dashboard_api.js:10
- ❌ FETCH /api/updates — frontend/services/updates_api.js:5

### BACKEND ROUTE INVENTORY
- GET locations — backend/location/gps_event_engine.js:36
- GET rewards — backend/rewards/thb_claim_engine.js:8
- POST /api/rides — backend/ride_api_patch.js:7
- GET /api/rides — backend/ride_api_patch.js:36
- GET /api/rides/:id — backend/ride_api_patch.js:46
- PATCH /api/rides/:id — backend/ride_api_patch.js:65
- GET rides — backend/rides/ride_engine.js:36
- POST /ride/complete — backend/routes/completion_api.js:8
- POST /dispatch/request — backend/routes/dispatch_api.js:11
- POST /dispatch/match — backend/routes/dispatch_api.js:31
- POST /dispatch/accept — backend/routes/dispatch_api.js:52
- GET /dispatch/list — backend/routes/dispatch_api.js:73
- GET /driver/:id/dashboard — backend/routes/driver_dashboard_api.js:9
- GET /driver/demand — backend/routes/driver_demand_api.js:8
- GET /driver/:id/economy — backend/routes/driver_economy.js:9
- GET /driver/:id/economy — backend/routes/driver_economy_api.js:8
- POST /drivers/rank — backend/routes/driver_intelligence_api.js:9
- POST /drivers/best — backend/routes/driver_intelligence_api.js:29
- POST /driver/location/update — backend/routes/driver_location_api.js:8
- POST /ride/tracking — backend/routes/driver_location_api.js:21
- GET /drivers/online — backend/routes/driver_online_api.js:19
- POST /drivers/online — backend/routes/driver_online_api.js:32
- POST /drivers/offline — backend/routes/driver_online_api.js:67
- POST /marketplace/order — backend/routes/ecosystem_tasks.js:9
- GET /tasks — backend/routes/ecosystem_tasks.js:22
- PATCH /tasks/:id — backend/routes/ecosystem_tasks.js:35
- POST /update — backend/routes/gps.js:7
- GET /:device — backend/routes/gps.js:23
- GET /user/:id — backend/routes/identity_api.js:11
- POST /user/create — backend/routes/identity_api.js:31
- POST /user/verify-role — backend/routes/identity_api.js:51
- POST /demand/request — backend/routes/live_demand_api.js:11
- POST /demand/complete — backend/routes/live_demand_api.js:31
- GET /driver/hotspots — backend/routes/live_demand_api.js:51
- POST /ride/create — backend/routes/live_ride_api.js:11
- POST /ride/status — backend/routes/live_ride_api.js:29
- POST /ride/assign — backend/routes/live_ride_api.js:50
- GET /ride/:id — backend/routes/live_ride_api.js:71
- POST /driver/location — backend/routes/matching_api.js:11
- POST /matching/drivers — backend/routes/matching_api.js:31
- POST /register — backend/routes/mobile.js:8
- POST /heartbeat/:id — backend/routes/mobile.js:21
- POST /trip/start — backend/routes/mobile.js:34
- POST /notifications/create — backend/routes/notification_api.js:11
- GET /ride/:id/timeline — backend/routes/notification_api.js:27
- POST /orchestrator/create — backend/routes/orchestrator_api.js:10
- POST /orchestrator/assign — backend/routes/orchestrator_api.js:27
- POST /orchestrator/arrived — backend/routes/orchestrator_api.js:47
- POST /orchestrator/start — backend/routes/orchestrator_api.js:66
- POST /orchestrator/finish — backend/routes/orchestrator_api.js:85
- GET /passenger/:id/profile — backend/routes/passenger_intelligence_api.js:8
- POST /passenger/update — backend/routes/passenger_intelligence_api.js:21
- POST /driver/status — backend/routes/realtime.js:9
- POST /driver/location — backend/routes/realtime.js:25
- POST /event — backend/routes/realtime.js:41
- GET /events — backend/routes/realtime.js:57
- POST /rides — backend/routes/ride_api.js.disabled:13
- GET /rides — backend/routes/ride_api.js.disabled:70
- POST /economy/ride/accept — backend/routes/ride_economy_api.js:8
- POST /economy/ride/complete — backend/routes/ride_economy_api.js:27
- GET /economy/rides — backend/routes/ride_economy_api.js:45
- POST /ride/create — backend/routes/ride_state_api.js:7
- POST /ride/status — backend/routes/ride_state_api.js:17
- GET /ride/:id/status — backend/routes/ride_state_api.js:30
- POST /request — backend/routes/rides.js:11
- GET / — backend/routes/rides.js:91
- PATCH /:id — backend/routes/rides.js:119
- POST /request — backend/routes/rides.js.backup:7
- GET / — backend/routes/rides.js.backup:33
- PATCH /:id — backend/routes/rides.js.backup:46
- POST /request — backend/routes/rides.js.backup_truth_1784102755787:11
- GET / — backend/routes/rides.js.backup_truth_1784102755787:90
- PATCH /:id — backend/routes/rides.js.backup_truth_1784102755787:104
- POST /join — backend/routes/socket_routes.js:7
- POST /update — backend/routes/socket_routes.js:23
- GET /updates — backend/routes/updates_api.js:7
- POST /register — backend/routes/users.js:7
- GET / — backend/routes/users.js:31
- GET /health — backend/server/app.js:13
- USE /api/rides — backend/server/app.js:32
- USE /api/users — backend/server/app.js:34
- GET /api/health — backend/server.js:24
- POST /api/rides — backend/server.js:33
- GET /api/rides — backend/server.js:69
- GET /api/rides/:id — backend/server.js:73
- PATCH /api/rides/:id — backend/server.js:79
- POST /api/drivers/online — backend/server.js:95
- POST /api/drivers/offline — backend/server.js:112
- GET /api/drivers/online — backend/server.js:125
- POST /api/drivers/apply — backend/server.js:137
- GET /api/drivers/applications — backend/server.js:153
- POST /api/ratings — backend/server.js:158
- GET /api/health — backend/server.js.backup_1784096856161:34
- POST /api/drivers/apply — backend/server.js.backup_1784096856161:48
- GET /api/drivers — backend/server.js.backup_1784096856161:68
- POST /api/rides/book — backend/server.js.backup_1784096856161:74
- POST /api/rides/create — backend/server.js.backup_1784096856161:100
- GET /api/rides — backend/server.js.backup_1784096856161:113
- POST /api/drivers/register — backend/server.js.backup_1784096856161:123
- GET /api/drivers/available — backend/server.js.backup_1784096856161:136
- POST /api/payments/create — backend/server.js.backup_1784096856161:146
- POST /api/rewards/create — backend/server.js.backup_1784096856161:160
- GET /api/system/status — backend/server.js.backup_1784096856161:174
- USE /api/ecosystem — backend/server.js.backup_1784096856161:199
- USE /api — backend/server.js.backup_1784096856161:208
- USE /api — backend/server.js.backup_1784096856161:214
- USE /api — backend/server.js.backup_1784096856161:221
- USE /api — backend/server.js.backup_1784096856161:228
- USE /api — backend/server.js.backup_1784096856161:231
- USE /api — backend/server.js.backup_1784096856161:238
- USE /api — backend/server.js.backup_1784096856161:245
- USE /api — backend/server.js.backup_1784096856161:252
- USE /api — backend/server.js.backup_1784096856161:259
- USE /api — backend/server.js.backup_1784096856161:266
- USE /api — backend/server.js.backup_1784096856161:273
- USE /api — backend/server.js.backup_1784096856161:280
- USE /api — backend/server.js.backup_1784096856161:287
- USE /api — backend/server.js.backup_1784096856161:294
- USE /api — backend/server.js.backup_1784096856161:301
- USE /api — backend/server.js.backup_1784096856161:308
- USE /api — backend/server.js.backup_1784096856161:315
- GET * — backend/server.js.backup_1784096856161:319
- GET /api/health — backend/server.js.backup_route_cleanup_1784103021100:34
- POST /api/drivers/apply — backend/server.js.backup_route_cleanup_1784103021100:48
- GET /api/drivers — backend/server.js.backup_route_cleanup_1784103021100:68
- POST /api/rides/book — backend/server.js.backup_route_cleanup_1784103021100:74
- POST /api/rides/create — backend/server.js.backup_route_cleanup_1784103021100:100
- GET /api/rides — backend/server.js.backup_route_cleanup_1784103021100:113
- POST /api/drivers/register — backend/server.js.backup_route_cleanup_1784103021100:123
- GET /api/drivers/available — backend/server.js.backup_route_cleanup_1784103021100:136
- POST /api/payments/create — backend/server.js.backup_route_cleanup_1784103021100:146
- POST /api/rewards/create — backend/server.js.backup_route_cleanup_1784103021100:160
- GET /api/system/status — backend/server.js.backup_route_cleanup_1784103021100:174
- USE /api/ecosystem — backend/server.js.backup_route_cleanup_1784103021100:199
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:208
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:214
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:221
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:228
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:231
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:238
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:245
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:252
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:259
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:266
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:273
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:280
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:287
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:294
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:301
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:308
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:318
- GET * — backend/server.js.backup_route_cleanup_1784103021100:322
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:338
- USE /api — backend/server.js.backup_route_cleanup_1784103021100:339
- GET /api/health — backend/server_before_api_layer.bak:34
- POST /api/drivers/apply — backend/server_before_api_layer.bak:48
- GET /api/drivers — backend/server_before_api_layer.bak:68
- POST /api/rides/book — backend/server_before_api_layer.bak:74
- GET * — backend/server_before_api_layer.bak:89
- GET /api/health — backend/server_before_task_mount.bak:34
- POST /api/drivers/apply — backend/server_before_task_mount.bak:48
- GET /api/drivers — backend/server_before_task_mount.bak:68
- POST /api/rides/book — backend/server_before_task_mount.bak:74
- POST /api/rides/create — backend/server_before_task_mount.bak:100
- GET /api/rides — backend/server_before_task_mount.bak:113
- POST /api/drivers/register — backend/server_before_task_mount.bak:123
- GET /api/drivers/available — backend/server_before_task_mount.bak:136
- POST /api/payments/create — backend/server_before_task_mount.bak:146
- POST /api/rewards/create — backend/server_before_task_mount.bak:160
- GET /api/system/status — backend/server_before_task_mount.bak:174
- GET * — backend/server_before_task_mount.bak:197
- GET http://localhost:3000/api/driver/DRIVER001/dashboard — backend/testing/phase32_dashboard_api_test.js:5
- GET http://localhost:3000/api/driver/DRIVER001/economy — backend/testing/phase37_dashboard_test.js:6
- GET http://localhost:3000/api/driver/hotspots — backend/testing/phase40_demand_test.js:72
- GET http://localhost:3000/api/ride/RIDE-001/timeline — backend/testing/phase49_notification_test.js:54
- GET users — backend/users/user_account_engine.js:38

## 7. INTEGRATION INVENTORY

### DATABASE

- backend/cloud/cloud_adapter.js
- cablink_forensic_audit_v2.js
- fix.js
- frontend/js/firebase.js
- frontend/js/fix.js

### FIREBASE

- backend/broadcast/ride_broadcast.js
- backend/cloud/cloud_adapter.js
- backend/config/environment_validator.js
- backend/environment/readiness_check.js
- backend/firebase/firebase_adapter.js
- backend/security/security_audit.js
- cablink_forensic_audit_v2.js
- fix.js
- frontend/index.html
- frontend/js/firebase.js
- frontend/js/fix.js
- index.html
- runtime_dependency_graph.json

### BLOCKCHAIN

- .block8_check.js
- CABLINK_FULL_AUDIT_REPORT.md
- CABLINK_REALITY_GRAPH.json
- README.md
- backend/api/reward_api.js
- backend/blockchain/chain_health.js
- backend/blockchain/thb_config.js
- backend/blockchain/thb_real_executor.js
- backend/blockchain/thb_transfer_service.js
- backend/blockchain/thb_transfer_worker.js
- backend/config/env_check.js
- backend/config/environment_validator.js
- backend/data/economy_ledger.json
- backend/data/passengers.json
- backend/realtime/channel_manager.js
- backend/rewards/blockchain_reward_adapter.js
- backend/rewards/delivery_reward_engine.js
- backend/rewards/reward_claim_engine.js
- backend/rewards/reward_engine.js
- backend/rewards/thb_contract_adapter.js
- backend/rewards/thb_service.js
- backend/rewards/thb_transaction_layer.js
- backend/rewards/thb_transfer_queue.js
- backend/rewards/wallet_service.js
- backend/rides/settlement_engine.js
- backend/routes/passenger_intelligence_api.js
- backend/security/security_engine.js
- backend/services/economy_ledger_service.js
- backend/services/passenger_intelligence_service.js
- backend/services/reward_service.js
- backend/services/ride_completion_service.js
- backend/services/ride_economy_service.js
- backend/testing/phase35_ledger_test.js
- backend/testing/reward_wallet_test.js
- backend/testing/two_phone_pilot.js
- beta/dashboard/dashboard_data.js
- beta/dashboard/live_state.json
- beta/pilot/reports/LAST_COMPLETED_RIDE.json
- beta/pilot/rides/PILOT-RIDE-001.json
- beta/tests/beta_run_report.txt
- block8.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- database/production/cablink_store.json
- database/production/database.json
- deployment/CABLINK_PILOT_CHECKLIST.md
- docs/fake_logic_audit.txt
- fix.js
- frontend/components/driver_dashboard.js
- frontend/components/driver_economy_dashboard.js
- frontend/components/driver_economy_screen.js
- frontend/components/passenger_profile_card.jsx
- frontend/components/thb_reward_panel.js
- frontend/components/thb_reward_panel.jsx
- frontend/components/thb_wallet_panel.js
- frontend/ecosystem/bstm_links.js
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/bstm_hub_ui.js
- frontend/js/financial_intelligence.js
- frontend/js/fix.js
- frontend/js/operations_core.js
- frontend/js/rides/completionRewardBridge.js
- frontend/js/role.js
- frontend/pages/DriverDashboard.jsx
- frontend/pages/PassengerRide.jsx
- frontend/screens/driver_dashboard.js
- frontend/testing/driver_economy_dashboard_test.js
- frontend/testing/phase43_ui_test.js
- index.html
- manifest.json
- package-lock.json
- package.json
- pilot/protocols/FIRST_RIDE_PROTOCOL.md
- role.js
- runtime_dependency_graph.json

### PAYMENT

- .block8_check.js
- README.md
- backend/admin/operator_dashboard.js
- backend/api/reward_api.js
- backend/blockchain/chain_health.js
- backend/blockchain/thb_config.js
- backend/blockchain/thb_real_executor.js
- backend/blockchain/thb_transaction_engine.js
- backend/blockchain/thb_transfer_service.js
- backend/blockchain/thb_transfer_worker.js
- backend/config/env_check.js
- backend/config/environment_validator.js
- backend/data/economy_ledger.json
- backend/database/production_schema.js
- backend/payments/payment_adapter.js
- backend/payments/payment_engine.js
- backend/payments/payment_transaction_layer.js
- backend/payments/transaction_recorder.js
- backend/rewards/blockchain_reward_adapter.js
- backend/rewards/reward_claim_engine.js
- backend/rewards/reward_engine.js
- backend/rewards/thb_claim_engine.js
- backend/rewards/thb_contract_adapter.js
- backend/rewards/thb_service.js
- backend/rewards/thb_transaction_layer.js
- backend/rewards/thb_transfer_queue.js
- backend/rewards/wallet_service.js
- backend/rides/settlement_engine.js
- backend/routes/driver_dashboard_api.js
- backend/routes/driver_economy.js
- backend/security/security_audit.js
- backend/security/security_engine.js
- backend/server.js
- backend/services/economy_ledger_service.js
- backend/services/payment_service.js
- backend/services/ride_completion_service.js
- backend/services/ride_economy_service.js
- backend/testing/human_ride_scenario.js
- backend/testing/phase28_reward_flow_test.js
- backend/testing/reward_wallet_test.js
- backend/users/wallet_manager.js
- beta/final_readiness_report.json
- beta/health/production_health.js
- beta/pilot/reports/LAST_COMPLETED_RIDE.json
- beta/pilot_mission/reports/pilot_evidence_report.js
- beta/real_world/reports/REAL_WORLD_HAILING_CERTIFICATION.json
- beta/tests/beta_run_report.txt
- beta/tests/ride_tests.js
- block8.py
- cablink.js
- cablink_forensic_audit_v2.js
- database/production/cablink_store.json
- database/production/database.json
- database/production/database_health.js
- database/schema/drivers.json
- database/schema/transactions.json
- database/schema/users.json
- deployment/CABLINK_PILOT_CHECKLIST.md
- docs/CABLINK_TARGET_ARCHITECTURE.md
- docs/architecture/CABLINK_STRUCTURE.md
- docs/fake_logic_audit.txt
- fix.js
- frontend/components/BottomNavigation.jsx
- frontend/components/driver_dashboard.js
- frontend/components/driver_economy_dashboard.js
- frontend/components/driver_economy_screen.js
- frontend/components/thb_wallet_panel.js
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/financial_intelligence.js
- frontend/js/fix.js
- frontend/js/operations_core.js
- frontend/js/ride_engine.js
- frontend/js/rides/completionRewardBridge.js
- frontend/js/role.js
- frontend/js/simulation_engine.js
- frontend/services/driver_economy_service.js
- index.html
- pilot/dashboard/pilot_status.js
- pilot/protocols/FIRST_RIDE_PROTOCOL.md
- role.js
- runtime_dependency_graph.json

### GPS

- CABLINK_FULL_AUDIT_REPORT.md
- block7.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- frontend/index.html
- frontend/js/app_core.js
- gather_info.sh
- index.html

### ROUTING

- CABLINK_ARCHITECTURE_REPORT.md
- CABLINK_FULL_AUDIT_REPORT.md
- CABLINK_REALITY_GRAPH.json
- CABLINK_TRUTH_REPORT.md
- backend/maps/gps_engine.js
- backend/maps/map_provider.js
- backend/providers/maps_connector.js
- backend/routes/completion_api.js
- backend/routes/dispatch_api.js
- backend/routes/driver_dashboard_api.js
- backend/routes/driver_demand_api.js
- backend/routes/driver_economy.js
- backend/routes/driver_economy_api.js
- backend/routes/driver_intelligence_api.js
- backend/routes/driver_location_api.js
- backend/routes/driver_online_api.js
- backend/routes/ecosystem_tasks.js
- backend/routes/gps.js
- backend/routes/identity_api.js
- backend/routes/live_demand_api.js
- backend/routes/live_ride_api.js
- backend/routes/matching_api.js
- backend/routes/mobile.js
- backend/routes/notification_api.js
- backend/routes/orchestrator_api.js
- backend/routes/passenger_intelligence_api.js
- backend/routes/realtime.js
- backend/routes/ride_economy_api.js
- backend/routes/ride_state_api.js
- backend/routes/rides.js
- backend/routes/socket_routes.js
- backend/routes/updates_api.js
- backend/routes/users.js
- backend/server/app.js
- backend/server.js
- backend/testing/pilot_activation_test.js
- block2.py
- block3.py
- block4.py
- block5.py
- block6.py
- block7.py
- block9.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- cablink_reality_doctor.js
- diagnose.sh
- docs/CABLINK_TARGET_ARCHITECTURE.md
- docs/fake_logic_audit.txt
- fix_block7_bug.py
- frontend/index.html
- frontend/js/app_core.js
- frontend/maps/live_map_component.js
- index.html
- runtime_dependency_graph.json

### FUEL

- block7.py
- cablink_forensic_audit_v2.js
- cablink_reality_doctor.js
- fare_engine.js
- frontend/index.html
- frontend/js/fare_engine.js


## 8. PASSENGER OPERATIONAL FLOW

- ✅ **registration**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/auth/auth_engine.js, backend/devices/device_registry.js, backend/extensions/extension_registry.js, backend/mobile/device_registry.js, backend/notifications/push_bridge.js, backend/onboarding/onboarding_engine.js, backend/realtime/realtime_bridge.js
- ✅ **authentication**
  Evidence: backend/auth/auth_engine.js, cablink_forensic_audit_v2.js, runtime_dependency_graph.json
- ✅ **gps**
  Evidence: cablink_forensic_audit_v2.js, cablink_full_audit.js, frontend/index.html, frontend/js/app_core.js, index.html
- ✅ **pickup**
  Evidence: backend/api/cablink_gateway.js, backend/data/dispatch_requests.json, backend/data/economy_ledger.json, backend/data/rides.json, backend/database/production_schema.js, backend/database/rides.json, backend/ecosystem/marketplace_bridge.js, backend/rides/ride_engine.js
- ✅ **destination**
  Evidence: backend/data/dispatch_requests.json, backend/data/economy_ledger.json, backend/data/rides.json, backend/database/production_schema.js, backend/database/rides.json, backend/ecosystem/marketplace_bridge.js, backend/rides/ride_engine.js, backend/rides/ride_lifecycle.js
- ✅ **route**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/maps/gps_engine.js, backend/maps/map_provider.js, backend/providers/maps_connector.js, backend/routes/completion_api.js, backend/routes/dispatch_api.js, backend/routes/driver_dashboard_api.js, backend/routes/driver_demand_api.js
- ✅ **fare**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/data/economy_ledger.json, backend/data/rides.json, backend/database/production_schema.js, backend/database/rides.json, backend/payments/payment_engine.js, backend/pricing/fare_calculator.js, backend/routes/orchestrator_api.js
- ✅ **booking**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/database/rideRepository.js, backend/database/ride_repository.js, backend/ride_api_patch.js, backend/ride_store.js, backend/rides/ride_engine.js, backend/routes/dispatch_api.js, backend/routes/live_ride_api.js
- ✅ **tracking**
  Evidence: backend/services/economy_ledger_service.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, frontend/components/ride_status_card.jsx, frontend/index.html, frontend/js/rides/passengerRideStatus.js, index.html, runtime_dependency_graph.json
- ✅ **completion**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/data/ride_events.json, backend/routes/completion_api.js, backend/server.js, backend/services/rideService.js, backend/services/ride_completion_service.js, backend/services/ride_economy_service.js, backend/services/ride_orchestrator_service.js
- ✅ **reward**
  Evidence: .block8_check.js, CABLINK_REALITY_GRAPH.json, backend/admin/admin_monitor.js, backend/admin/operator_dashboard.js, backend/analytics/pilot_analytics.js, backend/api/reward_api.js, backend/blockchain/chain_health.js, backend/blockchain/thb_real_executor.js

### Recommended passenger canonical flow

REGISTER/AUTHENTICATE
→ GPS PERMISSION
→ PICKUP LOCATION
→ DESTINATION
→ ROAD ROUTE
→ ROAD DISTANCE
→ ETA
→ FARE ESTIMATE
→ RIDE REQUEST
→ DRIVER MATCH
→ DRIVER ACCEPT
→ DRIVER TRACKING
→ DRIVER ARRIVAL
→ RIDE START
→ RIDE IN PROGRESS
→ RIDE COMPLETION
→ FINAL FARE
→ PAYMENT SETTLEMENT
→ THB REWARD ELIGIBILITY
→ REWARD CLAIM


## 9. DRIVER OPERATIONAL FLOW

- ✅ **application**
  Evidence: .block8_check.js, backend/server.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, fix.js, frontend/index.html, frontend/js/fix.js, index.html
- ✅ **approval**
  Evidence: cablink_forensic_audit_v2.js
- ✅ **online**
  Evidence: .block8_check.js, CABLINK_REALITY_GRAPH.json, backend/routes/driver_online_api.js, backend/server.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, cablink_reality_doctor.js, fix.js
- ✅ **gps**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/location/location_stream.js, backend/location/radar_engine.js, backend/matching/driver_matching_engine.js, backend/routes/driver_location_api.js, backend/routes/matching_api.js, backend/routes/realtime.js, backend/testing/phase41_matching_test.js
- ✅ **matching**
  Evidence: .block8_check.js, CABLINK_REALITY_GRAPH.json, backend/routes/matching_api.js, backend/routes/rides.js, backend/server.js, backend/services/dispatch_service.js, backend/services/ride_dispatch_bridge.js, backend/testing/phase41_matching_test.js
- ✅ **accept**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/services/rideService.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, cablink_reality_doctor.js, frontend/index.html, frontend/js/app_core.js, index.html
- ✅ **arrival**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/data/ride_events.json, backend/rides/ride_engine.js, backend/routes/orchestrator_api.js, backend/server.js, backend/services/ride_orchestrator_service.js, backend/testing/phase49_notification_test.js, backend/testing/phase51_orchestrator_test.js
- ✅ **start**
  Evidence: cablink_forensic_audit_v2.js
- ✅ **completion**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/routes/completion_api.js, backend/services/rideService.js, backend/services/ride_completion_service.js, backend/services/ride_orchestrator_service.js, beta/hailing_tests/hailing_test.js, cablink_forensic_audit_v2.js, cablink_full_audit.js
- ✅ **earnings**
  Evidence: cablink_forensic_audit_v2.js, cablink_full_audit.js, frontend/components/delivery_earnings_panel.js, frontend/components/driver_economy_dashboard.js, frontend/index.html, frontend/js/role_switch.js, frontend/mobile/mobile_entry.js, frontend/services/driver_economy_service.js

### Recommended driver canonical flow

DRIVER APPLICATION
→ ADMIN APPROVAL
→ DRIVER AUTHENTICATION
→ VEHICLE PROFILE
→ ONLINE
→ GPS LOCATION STREAM
→ DRIVER MATCHING
→ RIDE REQUEST
→ ACCEPT
→ NAVIGATE TO PICKUP
→ ARRIVE
→ START RIDE
→ TRACK TRIP
→ COMPLETE RIDE
→ FINAL FARE
→ DRIVER EARNINGS
→ PLATFORM COMMISSION
→ THB REWARD PROCESSING


## 10. ADMIN / MANAGER OPERATIONAL FLOW

- ✅ **dashboard**
  Evidence: CABLINK_REALITY_GRAPH.json, backend/admin/admin_monitor.js, backend/routes/driver_dashboard_api.js, backend/testing/phase32_dashboard_api_test.js, beta/command/reports/pilot_decision.js, beta/pilot/reports/pilot_health.js, cablink_forensic_audit_v2.js, cablink_full_audit.js
- ✅ **rides**
  Evidence: CABLINK_HOSTING_MANIFEST.json, CABLINK_REALITY_GRAPH.json, backend/admin/admin_monitor.js, backend/routes/dispatch_api.js, backend/services/dispatch_service.js, backend/services/driver_intelligence_service.js, backend/services/ride_dispatch_bridge.js, backend/testing/phase42_dispatch_test.js
- ✅ **drivers**
  Evidence: .block8_check.js, backend/server.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, fix.js, frontend/index.html, frontend/js/fix.js, index.html
- ✅ **users**
  Evidence: cablink_forensic_audit_v2.js
- ✅ **finance**
  Evidence: backend/analytics/pilot_analytics.js, backend/services/payment_service.js, cablink_forensic_audit_v2.js, cablink_full_audit.js, database/schema/transactions.json, frontend/components/delivery_earnings_panel.js, frontend/components/driver_dashboard.js, frontend/components/driver_economy_dashboard.js
- ✅ **monitoring**
  Evidence: CABLINK_HOSTING_MANIFEST.json, CABLINK_REALITY_GRAPH.json, backend/blockchain/thb_transfer_service.js, backend/server/app.js, backend/server.js, beta/dashboard/dashboard_data.js, beta/dashboard/live_state.json, beta/final_readiness_report.json

### Recommended manager control plane

ADMIN LOGIN
→ OPERATIONS DASHBOARD
→ ACTIVE RIDES
→ UNASSIGNED RIDES
→ DRIVER MAP
→ ONLINE/OFFLINE DRIVERS
→ DRIVER APPLICATIONS
→ DRIVER APPROVAL
→ PASSENGER MANAGEMENT
→ DISPATCH
→ FARE OVERSIGHT
→ DRIVER EARNINGS
→ PLATFORM COMMISSION
→ PAYMENTS
→ THB REWARDS
→ SYSTEM HEALTH
→ AUDIT LOGS

## 11. RIDE STATE MACHINE FORENSICS

### States detected in source

#### backend/api/cablink_gateway.js
- REQUESTED

#### backend/fraud/reward_guard.js
- COMPLETED

#### backend/maps/map_provider.js
- REQUESTED

#### backend/rewards/auto_reward_trigger.js
- COMPLETED

#### backend/rewards/delivery_completion.js
- COMPLETED

#### backend/rewards/delivery_reward_service.js
- COMPLETED

#### backend/rewards/thb_claim_engine.js
- COMPLETED

#### backend/ride_store.js
- REQUESTED

#### backend/rides/ride_engine.js
- REQUESTED
- DRIVER_ACCEPTED
- COMPLETED
- CANCELLED

#### backend/rides/ride_lifecycle.js
- REQUESTED

#### backend/rides/ride_state_engine.js
- REQUESTED
- DRIVER_ACCEPTED
- COMPLETED

#### backend/routes/rides.js
- REQUESTED

#### backend/security/fraud_engine.js
- NO_DRIVER

#### backend/server.js
- REQUESTED
- DRIVER_ASSIGNED
- COMPLETED
- CANCELLED

#### backend/services/driver_intelligence_service.js
- COMPLETED

#### backend/services/economy_ledger_service.js
- COMPLETED

#### backend/services/live_demand_service.js
- COMPLETED

#### backend/services/passenger_intelligence_service.js
- COMPLETED

#### backend/services/payment_service.js
- COMPLETED

#### backend/services/rideService.js
- COMPLETED

#### backend/services/ride_completion_service.js
- COMPLETED

#### backend/services/ride_economy_service.js
- COMPLETED

#### backend/services/ride_orchestrator_service.js
- DRIVER_ASSIGNED
- DRIVER_ARRIVED
- COMPLETED

#### backend/services/ride_service.js
- REQUESTED

#### backend/status/ride_status.js
- REQUESTED
- DRIVER_ACCEPTED
- COMPLETED

#### backend/testing/human_ride_scenario.js
- COMPLETED

#### backend/testing/phase28_reward_flow_test.js
- COMPLETED

#### backend/testing/phase34_economy_test.js
- COMPLETED

#### backend/testing/phase35_ledger_test.js
- COMPLETED

#### backend/testing/phase49_notification_test.js
- DRIVER_ARRIVED

#### backend/testing/phase52_driver_test.js
- COMPLETED

#### backend/testing/pilot_activation_test.js
- DRIVER_ACCEPTED

#### backend/testing/two_phone_pilot.js
- RIDE_COMPLETED
- COMPLETED

#### backend/trust/trust_engine.js
- COMPLETED

#### beta/dashboard/dashboard_data.js
- COMPLETED

#### beta/hailing_tests/hailing_test.js
- COMPLETED

#### beta/human_pilot/rides/test_framework.js
- COMPLETED

#### beta/operations/reports/daily_report.js
- RIDE_COMPLETED
- COMPLETED

#### beta/pilot_mission/reports/pilot_evidence_report.js
- COMPLETED

#### cablink_forensic_audit_v2.js
- REQUESTED
- SEARCHING_DRIVER
- DRIVER_ASSIGNED
- DRIVER_ACCEPTED
- DRIVER_EN_ROUTE
- DRIVER_ARRIVED
- RIDE_STARTED
- RIDE_IN_PROGRESS
- RIDE_COMPLETED
- COMPLETED
- CANCELLED
- REJECTED
- NO_DRIVER

#### fix.js
- REQUESTED

#### frontend/components/driver_dashboard.js
- COMPLETED

#### frontend/index.html
- REQUESTED
- COMPLETED
- CANCELLED
- REJECTED

#### frontend/js/app_core.js
- REQUESTED
- DRIVER_ASSIGNED

#### frontend/js/driver/driverLifecycleControls.js
- COMPLETED

#### frontend/js/operations_core.js
- COMPLETED

#### frontend/js/ride_engine.js
- REQUESTED
- SEARCHING_DRIVER
- DRIVER_ACCEPTED

#### frontend/js/rides/completionRewardBridge.js
- COMPLETED

#### frontend/js/rides/passengerRideStatus.js
- REQUESTED

#### frontend/js/rides/rideStateMachine.js
- REQUESTED
- COMPLETED
- CANCELLED

#### frontend/js/simulation_engine.js
- DRIVER_ACCEPTED

#### frontend/pages/DriverDashboard.jsx
- COMPLETED

#### frontend/testing/driver_economy_dashboard_test.js
- COMPLETED

#### frontend/testing/phase43_ui_test.js
- COMPLETED

#### index.html
- REQUESTED
- COMPLETED
- CANCELLED
- REJECTED

#### pilot/operations/pilot_metrics.js
- COMPLETED

#### pilot/trials/run_trial_test.js
- COMPLETED


### Recommended authoritative state machine

REQUESTED
→ SEARCHING_DRIVER
→ DRIVER_ASSIGNED
→ DRIVER_ACCEPTED
→ DRIVER_EN_ROUTE
→ DRIVER_ARRIVED
→ RIDE_STARTED
→ RIDE_IN_PROGRESS
→ RIDE_COMPLETED
→ FARE_FINALIZED
→ PAYMENT_SETTLED
→ REWARD_ELIGIBLE
→ REWARD_CLAIMED

Alternative terminal states:
→ CANCELLED
→ NO_DRIVER
→ FAILED

## 12. GPS / ROUTING / LOCATION FORENSICS

GPS-related files: 8
- CABLINK_FULL_AUDIT_REPORT.md
- block7.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- frontend/index.html
- frontend/js/app_core.js
- gather_info.sh
- index.html

Routing/map-related files: 55
- CABLINK_ARCHITECTURE_REPORT.md
- CABLINK_FULL_AUDIT_REPORT.md
- CABLINK_REALITY_GRAPH.json
- CABLINK_TRUTH_REPORT.md
- backend/maps/gps_engine.js
- backend/maps/map_provider.js
- backend/providers/maps_connector.js
- backend/routes/completion_api.js
- backend/routes/dispatch_api.js
- backend/routes/driver_dashboard_api.js
- backend/routes/driver_demand_api.js
- backend/routes/driver_economy.js
- backend/routes/driver_economy_api.js
- backend/routes/driver_intelligence_api.js
- backend/routes/driver_location_api.js
- backend/routes/driver_online_api.js
- backend/routes/ecosystem_tasks.js
- backend/routes/gps.js
- backend/routes/identity_api.js
- backend/routes/live_demand_api.js
- backend/routes/live_ride_api.js
- backend/routes/matching_api.js
- backend/routes/mobile.js
- backend/routes/notification_api.js
- backend/routes/orchestrator_api.js
- backend/routes/passenger_intelligence_api.js
- backend/routes/realtime.js
- backend/routes/ride_economy_api.js
- backend/routes/ride_state_api.js
- backend/routes/rides.js
- backend/routes/socket_routes.js
- backend/routes/updates_api.js
- backend/routes/users.js
- backend/server/app.js
- backend/server.js
- backend/testing/pilot_activation_test.js
- block2.py
- block3.py
- block4.py
- block5.py
- block6.py
- block7.py
- block9.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- cablink_reality_doctor.js
- diagnose.sh
- docs/CABLINK_TARGET_ARCHITECTURE.md
- docs/fake_logic_audit.txt
- fix_block7_bug.py
- frontend/index.html
- frontend/js/app_core.js
- frontend/maps/live_map_component.js
- index.html
- runtime_dependency_graph.json

### Critical architecture distinction

GPS coordinates should be used for:
- Current passenger location
- Current driver location
- Driver proximity
- Location tracking

Road routing should be used for:
- Actual driving distance
- ETA
- Route geometry
- Authoritative fare distance


## 13. FARE / DISTANCE / ETA / PETROL / EARNINGS FORENSICS

### DISTANCE

- CABLINK_FULL_AUDIT_REPORT.md
- backend/data/dispatch_requests.json
- backend/data/ride_events.json
- backend/dispatch/dispatch_engine.js
- backend/economy/delivery_fare_engine.js
- backend/fare/fare_engine.js
- backend/fraud/ride_validation.js
- backend/location/radar_engine.js
- backend/maps/gps_engine.js
- backend/maps/map_provider.js
- backend/matching/driver_matcher.js
- backend/matching/matching_engine.js
- backend/pricing/fare_calculator.js
- backend/routes/driver_intelligence_api.js
- backend/security/fraud_engine.js
- backend/server.js
- backend/services/driver_intelligence_service.js
- backend/services/driver_location_service.js
- backend/services/driver_matching_service.js
- backend/testing/human_ride_scenario.js
- backend/testing/phase42_dispatch_test.js
- beta/geo/geo_engine.js
- beta/geo/reports/GEO_CERTIFICATION_REPORT.json
- beta/geo/tests/geo_test.js
- beta/hailing_tests/hailing_test.js
- beta/pilot/rides/PILOT-RIDE-001.json
- block7.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- fare_engine.js
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/fare_engine.js
- index.html
- runtime_dependency_graph.json
- verify_flow.sh

### ROADDISTANCE

- cablink_forensic_audit_v2.js

### ETA

- CABLINK_FULL_AUDIT_REPORT.md
- CABLINK_REALITY_GRAPH.json
- backend/rewards/reward_engine.js
- backend/services/driver_location_service.js
- beta/command/reports/PILOT_DECISION_REPORT.txt
- beta/command/reports/pilot_decision.js
- beta/final_readiness_report.json
- beta/human_pilot/feedback/feedback_engine.js
- beta/human_pilot/participants/registry.js
- beta/human_pilot/reports/pilot_summary.js
- beta/live_gps/live_location_engine.js
- beta/live_gps/reports/gps_test.js
- beta/operations/event_logger.js
- beta/operations/reports/daily_report.js
- beta/operations/session_engine.js
- beta/pilot/issues/issue_tracker.js
- beta/pilot/reports/pilot_health.js
- beta/pilot/rides/PILOT-RIDE-001.json
- beta/pilot/rides/ride_registry.js
- beta/pilot/users/registry.js
- beta/pilot_mission/pilot_session.js
- beta/pilot_mission/reports/pilot_evidence_report.js
- beta/tests/beta_run_report.txt
- beta/tests/ride_tests.js
- block8.py
- cablink_forensic_audit_v2.js
- cablink_reality_doctor.js
- config/version.json
- database/production/cablink_store.json
- fare_engine.js
- frontend/api/cablink_api.js
- frontend/api/task_api.js
- frontend/config/app_config.js
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/driver/driverLifecycleControls.js
- frontend/js/driver/driverModeBridge.js
- frontend/js/fare_engine.js
- frontend/js/rides/completionRewardBridge.js
- frontend/js/rides/passengerRideStatus.js
- frontend/js/rides/rideController.js
- frontend/js/rides/rideStateMachine.js
- frontend/js/role_switch.js
- frontend/services/economy_dashboard_api.js
- index.html
- launcher.html
- package-lock.json
- pilot/trials/run_trial_test.js
- pilot/trials/trial_recorder.js
- runtime_dependency_graph.json

### FARE

- CABLINK_FULL_AUDIT_REPORT.md
- CABLINK_REALITY_GRAPH.json
- CABLINK_TRUTH_REPORT.md
- backend/data/economy_ledger.json
- backend/data/rides.json
- backend/database/production_schema.js
- backend/database/rides.json
- backend/payments/payment_engine.js
- backend/pricing/fare_calculator.js
- backend/routes/orchestrator_api.js
- backend/routes/passenger_intelligence_api.js
- backend/server.js
- backend/services/economy_ledger_service.js
- backend/services/passenger_intelligence_service.js
- backend/services/rideService.js
- backend/services/ride_completion_service.js
- backend/services/ride_economy_service.js
- backend/services/ride_orchestrator_service.js
- backend/storage/cablink_db.json
- backend/testing/delivery_economy_test.js
- backend/testing/phase34_economy_test.js
- backend/testing/phase35_ledger_test.js
- backend/testing/phase48_completion_test.js
- backend/testing/phase51_orchestrator_test.js
- beta/dashboard/dashboard_data.js
- beta/dashboard/live_state.json
- beta/geo/geo_engine.js
- beta/geo/reports/GEO_CERTIFICATION_REPORT.json
- beta/geo/tests/geo_test.js
- beta/hailing_tests/hailing_test.js
- beta/pilot/reports/LAST_COMPLETED_RIDE.json
- beta/pilot/reports/PILOT_TEST_001_REPORT.json
- beta/pilot/rides/PILOT-RIDE-001.json
- beta/real_world/reports/REAL_WORLD_HAILING_CERTIFICATION.json
- beta/tests/beta_run_report.txt
- block3.py
- block4.py
- block5.py
- block7.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- cablink_reality_doctor.js
- database/production/database.json
- database/schema/rides.json
- diagnose.sh
- docs/fake_logic_audit.txt
- fare_engine.js
- finalize_check.sh
- fix.js
- fix_block7_bug.py
- frontend/components/driver_dashboard.js
- frontend/components/mobile_dashboard.js
- frontend/components/passenger_dashboard.jsx
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/fare_engine.js
- frontend/js/financial_intelligence.js
- frontend/js/operations_core.js
- frontend/js/ride_engine.js
- frontend/js/rides/completionRewardBridge.js
- frontend/js/role_switch.js
- frontend/js/simulation_engine.js
- frontend/mobile/mobile_entry.js
- frontend/pages/DriverDashboard.jsx
- frontend/screens/passenger_dashboard.js
- frontend/state/ride_ui_state.js
- frontend/testing/phase43_ui_test.js
- gather_info.sh
- health.sh
- index.html
- pilot/protocols/FIRST_RIDE_PROTOCOL.md
- runtime_dependency_graph.json
- snapshot.sh
- sw.js
- test_loop.sh
- verify_flow.sh

### FUEL

- block7.py
- cablink_forensic_audit_v2.js
- fare_engine.js
- frontend/index.html
- frontend/js/fare_engine.js

### EARNINGS

- CABLINK_FULL_AUDIT_REPORT.md
- block7.py
- cablink_forensic_audit_v2.js
- cablink_full_audit.js
- fare_engine.js
- frontend/components/delivery_earnings_panel.js
- frontend/components/driver_economy_dashboard.js
- frontend/index.html
- frontend/js/fare_engine.js
- frontend/js/financial_intelligence.js
- frontend/js/operations_core.js
- frontend/js/role_switch.js
- frontend/mobile/mobile_entry.js
- frontend/services/driver_economy_service.js
- index.html

### CURRENCY

- backend/data/economy_ledger.json
- backend/economy/delivery_fare_engine.js
- backend/payments/payment_provider_adapter.js
- backend/pricing/fare_calculator.js
- backend/rewards/delivery_reward_engine.js
- backend/rewards/wallet_service.js
- backend/server.js
- backend/services/ride_completion_service.js
- backend/services/ride_economy_service.js
- backend/testing/phase35_ledger_test.js
- backend/testing/reward_wallet_test.js
- block7.py
- cablink_forensic_audit_v2.js
- fare_engine.js
- frontend/components/delivery_earnings_panel.js
- frontend/components/driver_economy_dashboard.js
- frontend/components/driver_economy_screen.js
- frontend/components/passenger_dashboard.jsx
- frontend/components/thb_reward_panel.js
- frontend/components/thb_reward_panel.jsx
- frontend/components/thb_wallet_panel.js
- frontend/index.html
- frontend/js/app_core.js
- frontend/js/fare_engine.js
- frontend/pages/PassengerRide.jsx
- frontend/testing/driver_economy_dashboard_test.js
- index.html
- package-lock.json

### Recommended fare architecture

AUTHORITATIVE BACKEND FARE ENGINE

Base Fare
+
Road Distance × Distance Rate
+
Travel Time × Time Rate
+
Waiting Time × Waiting Rate
+
Surcharges
-
Discounts
=
Passenger Fare

Then separately:

Passenger Fare
-
Platform Commission
-
Other Platform Fees
=
Driver Gross Settlement

Then separately:

Vehicle Operating Cost
=
Road Distance
÷
Vehicle Fuel Efficiency
×
Petrol Price

Driver Net Operating Profit
=
Driver Settlement
-
Fuel Cost
-
Other Operating Costs

IMPORTANT: Petrol/fuel cost should be treated as an operating-cost calculation unless the business explicitly incorporates it into the fare model.

## 14. DUPLICATE / COMPETING CORE LOGIC

### bookRide — 4 definitions
- fix.js:59
- frontend/index.html:984
- frontend/js/app_core.js:373
- index.html:978

### requestRide — 4 definitions
- frontend/js/app_core.js:302
- frontend/js/rides/rideService.js:3
- frontend/pages/PassengerRide.jsx:22
- frontend/services/ride_service.js:6

### toggleDriverMode — 8 definitions
- fix.js:84
- frontend/index.html:1347
- frontend/index.html:1880
- frontend/js/app.js:123
- frontend/js/app_core.js:387
- frontend/js/core.js:6
- frontend/js/fix.js:51
- index.html:1264

### acceptRealRequest — 2 definitions
- frontend/index.html:1417
- index.html:1324

### completeRide — 3 definitions
- backend/services/rideService.js:42
- backend/services/ride_completion_service.js:6
- frontend/index.html:1062

### calculateFare — 2 definitions
- fare_engine.js:9
- frontend/js/fare_engine.js:17

### calcTotalFare — 2 definitions
- frontend/index.html:1186
- index.html:1113

### updateFareBreakdown — 2 definitions
- frontend/index.html:1240
- index.html:1166

### updateFareDisplay — 7 definitions
- fare_engine.js:20
- frontend/js/app_core.js:117
- frontend/js/app_core.js:140
- frontend/js/app_core.js:172
- frontend/js/app_core.js:549
- frontend/js/app_core.js:558
- frontend/js/fare_engine.js:36

### haversineKm — 2 definitions
- frontend/index.html:1132
- frontend/js/app_core.js:37

### pollForRideRequests — 2 definitions
- frontend/index.html:1380
- index.html:1287


## 15. CONFIGURATION / ENVIRONMENT

### Configuration files
- .env
- .env.example
- vercel.json
- vite.config.js

### Files referencing environment variables
- backend/auth/auth_connector.js
- backend/auth/otp_service.js
- backend/blockchain/thb_config.js
- backend/blockchain/thb_real_executor.js
- backend/cloud/production_adapter.js
- backend/config/env_check.js
- backend/config/environment_validator.js
- backend/config/provider_config.js
- backend/firebase/firebase_adapter.js
- backend/maps/gps_engine.js
- backend/maps/map_provider.js
- backend/notifications/push_bridge.js
- backend/production/database_adapter.js
- backend/providers/cloud_provider.js
- backend/rewards/reward_engine.js
- backend/security/security_engine.js
- backend/server/index.js
- backend/server.js
- backend/sms/sms_engine.js
- deployment/service_readiness_check.js
- frontend/api/cablink_api.js
- frontend/api/task_api.js
- frontend/config/app_config.js
- frontend/services/economy_dashboard_api.js
- vite.config.js

## 16. DEPLOYMENT FORENSICS

- .vercel/README.txt
- .vercel/project.json
- DEPLOYMENT_READY.md
- backend/firebase/firebase_adapter.js
- deployment/API_TEST_GUIDE.md
- deployment/CABLINK_PILOT_CHECKLIST.md
- deployment/FRONTEND_BACKEND_CONNECTION.md
- deployment/go_live_audit.js
- deployment/pilot_environment_check.js
- deployment/production_readiness_check.js
- deployment/pwa_readiness_check.js
- deployment/reality_activation_report.js
- deployment/service_readiness_check.js
- deployment/storage_test.md
- frontend/js/firebase.js
- vercel.json

## 17. BUILD HEALTH

package.json present: YES
Build script present: NO
dist/ present: YES


## 18. WHAT SHOULD BE CREATED OR CONSOLIDATED

1. 🔴 Establish ONE canonical production entry point.
2. 🔴 Consolidate duplicate core functions into single authoritative services.
3. 🔴 Resolve frontend API calls that have no detected backend route.
4. 🟠 Create a single authoritative ride state machine shared by frontend and backend.
5. 🟠 Create a canonical location service for passenger and driver GPS.
6. 🟠 Create a canonical fare engine on the backend; frontend should only display estimates.
7. 🟡 Create end-to-end automated tests covering passenger → driver → completion.
8. 🟡 Create operational audit logging for ride state transitions, payments, driver actions, and admin actions.
9. 🟡 Create explicit separation between passenger fare, driver settlement, platform commission, and fuel operating costs.


## 19. RECOMMENDED CANONICAL CABLINK ARCHITECTURE

CABLINK
│
├── FRONTEND
│   ├── Passenger App
│   ├── Driver App
│   └── Admin / Manager Console
│
├── SHARED SERVICES
│   ├── Auth Service
│   ├── Location Service
│   ├── Routing Service
│   ├── Distance Service
│   ├── ETA Service
│   ├── Fare Engine
│   └── Ride State Machine
│
├── BACKEND
│   ├── Auth API
│   ├── Passenger API
│   ├── Driver API
│   ├── Ride API
│   ├── Dispatch API
│   ├── Admin API
│   ├── Payment API
│   └── Reward API
│
├── DATA
│   ├── Users
│   ├── Passengers
│   ├── Drivers
│   ├── Vehicles
│   ├── Driver Locations
│   ├── Rides
│   ├── Payments
│   ├── Driver Settlements
│   ├── Platform Commissions
│   └── THB Rewards
│
└── OPERATIONS
    ├── GPS Monitoring
    ├── Dispatch
    ├── Ride Monitoring
    ├── Finance
    ├── Driver Management
    └── Audit Logs


## 20. FORENSIC VERDICT

This audit should be treated as the Stage 2 structural and integration truth layer.

The most important question after running this report is not "How many files exist?" but "Which files actually participate in the production runtime?"

Before modifying CabLink again, identify the canonical frontend entry point, canonical backend entry point, canonical database, canonical ride state machine, canonical location service, canonical routing service, and canonical fare engine.

Any implementation outside those canonical paths should be classified as active, deprecated, experimental, archived, or dead. This prevents another partial merge from causing the application-wide failure you experienced.
