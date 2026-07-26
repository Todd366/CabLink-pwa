# CABLINK STEP 8.1 — CORRECTED RUNTIME TRUTH AUDIT

Generated: 2026-07-26T09:42:46.416Z

Status: READ-ONLY

No application files were modified by this audit.

---

# 1. EXECUTIVE SUMMARY

## Frontend Entrypoints

- frontend/main.jsx
- frontend/index.html

## Proven Active Frontend Reachability

- frontend/main.jsx
- frontend/App.jsx
- frontend/components/LegacyCabLink.jsx

## Backend Entrypoints

- backend/server.js

## API Compatibility

- Unique frontend API calls: 15
- Exact method/path matches: 1
- No exact backend match: 14

## Canonical Backend Reachability

- Canonical components proven reachable from backend entrypoint: 5/5

## Syntax

- Files checked: 314
- Node syntax failures: 0

## Build

- Status: NO_BUILD_SCRIPT

---

# 2. ACTIVE FRONTEND

- frontend/main.jsx
- frontend/App.jsx
- frontend/components/LegacyCabLink.jsx

---

# 3. FRONTEND IMPORT GRAPH

- `frontend/main.jsx` → `react` → EXTERNAL/UNRESOLVED
- `frontend/main.jsx` → `react-dom/client` → EXTERNAL/UNRESOLVED
- `frontend/main.jsx` → `./App.jsx` → frontend/App.jsx
- `frontend/App.jsx` → `react` → EXTERNAL/UNRESOLVED
- `frontend/App.jsx` → `./components/LegacyCabLink.jsx` → frontend/components/LegacyCabLink.jsx
- `frontend/components/LegacyCabLink.jsx` → `react` → EXTERNAL/UNRESOLVED

---

# 4. FRONTEND API CALLS

