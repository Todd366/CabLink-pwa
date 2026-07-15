# CABLINK TRUTH REPORT

Generated: 2026-07-15T10:51:03.527Z
Mode: fix-report

## 1. What is real

Backend routes actually found on disk:
- `POST /api/rides` — backend/ride_api_patch.js:7
- `GET /api/rides` — backend/ride_api_patch.js:36
- `GET /api/rides/:id` — backend/ride_api_patch.js:46
- `PATCH /api/rides/:id` — backend/ride_api_patch.js:65
- `POST /ride/complete` — backend/routes/completion_api.js:8
- `POST /dispatch/request` — backend/routes/dispatch_api.js:11
- `POST /dispatch/match` — backend/routes/dispatch_api.js:31
- `POST /dispatch/accept` — backend/routes/dispatch_api.js:52
- `GET /dispatch/list` — backend/routes/dispatch_api.js:73
- `GET /driver/:id/dashboard` — backend/routes/driver_dashboard_api.js:9
- `GET /driver/demand` — backend/routes/driver_demand_api.js:8
- `GET /driver/:id/economy` — backend/routes/driver_economy.js:9
- `GET /driver/:id/economy` — backend/routes/driver_economy_api.js:8
- `POST /drivers/rank` — backend/routes/driver_intelligence_api.js:9
- `POST /drivers/best` — backend/routes/driver_intelligence_api.js:29
- `POST /driver/location/update` — backend/routes/driver_location_api.js:8
- `POST /ride/tracking` — backend/routes/driver_location_api.js:21
- `GET /drivers/online` — backend/routes/driver_online_api.js:19
- `POST /drivers/online` — backend/routes/driver_online_api.js:32
- `POST /drivers/offline` — backend/routes/driver_online_api.js:67
- `POST /marketplace/order` — backend/routes/ecosystem_tasks.js:9
- `GET /tasks` — backend/routes/ecosystem_tasks.js:22
- `PATCH /tasks/:id` — backend/routes/ecosystem_tasks.js:35
- `POST /update` — backend/routes/gps.js:7
- `GET /:device` — backend/routes/gps.js:23
- `GET /user/:id` — backend/routes/identity_api.js:11
- `POST /user/create` — backend/routes/identity_api.js:31
- `POST /user/verify-role` — backend/routes/identity_api.js:51
- `POST /demand/request` — backend/routes/live_demand_api.js:11
- `POST /demand/complete` — backend/routes/live_demand_api.js:31
- `GET /driver/hotspots` — backend/routes/live_demand_api.js:51
- `POST /ride/create` — backend/routes/live_ride_api.js:11
- `POST /ride/status` — backend/routes/live_ride_api.js:29
- `POST /ride/assign` — backend/routes/live_ride_api.js:50
- `GET /ride/:id` — backend/routes/live_ride_api.js:71
- `POST /driver/location` — backend/routes/matching_api.js:11
- `POST /matching/drivers` — backend/routes/matching_api.js:31
- `POST /register` — backend/routes/mobile.js:8
- `POST /heartbeat/:id` — backend/routes/mobile.js:21
- `POST /trip/start` — backend/routes/mobile.js:34
- `POST /notifications/create` — backend/routes/notification_api.js:11
- `GET /ride/:id/timeline` — backend/routes/notification_api.js:27
- `POST /orchestrator/create` — backend/routes/orchestrator_api.js:10
- `POST /orchestrator/assign` — backend/routes/orchestrator_api.js:27
- `POST /orchestrator/arrived` — backend/routes/orchestrator_api.js:47
- `POST /orchestrator/start` — backend/routes/orchestrator_api.js:66
- `POST /orchestrator/finish` — backend/routes/orchestrator_api.js:85
- `GET /passenger/:id/profile` — backend/routes/passenger_intelligence_api.js:8
- `POST /passenger/update` — backend/routes/passenger_intelligence_api.js:21
- `POST /driver/status` — backend/routes/realtime.js:9
- `POST /driver/location` — backend/routes/realtime.js:25
- `POST /event` — backend/routes/realtime.js:41
- `GET /events` — backend/routes/realtime.js:57
- `POST /economy/ride/accept` — backend/routes/ride_economy_api.js:8
- `POST /economy/ride/complete` — backend/routes/ride_economy_api.js:27
- `GET /economy/rides` — backend/routes/ride_economy_api.js:45
- `POST /ride/create` — backend/routes/ride_state_api.js:7
- `POST /ride/status` — backend/routes/ride_state_api.js:17
- `GET /ride/:id/status` — backend/routes/ride_state_api.js:30
- `POST /request` — backend/routes/rides.js:11
- `GET /` — backend/routes/rides.js:91
- `PATCH /:id` — backend/routes/rides.js:119
- `POST /join` — backend/routes/socket_routes.js:7
- `POST /update` — backend/routes/socket_routes.js:23
- `GET /updates` — backend/routes/updates_api.js:7
- `POST /register` — backend/routes/users.js:7
- `GET /` — backend/routes/users.js:31
- `GET /health` — backend/server/app.js:13
- `GET /api/health` — backend/server.js:19
- `POST /api/rides` — backend/server.js:26
- `GET /api/rides` — backend/server.js:48
- `PATCH /api/rides/:id` — backend/server.js:52
- `POST /api/drivers/online` — backend/server.js:60
- `POST /api/drivers/offline` — backend/server.js:73
- `GET /api/drivers/online` — backend/server.js:80
- `POST /api/drivers/apply` — backend/server.js:86
- `GET *` — backend/server.js:100

