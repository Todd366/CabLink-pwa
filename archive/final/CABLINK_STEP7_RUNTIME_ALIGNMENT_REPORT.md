# CABLINK STEP 7 — RUNTIME ALIGNMENT AUDIT

Generated: 2026-07-26T09:16:19.020Z

Status: READ-ONLY AUDIT

No application files were modified by this audit.

---


## 1. ACTIVE FRONTEND ENTRYPOINT


- frontend/index.html

### Scripts loaded by frontend/index.html

- https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
- https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js
- /main.jsx

---


## 2. FRONTEND API CALLS


- **frontend/components/passenger_dashboard.jsx** → `/api/ride/`
- **frontend/components/passenger_dashboard.jsx** → `/api/ride/`
- **frontend/index.html** → `/api/drivers/online`
- **frontend/index.html** → `/api/rides/`
- **frontend/index.html** → `/api/rides`
- **frontend/index.html** → `/api/rides/`
- **frontend/index.html** → `/api/drivers/online`
- **frontend/index.html** → `/api/rides`
- **frontend/index.html** → `/api/drivers/online`
- **frontend/index.html** → `/api/drivers/offline`
- **frontend/index.html** → `/api/drivers/online`
- **frontend/index.html** → `/api/drivers/apply`
- **frontend/index.html** → `/api/drivers/apply`
- **frontend/js/app.js** → `/api/rides`
- **frontend/js/app_core.js** → `/api/drivers/online`
- **frontend/js/app_core.js** → `/api/rides`
- **frontend/js/app_core.js** → `/api/rides/`
- **frontend/js/app_core.js** → `/api/rides/`
- **frontend/js/app_core.js** → `/api/rides/`
- **frontend/js/driver/applicationService.js** → `/api/drivers/apply`
- **frontend/js/driver/driverDispatchBridge.js** → `/api/dispatch/requests`
- **frontend/js/driver/driverDispatchBridge.js** → `/api/dispatch/accept`
- **frontend/js/driver/driverModeBridge.js** → `/api/drivers/online`
- **frontend/js/driver/driverModeBridge.js** → `/api/drivers/offline`
- **frontend/js/driver/driverService.js** → `/api/drivers/online`
- **frontend/js/driver/driverService.js** → `/api/rides`
- **frontend/js/rides/rideService.js** → `/api/rides`
- **frontend/pages/DriverDashboard.jsx** → `/api/driver/DRIVER001/economy`
- **frontend/pages/DriverDashboard.jsx** → `/api/driver/hotspots`
- **frontend/pages/PassengerRide.jsx** → `/api/dispatch/request`
- **frontend/pages/UpdatesCenter.jsx** → `/api/updates`
- **frontend/services/demand_api.js** → `/api/driver/demand`
- **frontend/services/driver_dashboard_api.js** → `/api/driver/`
- **frontend/services/driver_dashboard_api.js** → `/api/driver/hotspots`
- **frontend/services/driver_dashboard_api.js** → `/api/updates`
- **frontend/services/identity_api.js** → `/api/user/`
- **frontend/services/live_ride_api.js** → `/api/ride/`
- **frontend/services/live_ride_api.js** → `/api/ride/status`
- **frontend/services/notification_api.js** → `/api/ride/`
- **frontend/services/passenger_dashboard_api.js** → `/api/ride/`
- **frontend/services/passenger_dashboard_api.js** → `/api/ride/`
- **frontend/services/updates_api.js** → `/api/updates`

---


## 3. BACKEND IMPORTS FROM SERVER ENTRYPOINT


- `backend/server.js` → `./server/app`

---


## 4. ACTIVE BACKEND ROUTES


- `GET /health`

---


## 5. CANONICAL RIDE COMPONENTS


- backend/canonical/ride_engine.js
- backend/canonical/ride_repository.js
- backend/routes/rides.js
- backend/server/app.js
- backend/server.js

---


## 6. LEGACY RIDE REFERENCES


- backend/data/dispatch_requests.json
- backend/data/ride_events.json
- backend/database/rides.json
- backend/rides/ride_engine.js
- backend/rides/ride_state_engine.js
- backend/services/dispatch_service.js
- backend/services/live_ride_service.js
- backend/services/rideService.js
- backend/services/ride_orchestrator_service.js
- backend/services/ride_state_service.js
- backend/status/ride_status.js
- backend/testing/phase50_state_test.js
- backend/testing/pilot_activation_test.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/data/dispatch_requests.json
- backups/phase3-runtime-consolidation-20260725-215339/backend/data/ride_events.json
- backups/phase3-runtime-consolidation-20260725-215339/backend/database/rides.json
- backups/phase3-runtime-consolidation-20260725-215339/backend/rides/ride_engine.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/rides/ride_state_engine.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/routes/rides.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/services/dispatch_service.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/services/live_ride_service.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/services/rideService.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/services/ride_orchestrator_service.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/services/ride_state_service.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/status/ride_status.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/testing/phase50_state_test.js
- backups/phase3-runtime-consolidation-20260725-215339/backend/testing/pilot_activation_test.js
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/operations_core.js
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/ride_engine.js
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/simulation_engine.js
- backups/phase3-runtime-consolidation-20260725-215339/frontend/services/ride_service.js
- cablink_forensic_audit_v2.js
- cablink_ride_backup_20260725_221547/backend/rides/ride_engine.js
- cablink_ride_backup_20260725_221547/backend/routes/rides.js
- cablink_ride_backup_20260725_221547/backend/services/rideService.js
- cablink_ride_backup_20260725_221547/backend/services/ride_orchestrator_service.js
- cablink_runtime_truth_audit_v3.js
- cablink_step7_runtime_alignment_audit.js
- frontend/js/operations_core.js
- frontend/js/ride_engine.js
- frontend/js/simulation_engine.js
- frontend/services/ride_service.js
- migration_backup/frontend/js/operations_core.js
- migration_backup/frontend/js/ride_engine.js
- migration_backup/frontend/js/simulation_engine.js
- migration_backup/frontend/services/ride_service.js

---


## 7. POSSIBLE NON-CANONICAL ENDPOINTS


- None detected

---


## 8. RIDE DATA STORES


- backend/data/rides.json
- backend/database/rides.json
- backend/storage/cablink_db.json
- backend/data/dispatch_requests.json
- backend/data/ride_events.json
- backend/data/economy_ledger.json

---


## 9. SYNTAX CHECK


- PASS — backend/server.js
- PASS — backend/server/app.js
- PASS — backend/routes/rides.js
- PASS — backend/canonical/ride_engine.js
- PASS — backend/canonical/ride_repository.js
- PASS — frontend/js/app_core.js
- PASS — frontend/js/ride_engine.js
- PASS — frontend/js/operations_core.js
- PASS — frontend/js/simulation_engine.js
- PASS — frontend/js/driver/driverDispatchBridge.js
- PASS — frontend/js/rides/rideController.js
- PASS — frontend/js/rides/rideStateMachine.js

---


## 10. STEP 7 INTERPRETATION


The purpose of this audit is to determine:

1. Which frontend entrypoint is actually active.
2. Which JavaScript files are loaded by the active frontend.
3. Which backend entrypoint is actually active.
4. Which backend modules are imported by the active server.
5. Which ride API endpoints are actually called by frontend code.
6. Which legacy ride states and systems remain referenced.
7. Whether frontend calls match the canonical backend API.
8. How many competing ride data stores remain.
9. Whether the inspected runtime JavaScript passes syntax validation.

This report is evidence for the next canonical runtime alignment phase.