- **UNKNOWN /api/ride/** — frontend/components/passenger_dashboard.jsx
- **UNKNOWN /api/ride/** — frontend/components/passenger_dashboard.jsx
- **UNKNOWN /api/rides** — frontend/js/app.js
- **UNKNOWN /api/drivers/online** — frontend/js/app_core.js
- **UNKNOWN /api/rides** — frontend/js/app_core.js
- **UNKNOWN /api/rides/** — frontend/js/app_core.js
- **UNKNOWN /api/rides/** — frontend/js/app_core.js
- **UNKNOWN /api/rides/** — frontend/js/app_core.js
- **UNKNOWN /api/drivers/apply** — frontend/js/driver/applicationService.js
- **UNKNOWN /api/dispatch/requests** — frontend/js/driver/driverDispatchBridge.js
- **UNKNOWN /api/dispatch/accept** — frontend/js/driver/driverDispatchBridge.js
- **UNKNOWN /api/drivers/online** — frontend/js/driver/driverModeBridge.js
- **UNKNOWN /api/drivers/offline** — frontend/js/driver/driverModeBridge.js
- **UNKNOWN /api/drivers/online** — frontend/js/driver/driverService.js
- **UNKNOWN /api/rides** — frontend/js/driver/driverService.js
- **UNKNOWN /api/rides** — frontend/js/rides/rideService.js
- **UNKNOWN /api/driver/DRIVER001/economy** — frontend/pages/DriverDashboard.jsx
- **UNKNOWN /api/driver/hotspots** — frontend/pages/DriverDashboard.jsx
- **UNKNOWN /api/dispatch/request** — frontend/pages/PassengerRide.jsx
- **UNKNOWN /api/updates** — frontend/pages/UpdatesCenter.jsx
- **UNKNOWN /api/driver/demand** — frontend/services/demand_api.js
- **UNKNOWN /api/driver/** — frontend/services/driver_dashboard_api.js
- **UNKNOWN /api/driver/hotspots** — frontend/services/driver_dashboard_api.js
- **UNKNOWN /api/updates** — frontend/services/driver_dashboard_api.js
- **UNKNOWN /api/user/** — frontend/services/identity_api.js
- **UNKNOWN /api/ride/** — frontend/services/live_ride_api.js
- **UNKNOWN /api/ride/status** — frontend/services/live_ride_api.js
- **UNKNOWN /api/ride/** — frontend/services/notification_api.js
- **UNKNOWN /api/ride/** — frontend/services/passenger_dashboard_api.js
- **UNKNOWN /api/ride/** — frontend/services/passenger_dashboard_api.js
- **UNKNOWN /api/updates** — frontend/services/updates_api.js

---

# 5. BACKEND ENTRYPOINT

- backend/server.js

---

# 6. BACKEND ROUTER MOUNTS

- `/api/rides` → `rideRoutes`
- `/api/users` → `userRoutes`
- `/api/rewards` → `canonicalRewardRoutes`

---

# 7. FULL BACKEND ROUTE MAP

- `GET /health` — backend/server/app.js
- `POST /api/rides` — backend/ride_api_patch.js
- `GET /api/rides` — backend/ride_api_patch.js
- `GET /api/rides/:id` — backend/ride_api_patch.js
- `PATCH /api/rides/:id` — backend/ride_api_patch.js
- `POST /ride/:rideId` — backend/routes/canonical_reward_api.js
- `POST /ride/complete` — backend/routes/completion_api.js
- `POST /dispatch/request` — backend/routes/dispatch_api.js
- `POST /dispatch/match` — backend/routes/dispatch_api.js
- `POST /dispatch/accept` — backend/routes/dispatch_api.js
- `GET /dispatch/list` — backend/routes/dispatch_api.js
- `GET /driver/:id/dashboard` — backend/routes/driver_dashboard_api.js
- `GET /driver/demand` — backend/routes/driver_demand_api.js
- `GET /driver/:id/economy` — backend/routes/driver_economy.js
- `GET /driver/:id/economy` — backend/routes/driver_economy_api.js
- `POST /drivers/rank` — backend/routes/driver_intelligence_api.js
- `POST /drivers/best` — backend/routes/driver_intelligence_api.js
- `POST /driver/location/update` — backend/routes/driver_location_api.js
- `POST /ride/tracking` — backend/routes/driver_location_api.js
- `GET /drivers/online` — backend/routes/driver_online_api.js
- `POST /drivers/online` — backend/routes/driver_online_api.js
- `POST /drivers/offline` — backend/routes/driver_online_api.js
- `POST /marketplace/order` — backend/routes/ecosystem_tasks.js
- `GET /tasks` — backend/routes/ecosystem_tasks.js
- `PATCH /tasks/:id` — backend/routes/ecosystem_tasks.js
- `POST /update` — backend/routes/gps.js
- `GET /:device` — backend/routes/gps.js
- `GET /user/:id` — backend/routes/identity_api.js
- `POST /user/create` — backend/routes/identity_api.js
- `POST /user/verify-role` — backend/routes/identity_api.js
- `POST /demand/request` — backend/routes/live_demand_api.js
- `POST /demand/complete` — backend/routes/live_demand_api.js
- `GET /driver/hotspots` — backend/routes/live_demand_api.js
- `POST /ride/create` — backend/routes/live_ride_api.js
- `POST /ride/status` — backend/routes/live_ride_api.js
- `POST /ride/assign` — backend/routes/live_ride_api.js
- `GET /ride/:id` — backend/routes/live_ride_api.js
- `POST /driver/location` — backend/routes/matching_api.js
- `POST /matching/drivers` — backend/routes/matching_api.js
- `POST /register` — backend/routes/mobile.js
- `POST /heartbeat/:id` — backend/routes/mobile.js
- `POST /trip/start` — backend/routes/mobile.js
- `POST /notifications/create` — backend/routes/notification_api.js
- `GET /ride/:id/timeline` — backend/routes/notification_api.js
- `POST /orchestrator/create` — backend/routes/orchestrator_api.js
- `POST /orchestrator/assign` — backend/routes/orchestrator_api.js
- `POST /orchestrator/arrived` — backend/routes/orchestrator_api.js
- `POST /orchestrator/start` — backend/routes/orchestrator_api.js
- `POST /orchestrator/finish` — backend/routes/orchestrator_api.js
- `GET /passenger/:id/profile` — backend/routes/passenger_intelligence_api.js
- `POST /passenger/update` — backend/routes/passenger_intelligence_api.js
- `POST /driver/status` — backend/routes/realtime.js
- `POST /driver/location` — backend/routes/realtime.js
- `POST /event` — backend/routes/realtime.js
- `GET /events` — backend/routes/realtime.js
- `POST /economy/ride/accept` — backend/routes/ride_economy_api.js
- `POST /economy/ride/complete` — backend/routes/ride_economy_api.js
- `GET /economy/rides` — backend/routes/ride_economy_api.js
- `POST /ride/create` — backend/routes/ride_state_api.js
- `POST /ride/status` — backend/routes/ride_state_api.js
- `GET /ride/:id/status` — backend/routes/ride_state_api.js
- `POST /` — backend/routes/rides.js
- `GET /` — backend/routes/rides.js
- `GET /:id` — backend/routes/rides.js
- `PATCH /:id` — backend/routes/rides.js
- `POST /join` — backend/routes/socket_routes.js
- `POST /update` — backend/routes/socket_routes.js
- `GET /updates` — backend/routes/updates_api.js
- `POST /register` — backend/routes/users.js
- `GET /` — backend/routes/users.js
- `GET /health` — backend/server/app.js

---

# 8. COMPLETE BACKEND DEPENDENCY GRAPH

- `backend/server.js` → `./server/app` → backend/server/app.js
- `backend/server/app.js` → `express` → EXTERNAL/UNRESOLVED
- `backend/server/app.js` → `../routes/rides` → backend/routes/rides.js
- `backend/routes/rides.js` → `express` → EXTERNAL/UNRESOLVED
- `backend/routes/rides.js` → `../canonical/ride_engine` → backend/canonical/ride_engine.js
- `backend/canonical/ride_engine.js` → `./ride_repository` → backend/canonical/ride_repository.js
- `backend/canonical/ride_repository.js` → `fs` → EXTERNAL/UNRESOLVED
- `backend/canonical/ride_repository.js` → `path` → EXTERNAL/UNRESOLVED
- `backend/server/app.js` → `../routes/users` → backend/routes/users.js
- `backend/routes/users.js` → `express` → EXTERNAL/UNRESOLVED
- `backend/routes/users.js` → `../database/user_repository` → backend/database/user_repository.js
- `backend/database/user_repository.js` → `../storage/database` → backend/storage/database.js
- `backend/storage/database.js` → `fs` → EXTERNAL/UNRESOLVED
- `backend/server/app.js` → `../routes/canonical_reward_api` → backend/routes/canonical_reward_api.js
- `backend/routes/canonical_reward_api.js` → `express` → EXTERNAL/UNRESOLVED
- `backend/routes/canonical_reward_api.js` → `../services/canonical_reward_service` → backend/services/canonical_reward_service.js
- `backend/services/canonical_reward_service.js` → `../rewards/canonical_wallet_resolver` → backend/rewards/canonical_wallet_resolver.js
- `backend/rewards/canonical_wallet_resolver.js` → `fs` → EXTERNAL/UNRESOLVED
- `backend/rewards/canonical_wallet_resolver.js` → `path` → EXTERNAL/UNRESOLVED
- `backend/rewards/canonical_wallet_resolver.js` → `ethers` → EXTERNAL/UNRESOLVED
- `backend/services/canonical_reward_service.js` → `fs` → EXTERNAL/UNRESOLVED
- `backend/services/canonical_reward_service.js` → `path` → EXTERNAL/UNRESOLVED
- `backend/services/canonical_reward_service.js` → `../canonical/ride_repository` → backend/canonical/ride_repository.js

---

# 9. CANONICAL RIDE PATH

- `backend/server.js` — **REACHABLE_FROM_BACKEND_ENTRYPOINT**
- `backend/server/app.js` — **REACHABLE_FROM_BACKEND_ENTRYPOINT**
- `backend/routes/rides.js` — **REACHABLE_FROM_BACKEND_ENTRYPOINT**
- `backend/canonical/ride_engine.js` — **REACHABLE_FROM_BACKEND_ENTRYPOINT**
- `backend/canonical/ride_repository.js` — **REACHABLE_FROM_BACKEND_ENTRYPOINT**

---

# 10. DATA STORES

- `backend/data/rides.json` — 8 top-level records
- `backend/database/rides.json` — 21 top-level records
- `backend/storage/cablink_db.json` — 2 top-level records
- `backend/data/dispatch_requests.json` — 1 top-level records
- `backend/data/ride_events.json` — 1 top-level records
- `backend/data/economy_ledger.json` — 2 top-level records

---

# 11. DATA STORE REFERENCES

- `backend/canonical/ride_repository.js` → `backend/data/rides.json`
- `backend/canonical/ride_repository.js` → `backend/database/rides.json`
- `backend/database/rideRepository.js` → `backend/data/rides.json`
- `backend/database/rideRepository.js` → `backend/database/rides.json`
- `backend/ride_store.js` → `backend/data/rides.json`
- `backend/ride_store.js` → `backend/database/rides.json`
- `backend/server.js` → `backend/data/rides.json`
- `backend/server.js` → `backend/database/rides.json`
- `backend/services/canonical_reward_service.js` → `backend/data/economy_ledger.json`
- `backend/services/dispatch_service.js` → `backend/data/dispatch_requests.json`
- `backend/services/economy_ledger_service.js` → `backend/data/economy_ledger.json`
- `backend/services/live_ride_service.js` → `backend/data/rides.json`
- `backend/services/live_ride_service.js` → `backend/database/rides.json`
- `backend/services/ride_event_service.js` → `backend/data/ride_events.json`
- `backend/storage/database.js` → `backend/storage/cablink_db.json`

---

# 12. CORRECT FRONTEND ↔ BACKEND API MATRIX

| Frontend Method | Frontend Endpoint | Status | Backend Match |
|---|---|---|---|
| UNKNOWN | `/api/ride` | **NO_MATCH** | — |
| UNKNOWN | `/api/rides` | **MATCH** | `POST /api/rides`<br>`GET /api/rides` |
| UNKNOWN | `/api/drivers/online` | **NO_MATCH** | — |
| UNKNOWN | `/api/drivers/apply` | **NO_MATCH** | — |
| UNKNOWN | `/api/dispatch/requests` | **NO_MATCH** | — |
| UNKNOWN | `/api/dispatch/accept` | **NO_MATCH** | — |
| UNKNOWN | `/api/drivers/offline` | **NO_MATCH** | — |
| UNKNOWN | `/api/driver/DRIVER001/economy` | **NO_MATCH** | — |
| UNKNOWN | `/api/driver/hotspots` | **NO_MATCH** | — |
| UNKNOWN | `/api/dispatch/request` | **NO_MATCH** | — |
| UNKNOWN | `/api/updates` | **NO_MATCH** | — |
| UNKNOWN | `/api/driver/demand` | **NO_MATCH** | — |
| UNKNOWN | `/api/driver` | **NO_MATCH** | — |
| UNKNOWN | `/api/user` | **NO_MATCH** | — |
| UNKNOWN | `/api/ride/status` | **NO_MATCH** | — |

---

# 13. RIDE FILE REACHABILITY

- `frontend/components/ride_status_card.jsx` — **NOT_PROVEN_REACHABLE**
- `frontend/components/ride_timeline.jsx` — **NOT_PROVEN_REACHABLE**
- `frontend/js/ride_engine.js` — **NOT_PROVEN_REACHABLE**
- `frontend/js/rides/completionRewardBridge.js` — **NOT_PROVEN_REACHABLE**
- `frontend/js/rides/passengerRideStatus.js` — **NOT_PROVEN_REACHABLE**
- `frontend/js/rides/rideController.js` — **NOT_PROVEN_REACHABLE**
- `frontend/js/rides/rideService.js` — **NOT_PROVEN_REACHABLE**
- `frontend/js/rides/rideStateMachine.js` — **NOT_PROVEN_REACHABLE**
- `frontend/pages/PassengerRide.jsx` — **NOT_PROVEN_REACHABLE**
- `frontend/screens/passenger_ride_screen.js` — **NOT_PROVEN_REACHABLE**
- `frontend/services/live_ride_api.js` — **NOT_PROVEN_REACHABLE**
- `frontend/services/ride_service.js` — **NOT_PROVEN_REACHABLE**
- `frontend/state/ride_ui_state.js` — **NOT_PROVEN_REACHABLE**
- `backend/broadcast/ride_broadcast.js` — **NOT_PROVEN_REACHABLE**
- `backend/canonical/ride_engine.js` — **BACKEND_REACHABLE**
- `backend/canonical/ride_repository.js` — **BACKEND_REACHABLE**
- `backend/database/rideRepository.js` — **NOT_PROVEN_REACHABLE**
- `backend/database/ride_repository.js` — **NOT_PROVEN_REACHABLE**
- `backend/events/ride_event_bus.js` — **NOT_PROVEN_REACHABLE**
- `backend/fraud/ride_validation.js` — **NOT_PROVEN_REACHABLE**
- `backend/realtime/ride_channel.js` — **NOT_PROVEN_REACHABLE**
- `backend/ride_api_patch.js` — **NOT_PROVEN_REACHABLE**
- `backend/ride_store.js` — **NOT_PROVEN_REACHABLE**
- `backend/rides/ride_engine.js` — **NOT_PROVEN_REACHABLE**
- `backend/rides/ride_lifecycle.js` — **NOT_PROVEN_REACHABLE**
- `backend/rides/ride_persistence.js` — **NOT_PROVEN_REACHABLE**
- `backend/rides/ride_state_engine.js` — **NOT_PROVEN_REACHABLE**
- `backend/rides/settlement_engine.js` — **NOT_PROVEN_REACHABLE**
- `backend/routes/live_ride_api.js` — **NOT_PROVEN_REACHABLE**
- `backend/routes/ride_economy_api.js` — **NOT_PROVEN_REACHABLE**
- `backend/routes/ride_state_api.js` — **NOT_PROVEN_REACHABLE**
- `backend/routes/rides.js` — **BACKEND_REACHABLE**
- `backend/services/live_ride_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/rideService.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_completion_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_dispatch_bridge.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_economy_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_event_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_orchestrator_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/services/ride_state_service.js` — **NOT_PROVEN_REACHABLE**
- `backend/status/ride_status.js` — **NOT_PROVEN_REACHABLE**
- `backend/testing/human_ride_scenario.js` — **NOT_PROVEN_REACHABLE**

---

# 14. SYNTAX VALIDATION

- DEFERRED_TO_VITE_BUILD — frontend/App.jsx
- PASS — frontend/api/bridge_test.js
- PASS — frontend/api/cablink_api.js
- PASS — frontend/api/task_api.js
- DEFERRED_TO_VITE_BUILD — frontend/components/BottomNavigation.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/CabLinkHeader.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/DashboardCard.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/LegacyCabLink.jsx
- PASS — frontend/components/bstm_delivery_button.js
- PASS — frontend/components/bstm_menu.js
- PASS — frontend/components/dashboard_registry.js
- PASS — frontend/components/delivery_earnings_panel.js
- PASS — frontend/components/demand_panel.js
- PASS — frontend/components/driver_dashboard.js
- PASS — frontend/components/driver_demand_map.js
- PASS — frontend/components/driver_economy_dashboard.js
- PASS — frontend/components/driver_economy_screen.js
- PASS — frontend/components/driver_task_panel.js
- PASS — frontend/components/ecosystem_card.js
- PASS — frontend/components/live_driver_dashboard.js
- PASS — frontend/components/mobile_dashboard.js
- DEFERRED_TO_VITE_BUILD — frontend/components/passenger_dashboard.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/passenger_profile_card.jsx
- PASS — frontend/components/passenger_trip_status.js
- DEFERRED_TO_VITE_BUILD — frontend/components/passenger_trip_status.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/ride_status_card.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/ride_timeline.jsx
- DEFERRED_TO_VITE_BUILD — frontend/components/status_card.jsx
- PASS — frontend/components/status_panel.js
- PASS — frontend/components/thb_reward_panel.js
- DEFERRED_TO_VITE_BUILD — frontend/components/thb_reward_panel.jsx
- PASS — frontend/components/thb_wallet_panel.js
- PASS — frontend/components/updates_center.js
- PASS — frontend/config/app_config.js
- PASS — frontend/ecosystem/bstm_links.js
- PASS — frontend/js/app.js
- PASS — frontend/js/app_core.js
- PASS — frontend/js/bstm_hub_ui.js
- PASS — frontend/js/core.js
- PASS — frontend/js/driver/applicationService.js
- PASS — frontend/js/driver/driverController.js
- PASS — frontend/js/driver/driverDispatchBridge.js
- PASS — frontend/js/driver/driverLifecycleControls.js
- PASS — frontend/js/driver/driverModeBridge.js
- PASS — frontend/js/driver/driverService.js
- PASS — frontend/js/fare_engine.js
- PASS — frontend/js/financial_intelligence.js
- PASS — frontend/js/firebase.js
- PASS — frontend/js/fix.js
- PASS — frontend/js/gps/location_engine.js
- PASS — frontend/js/operations_core.js
- PASS — frontend/js/realtime/tracking_engine.js
- PASS — frontend/js/ride_engine.js
- PASS — frontend/js/rides/completionRewardBridge.js
- PASS — frontend/js/rides/passengerRideStatus.js
- PASS — frontend/js/rides/rideController.js
- PASS — frontend/js/rides/rideService.js
- PASS — frontend/js/rides/rideStateMachine.js
- PASS — frontend/js/role.js
- PASS — frontend/js/role_switch.js
- PASS — frontend/js/services/api.js
- PASS — frontend/js/services/cablinkAPI.js
- PASS — frontend/js/simulation_engine.js
- DEFERRED_TO_VITE_BUILD — frontend/main.jsx
- PASS — frontend/maps/live_map_component.js
- PASS — frontend/mobile/device_permissions.js
- PASS — frontend/mobile/mobile_entry.js
- PASS — frontend/monitoring/ui_health.js
- DEFERRED_TO_VITE_BUILD — frontend/pages/DriverDashboard.jsx
- DEFERRED_TO_VITE_BUILD — frontend/pages/PassengerRide.jsx
- DEFERRED_TO_VITE_BUILD — frontend/pages/UpdatesCenter.jsx
- PASS — frontend/pwa/install_manager.js
- PASS — frontend/screens/driver_control_screen.js
- PASS — frontend/screens/driver_dashboard.js
- PASS — frontend/screens/ecosystem_hub_screen.js
- PASS — frontend/screens/passenger_dashboard.js
- PASS — frontend/screens/passenger_ride_screen.js
- PASS — frontend/services/demand_api.js
- PASS — frontend/services/driver_dashboard_api.js
- PASS — frontend/services/driver_dashboard_live.js
- PASS — frontend/services/driver_economy_screen_service.js
- PASS — frontend/services/driver_economy_service.js
- PASS — frontend/services/economy_dashboard_api.js
- PASS — frontend/services/identity_api.js
- PASS — frontend/services/live_driver_economy.js
- PASS — frontend/services/live_ride_api.js
- PASS — frontend/services/notification_api.js
- PASS — frontend/services/passenger_dashboard_api.js
- PASS — frontend/services/ride_service.js
- PASS — frontend/services/role_service.js
- PASS — frontend/services/task_service.js
- PASS — frontend/services/updates_api.js
- PASS — frontend/services/user_service.js
- PASS — frontend/state/ride_ui_state.js
- PASS — frontend/state/session_store.js
- PASS — frontend/state/task_state.js
- PASS — frontend/testing/bstm_hub_test.js
- PASS — frontend/testing/bstm_visible_ui_test.js
- PASS — frontend/testing/driver_economy_dashboard_test.js
- PASS — frontend/testing/driver_economy_screen_test.js
- PASS — frontend/testing/driver_task_dashboard_test.js
- PASS — frontend/testing/human_interface_test.js
- PASS — frontend/testing/live_driver_dashboard_test.js
- PASS — frontend/testing/live_driver_economy_test.js
- PASS — frontend/testing/phase43_ui_test.js
- PASS — frontend/testing/phase44_page_test.js
- PASS — frontend/testing/phase45_shell_test.js
- PASS — backend/admin/admin_monitor.js
- PASS — backend/admin/operator_dashboard.js
- PASS — backend/analytics/pilot_analytics.js
- PASS — backend/analytics/pilot_failure_tracker.js
- PASS — backend/api/cablink_gateway.js
- PASS — backend/api/reward_api.js
- PASS — backend/audit/production_audit.js
- PASS — backend/auth/auth_connector.js
- PASS — backend/auth/auth_engine.js
- PASS — backend/auth/otp_service.js
- PASS — backend/auth/phone_verification_engine.js
- PASS — backend/blockchain/chain_health.js
- PASS — backend/blockchain/thb_config.js
- PASS — backend/blockchain/thb_real_executor.js
- PASS — backend/blockchain/thb_transaction_engine.js
- PASS — backend/blockchain/thb_transfer_service.js
- PASS — backend/blockchain/thb_transfer_worker.js
- PASS — backend/blockchain/wallet_validator.js
- PASS — backend/broadcast/ride_broadcast.js
- PASS — backend/canonical/ride_engine.js
- PASS — backend/canonical/ride_repository.js
- PASS — backend/cloud/cloud_adapter.js
- PASS — backend/cloud/production_adapter.js
- PASS — backend/config/env_check.js
- PASS — backend/config/environment_validator.js
- PASS — backend/config/provider_config.js
- PASS — backend/database/migration_engine.js
- PASS — backend/database/production_schema.js
- PASS — backend/database/rideRepository.js
- PASS — backend/database/ride_repository.js
- PASS — backend/database/user_repository.js
- PASS — backend/devices/device_registry.js
- PASS — backend/dispatch/dispatch_engine.js
- PASS — backend/drivers/driver_state.js
- PASS — backend/drivers/heartbeat_engine.js
- PASS — backend/economy/delivery_fare_engine.js
- PASS — backend/ecosystem/marketplace_bridge.js
- PASS — backend/environment/readiness_check.js
- PASS — backend/events/ride_event_bus.js
- PASS — backend/extensions/extension_registry.js
- PASS — backend/fare/fare_engine.js
- PASS — backend/firebase/firebase_adapter.js
- PASS — backend/fraud/reward_guard.js
- PASS — backend/fraud/ride_validation.js
- PASS — backend/gps/gps_service.js
- PASS — backend/gps/location_stream.js
- PASS — backend/heartbeat/device_monitor.js
- PASS — backend/location/gps_event_engine.js
- PASS — backend/location/location_service.js
- PASS — backend/location/location_stream.js
- PASS — backend/location/radar_engine.js
- PASS — backend/logs/system_logger.js
- PASS — backend/maps/gps_engine.js
- PASS — backend/maps/map_provider.js
- PASS — backend/matching/driver_matcher.js
- PASS — backend/matching/driver_matching_engine.js
- PASS — backend/matching/matching_engine.js
- PASS — backend/middleware/error_handler.js
- PASS — backend/mobile/device_registry.js
- PASS — backend/monitoring/system_health.js
- PASS — backend/notifications/notification_center.js
- PASS — backend/notifications/notification_engine.js
- PASS — backend/notifications/push_bridge.js
- PASS — backend/onboarding/onboarding_engine.js
- PASS — backend/payments/payment_adapter.js
- PASS — backend/payments/payment_engine.js
- PASS — backend/payments/payment_provider_adapter.js
- PASS — backend/payments/payment_transaction_layer.js
- PASS — backend/payments/transaction_recorder.js
- PASS — backend/pricing/fare_calculator.js
- PASS — backend/production/database_adapter.js
- PASS — backend/providers/cloud_database_connector.js
- PASS — backend/providers/cloud_provider.js
- PASS — backend/providers/maps_connector.js
- PASS — backend/push/push_engine.js
- PASS — backend/realtime/channel_manager.js
- PASS — backend/realtime/event_bus.js
- PASS — backend/realtime/presence_engine.js
- PASS — backend/realtime/realtime_bridge.js
- PASS — backend/realtime/ride_channel.js
- PASS — backend/rewards/auto_reward_trigger.js
- PASS — backend/rewards/blockchain_reward_adapter.js
- PASS — backend/rewards/canonical_wallet_resolver.js
- PASS — backend/rewards/delivery_completion.js
- PASS — backend/rewards/delivery_reward_engine.js
- PASS — backend/rewards/delivery_reward_service.js
- PASS — backend/rewards/reward_claim_engine.js
- PASS — backend/rewards/reward_engine.js
- PASS — backend/rewards/reward_history.js
- PASS — backend/rewards/thb_claim_engine.js
- PASS — backend/rewards/thb_contract_adapter.js
- PASS — backend/rewards/thb_service.js
- PASS — backend/rewards/thb_transaction_layer.js
- PASS — backend/rewards/thb_transfer_queue.js
- PASS — backend/rewards/wallet_service.js
- PASS — backend/ride_api_patch.js
- PASS — backend/ride_store.js
- PASS — backend/rides/ride_engine.js
- PASS — backend/rides/ride_lifecycle.js
- PASS — backend/rides/ride_persistence.js
- PASS — backend/rides/ride_state_engine.js
- PASS — backend/rides/settlement_engine.js
- PASS — backend/routes/canonical_reward_api.js
- PASS — backend/routes/completion_api.js
- PASS — backend/routes/dispatch_api.js
- PASS — backend/routes/driver_dashboard_api.js
- PASS — backend/routes/driver_demand_api.js
- PASS — backend/routes/driver_economy.js
- PASS — backend/routes/driver_economy_api.js
- PASS — backend/routes/driver_intelligence_api.js
- PASS — backend/routes/driver_location_api.js
- PASS — backend/routes/driver_online_api.js
- PASS — backend/routes/ecosystem_tasks.js
- PASS — backend/routes/gps.js
- PASS — backend/routes/identity_api.js
- PASS — backend/routes/live_demand_api.js
- PASS — backend/routes/live_ride_api.js
- PASS — backend/routes/matching_api.js
- PASS — backend/routes/mobile.js
- PASS — backend/routes/notification_api.js
- PASS — backend/routes/orchestrator_api.js
- PASS — backend/routes/passenger_intelligence_api.js
- PASS — backend/routes/realtime.js
- PASS — backend/routes/ride_economy_api.js
- PASS — backend/routes/ride_state_api.js
- PASS — backend/routes/rides.js
- PASS — backend/routes/socket_routes.js
- PASS — backend/routes/updates_api.js
- PASS — backend/routes/users.js
- PASS — backend/safety/emergency_engine.js
- PASS — backend/safety/incident_report.js
- PASS — backend/safety/safety_engine.js
- PASS — backend/security/device_registry.js
- PASS — backend/security/fraud_engine.js
- PASS — backend/security/security_audit.js
- PASS — backend/security/security_engine.js
- PASS — backend/server/app.js
- PASS — backend/server/index.js
- PASS — backend/server.js
- PASS — backend/services/canonical_reward_service.js
- PASS — backend/services/demand_service.js
- PASS — backend/services/dispatch_service.js
- PASS — backend/services/driver_intelligence_service.js
- PASS — backend/services/driver_location_service.js
- PASS — backend/services/driver_matching_service.js
- PASS — backend/services/driver_service.js
- PASS — backend/services/economy_ledger_service.js
- PASS — backend/services/identity_service.js
- PASS — backend/services/live_demand_service.js
- PASS — backend/services/live_ride_service.js
- PASS — backend/services/location/location_service.js
- PASS — backend/services/notification_service.js
- PASS — backend/services/notifications/notification_service.js
- PASS — backend/services/passenger_intelligence_service.js
- PASS — backend/services/payment_service.js
- PASS — backend/services/realtime/realtime_service.js
- PASS — backend/services/reward_service.js
- PASS — backend/services/rideService.js
- PASS — backend/services/ride_completion_service.js
- PASS — backend/services/ride_dispatch_bridge.js
- PASS — backend/services/ride_economy_service.js
- PASS — backend/services/ride_event_service.js
- PASS — backend/services/ride_orchestrator_service.js
- PASS — backend/services/ride_service.js
- PASS — backend/services/ride_state_service.js
- PASS — backend/sessions/session_engine.js
- PASS — backend/sms/sms_engine.js
- PASS — backend/socket/server_socket.js
- PASS — backend/socket/socket_manager.js
- PASS — backend/status/ride_status.js
- PASS — backend/storage/database.js
- PASS — backend/support/ticket_system.js
- PASS — backend/sync/live_sync_engine.js
- PASS — backend/tasks/task_manager.js
- PASS — backend/testing/delivery_economy_test.js
- PASS — backend/testing/human_ride_scenario.js
- PASS — backend/testing/live_task_flow_test.js
- PASS — backend/testing/marketplace_bridge_test.js
- PASS — backend/testing/phase24_verification.js
- PASS — backend/testing/phase28_reward_flow_test.js
- PASS — backend/testing/phase32_dashboard_api_test.js
- PASS — backend/testing/phase34_economy_test.js
- PASS — backend/testing/phase35_ledger_test.js
- PASS — backend/testing/phase37_dashboard_test.js
- PASS — backend/testing/phase40_demand_test.js
- PASS — backend/testing/phase41_matching_test.js
- PASS — backend/testing/phase42_dispatch_test.js
- PASS — backend/testing/phase46_live_test.js
- PASS — backend/testing/phase47_eta_test.js
- PASS — backend/testing/phase48_completion_test.js
- PASS — backend/testing/phase49_notification_test.js
- PASS — backend/testing/phase50_state_test.js
- PASS — backend/testing/phase51_orchestrator_test.js
- PASS — backend/testing/phase52_driver_test.js
- PASS — backend/testing/phase53_identity_test.js
- PASS — backend/testing/pilot_activation_test.js
- PASS — backend/testing/reward_wallet_test.js
- PASS — backend/testing/thb_delivery_reward_test.js
- PASS — backend/testing/two_phone_pilot.js
- PASS — backend/tracking/location_session.js
- PASS — backend/tracking/location_tracker.js
- PASS — backend/transactions/transaction_record.js
- PASS — backend/trips/trip_manager.js
- PASS — backend/trust/trust_engine.js
- PASS — backend/users/user_account_engine.js
- PASS — backend/users/wallet_manager.js
- PASS — backend/validation/input_validator.js

---

# 15. BUILD VALIDATION

Status: **NO_BUILD_SCRIPT**



---

# 16. STEP 8.1 INTERPRETATION

This corrected audit is intended to establish runtime truth before destructive cleanup.

The audit distinguishes:

1. Frontend files reachable from the actual frontend entrypoint.
2. Backend files reachable from the backend entrypoint through recursive imports.
3. Exact frontend API method/path compatibility.
4. Canonical ride component reachability.
5. Direct data-store filename references.
6. Node syntax validation.
7. Actual project build validation.

IMPORTANT:

A file marked NOT_PROVEN_REACHABLE is NOT automatically safe to delete.

A file marked REACHABLE is NOT automatically the correct architecture.

No application files were modified.

---

# 17. NEXT DECISION GATE

The next repair decision should be based on:

- The actual frontend build result.
- The exact active React component chain.
- The exact backend dependency chain.
- The exact API mismatch list.
- The actual ride repository data-store reference.
- Any runtime errors produced after starting the backend and frontend.

No cleanup or deletion should occur until those findings are reviewed.