Required endpoint check:
- ✅ `GET /api/health` — backend/server.js:19
- ✅ `POST /api/rides` — backend/ride_api_patch.js:7
- ✅ `GET /api/rides` — backend/ride_api_patch.js:36
- ✅ `POST /api/drivers/online` — backend/server.js:60
- ✅ `POST /api/drivers/offline` — backend/server.js:73
- ✅ `GET /api/drivers/online` — backend/server.js:80

## 2. What is fake

RED (fake code sitting inside a production function): 95
- backend/ride_store.js:22 — `Math.random` (inside a production function body)
- cablink_disable_fake_driver_requests.js:37 — `fake` (inside a production function body)
- fix.js:71 — `setTimeout` (inside a production function body)
- frontend/index.html:1072 — `simulate` (inside a production function body)
- frontend/index.html:1265 — `Math.random` (inside a production function body)
- frontend/index.html:1337 — `Math.random` (inside a production function body)
- frontend/index.html:1337 — `Math.random` (inside a production function body)
- frontend/index.html:1337 — `Math.random` (inside a production function body)
- frontend/index.html:1337 — `Math.random` (inside a production function body)
- frontend/index.html:1337 — `Math.random` (inside a production function body)
- frontend/index.html:1906 — `fake` (inside a production function body)
- frontend/index.html:1265 — `localStorage` (inside a production function body)
- frontend/index.html:1266 — `localStorage` (inside a production function body)
- frontend/index.html:1783 — `localStorage` (inside a production function body)
- frontend/index.html:1799 — `localStorage` (inside a production function body)
- frontend/index.html:1855 — `localStorage` (inside a production function body)
- frontend/js/app.js:83 — `setTimeout` (inside a production function body)
- frontend/js/core.js:9 — `setTimeout` (inside a production function body)
- frontend/js/fix.js:55 — `setTimeout` (inside a production function body)
- index.html:1069 — `simulate` (inside a production function body)
- index.html:1262 — `Math.random` (inside a production function body)
- index.html:1334 — `Math.random` (inside a production function body)
- index.html:1334 — `Math.random` (inside a production function body)
- index.html:1334 — `Math.random` (inside a production function body)
- index.html:1334 — `Math.random` (inside a production function body)
- index.html:1334 — `Math.random` (inside a production function body)
- index.html:1262 — `localStorage` (inside a production function body)
- index.html:1263 — `localStorage` (inside a production function body)
- index_before_bstm_mount.html:1280 — `simulate` (inside a production function body)
- index_before_bstm_mount.html:1289 — `simulate` (inside a production function body)

YELLOW (unclear / needs manual look): 338
- backend/auth/auth_engine.js:11 — `Math.random` (context unclear — verify manually)
- backend/auth/phone_verification_engine.js:10 — `Math.random` (context unclear — verify manually)
- backend/routes/live_demand_api.js:9 — `simulate` (context unclear — verify manually)
- backend/testing/two_phone_pilot.js:3 — `simulate` (context unclear — verify manually)
- backend/testing/two_phone_pilot.js:43 — `simulate` (context unclear — verify manually)
- cablink_doctor.js:28 — `simulate` (context unclear — verify manually)
- cablink_doctor.js:28 — `simulate` (context unclear — verify manually)
- cablink_doctor.js:38 — `simulate` (context unclear — verify manually)
- cablink_doctor.js:33 — `mock` (context unclear — verify manually)
- cablink_doctor.js:27 — `fake` (context unclear — verify manually)
- cablink_doctor.js:32 — `fake` (context unclear — verify manually)
- cablink_doctor.js:81 — `fake` (context unclear — verify manually)
- cablink_doctor.js:83 — `fake` (context unclear — verify manually)
- cablink_doctor.js:83 — `fake` (context unclear — verify manually)
- cablink_doctor.js:115 — `fake` (context unclear — verify manually)
- cablink_doctor.js:117 — `fake` (context unclear — verify manually)
- cablink_doctor.js:117 — `fake` (context unclear — verify manually)
- cablink_doctor.js:212 — `fake` (context unclear — verify manually)
- cablink_doctor.js:31 — `localStorage` (context unclear — verify manually)
- cablink_doctor.js:31 — `localStorage` (context unclear — verify manually)
- deployment/reality_activation_report.js:16 — `simulate` (context unclear — verify manually)
- fix.js:159 — `setTimeout` (context unclear — verify manually)
- fix.js:16 — `localStorage` (context unclear — verify manually)
- fix.js:147 — `localStorage` (context unclear — verify manually)
- fix.js:147 — `localStorage` (context unclear — verify manually)
- fix.js:150 — `localStorage` (context unclear — verify manually)
- fix.js:165 — `localStorage` (context unclear — verify manually)
- fix.js:167 — `localStorage` (context unclear — verify manually)
- fix.js:168 — `localStorage` (context unclear — verify manually)
- frontend/components/passenger_dashboard.jsx:11 — `localStorage` (context unclear — verify manually)

## 3. What is connected

- ✅ bookRide() -> POST /api/rides
   - frontend: fix.js:60 calls `POST /api/rides`
   - backend: backend/ride_api_patch.js:7 defines `POST /api/rides`
- ⚠️ createRide() -> POST /api/rides
   - frontend: no matching fetch() call found
   - backend: backend/ride_api_patch.js:7 defines `POST /api/rides`
- ✅ toggleDriverMode() -> POST /api/drivers/online
   - frontend: fix.js:85 calls `POST /api/drivers/online`
   - backend: backend/server.js:60 defines `POST /api/drivers/online`
- ✅ pollForRideRequests() -> GET /api/rides
   - frontend: frontend/index.html:1289 calls `GET /api/rides`
   - backend: backend/ride_api_patch.js:36 defines `GET /api/rides`
- ❌ acceptRide() -> ride acceptance endpoint
   - frontend: no matching fetch() call found
   - backend: no matching route found
- ❌ completeRide() -> ride completion / reward trigger
   - frontend: no matching fetch() call found
   - backend: no matching route found

## 4. What is broken

- createRide() -> POST /api/rides — status YELLOW
- acceptRide() -> ride acceptance endpoint — status RED
- completeRide() -> ride completion / reward trigger — status RED

Duplicate function definitions (JS "last one wins" risk):
- `bookRide` defined 12x:
   - fix.js:50 (window-override) [ACTIVE — this one wins at runtime]
   - frontend/index.html:970 (declaration)
   - frontend/js/app.js:49 (window-override) [not loaded in browser]
   - frontend/js/core.js:4 (window-override) [not loaded in browser]
   - frontend/js/fix.js:49 (window-override) [not loaded in browser]
   - index.html:967 (declaration)
   - index_before_bstm_mount.html:1250 (declaration)
   - index_before_reality_cutover.html:970 (declaration)
   - index_before_role_auto_cleanup.html:1250 (declaration)
   - index_before_role_cleanup.html:1250 (declaration)
   - index_before_role_fix_1784018514824.html:1228 (declaration)
   - index_before_script_repair_1784017559902.html:1227 (declaration)
- `toggleDriverMode` defined 14x:
   - fix.js:75 (window-override) [ACTIVE — this one wins at runtime]
   - frontend/index.html:1261 (declaration)
   - frontend/index.html:1762 (window-override-async)
   - frontend/js/app.js:86 (window-override) [not loaded in browser]
   - frontend/js/core.js:12 (window-override) [not loaded in browser]
   - frontend/js/fix.js:58 (window-override) [not loaded in browser]
   - index.html:1258 (declaration)
   - index_before_bstm_mount.html:1769 (declaration)
   - index_before_reality_cutover.html:1276 (declaration)
   - index_before_reality_cutover.html:1713 (window-override-async)
   - index_before_role_auto_cleanup.html:1769 (declaration)
   - index_before_role_cleanup.html:1769 (declaration)
   - index_before_role_fix_1784018514824.html:1747 (declaration)
   - index_before_script_repair_1784017559902.html:1746 (declaration)
- `simulateRide` defined 8x:
   - frontend/index.html:1042 (declaration)
   - index.html:1039 (declaration) [ACTIVE — this one wins at runtime]
   - index_before_bstm_mount.html:1302 (declaration)
   - index_before_reality_cutover.html:1040 (declaration)
   - index_before_role_auto_cleanup.html:1302 (declaration)
   - index_before_role_cleanup.html:1302 (declaration)
   - index_before_role_fix_1784018514824.html:1280 (declaration)
   - index_before_script_repair_1784017559902.html:1279 (declaration)
- `addDriverRequest` defined 11x:
   - cablink_disable_fake_driver_requests.js:34 (window-override) [not loaded in browser]
   - frontend/index.html:1334 (declaration)
   - frontend/index.html:1903 (window-override)
   - index.html:1331 (declaration) [ACTIVE — this one wins at runtime]
   - index_before_bstm_mount.html:1784 (declaration)
   - index_before_reality_cutover.html:1285 (declaration)
   - index_before_reality_cutover.html:1854 (window-override)
   - index_before_role_auto_cleanup.html:1784 (declaration)
   - index_before_role_cleanup.html:1784 (declaration)
   - index_before_role_fix_1784018514824.html:1762 (declaration)
   - index_before_script_repair_1784017559902.html:1761 (declaration)
- `pollForRideRequests` defined 2x:
   - frontend/index.html:1284 (declaration)
   - index.html:1281 (declaration) [ACTIVE — this one wins at runtime]
- `createRide` defined 3x:
   - backend/ride_store.js:18 (declaration) [not loaded in browser]
   - backend/rides/ride_engine.js:15 (declaration) [not loaded in browser]
   - backend/services/ride_orchestrator_service.js:16 (declaration) [not loaded in browser]
- `completeRide` defined 9x:
   - backend/services/ride_completion_service.js:6 (declaration) [not loaded in browser]
   - frontend/index.html:1055 (declaration)
   - index.html:1052 (declaration) [ACTIVE — this one wins at runtime]
   - index_before_bstm_mount.html:1342 (declaration)
   - index_before_reality_cutover.html:1070 (declaration)
   - index_before_role_auto_cleanup.html:1342 (declaration)
   - index_before_role_cleanup.html:1342 (declaration)
   - index_before_role_fix_1784018514824.html:1320 (declaration)
   - index_before_script_repair_1784017559902.html:1319 (declaration)
- `calculateFare` defined 2x:
   - fare_engine.js:8 (window-override) [ACTIVE — this one wins at runtime]
   - frontend/js/fare_engine.js:17 (window-override) [not loaded in browser]

Live API health test:
- ❌ GET /api/health — FAIL (ECONNREFUSED)
- ❌ GET /api/rides — FAIL (ECONNREFUSED)
- ❌ GET /api/drivers/online — FAIL (ECONNREFUSED)

## 5. Exact fixes required

1. `bookRide` has 2 browser-loaded definitions. Keep the one at fix.js:50; remove/consolidate: index.html:967.
2. `toggleDriverMode` has 2 browser-loaded definitions. Keep the one at fix.js:75; remove/consolidate: index.html:1258.
3. Wire up: acceptRide() -> ride acceptance endpoint — no working link found in either frontend or backend.
4. Wire up: completeRide() -> ride completion / reward trigger — no working link found in either frontend or backend.

## 6. Production readiness score

**58/100** — based on 3/6 core ride-lifecycle links fully connected, 1/6 partially connected.

This score reflects only what this static/live scan could verify. It is not a substitute for an actual end-to-end manual ride test.
