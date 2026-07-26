# CABLINK FULL STRUCTURAL AUDIT

Generated: 2026-07-26T07:32:35.533Z
Root: /data/data/com.termux/files/home/CabLink-pwa

This tool changed nothing. Every finding below is backed by a file path and line number you can go check yourself.

## 1. File structure

Total files scanned: 957

By top-level folder:
- backups: 387 files
- backend: 239 files
- frontend: 126 files
- (root): 105 files
- beta: 42 files
- database: 13 files
- pilot: 11 files
- deployment: 10 files
- .cablink_backups: 7 files
- cablink_ride_backup_20260725_221547: 7 files
- docs: 3 files
- .vercel: 2 files
- .cablink_audits: 1 files
- admin: 1 files
- api: 1 files
- config: 1 files
- future: 1 files

By extension:
- .js: 696
- .json: 76
- .jsx: 32
- .md: 25
- .py: 23
- .sh: 19
- .bak: 16
- .txt: 14
- .20260725_213658: 9
- .html: 6
- .log: 4
- (no ext): 3
- .disabled: 2
- .backup: 2
- .backup_truth_1784102755787: 2
- .backup_1784096856161: 2
- .backup_route_cleanup_1784103021100: 2
- .backup_orchestrator_1784101867069: 2
- .backup_create_order_1784101726427: 2
- .backup_identity_1784101614431: 2
- .backup_single_storage_1784102172187: 2
- .backup_runtime_reconnect: 2
- .bak_before_sync: 2
- .backup_1784097007863: 2
- .backup_booking_1784097198231: 2
- .css: 2
- .pre_consolidation: 1
- .example: 1
- .zip: 1
- .stage3_backup: 1
- .stage4g5-backup-1785018382944: 1
- .pre_driver_count_fix: 1

## 2. Syntax health — THIS IS WHERE "EVERYTHING DISAPPEARED" BUGS LIVE

### Entry file: index.html

Inline <script> blocks checked: 2 (2 OK, 0 BROKEN)

✅ No broken inline script blocks in the entry file.

External `<script src>` references:
- 🌐 https://unpkg.com/leaflet@1.9.4/dist/leaflet.js (external CDN, block #1 — not checked)
- 🌐 https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js (external CDN, block #2 — not checked)
- ✅ frontend/js/app_core.js (block #5 — file exists)
- ✅ role.js (block #6 — file exists)
- ✅ fix.js (block #7 — file exists)
- ✅ fare_engine.js (block #8 — file exists)
- ✅ frontend/js/rides/rideStateMachine.js (block #9 — file exists)
- ✅ frontend/js/rides/passengerRideStatus.js (block #10 — file exists)
- ✅ frontend/js/driver/driverLifecycleControls.js (block #11 — file exists)
- ✅ frontend/js/rides/completionRewardBridge.js (block #12 — file exists)

### All other .js files on disk

Checked: 695 (694 OK, 1 BROKEN)

**BROKEN FILES:**
- ❌ .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:
  ```
  /data/data/com.termux/files/home/CabLink-pwa/.__cablink_audit_check__.js:472
  };
  ^
  
  SyntaxError: Unexpected token '}'
      at wrapSafe (node:internal/modules/cjs/loader:1876:18)
  ```

## 3. Duplicate / competing implementations

- `bookRide` defined 7x:
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:978
   - backups/phase3-runtime-consolidation-20260725-215339/fix.js:59
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:984
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:978
   - fix.js:59
   - frontend/index.html:984
   - index.html:978
- `requestRide` defined 10x:
   - .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:302
   - .cablink_backups/driver_consolidation_20260725_213935/app_core.js:302
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:302
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/rides/rideService.js:3
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/pages/PassengerRide.jsx:22
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/services/ride_service.js:6
   - frontend/js/app_core.js:334
   - frontend/js/rides/rideService.js:3
   - frontend/pages/PassengerRide.jsx:22
   - frontend/services/ride_service.js:6
- `toggleDriverMode` defined 16x:
   - .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:401
   - .cablink_backups/driver_consolidation_20260725_213935/app_core.js:387
   - .cablink_backups/driver_consolidation_20260725_213935/fix.js:51
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:1264
   - backups/phase3-runtime-consolidation-20260725-215339/fix.js:84
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1347
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1880
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app.js:123
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/core.js:6
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:1264
   - fix.js:84
   - frontend/index.html:1347
   - frontend/index.html:1880
   - frontend/js/app.js:123
   - frontend/js/core.js:6
   - index.html:1281
- `acceptRide` defined 3x:
   - backend/services/rideService.js:29
   - backups/phase3-runtime-consolidation-20260725-215339/backend/services/rideService.js:29
   - cablink_ride_backup_20260725_221547/backend/services/rideService.js:29
- `acceptRealRequest` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:1324
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1417
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:1324
   - frontend/index.html:1417
   - index.html:1341
- `acceptRideRequest` defined 4x:
   - .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:524
   - .cablink_backups/driver_consolidation_20260725_213935/app_core.js:509
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:435
   - frontend/js/app_core.js:467
- `completeRide` defined 10x:
   - backend/services/rideService.js:42
   - backend/services/ride_completion_service.js:6
   - backups/phase3-runtime-consolidation-20260725-215339/backend/services/rideService.js:42
   - backups/phase3-runtime-consolidation-20260725-215339/backend/services/ride_completion_service.js:6
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1062
   - backups/stage4g4_20260725_235846/backend/services/ride_completion_service.js:6
   - backups/stage4g4_20260726_000412/backend/services/ride_completion_service.js:6
   - cablink_ride_backup_20260725_221547/backend/services/rideService.js:42
   - frontend/index.html:1062
   - frontend/js/app_core.js:661
- `completeRealRide` defined 2x:
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1431
   - frontend/index.html:1431
- `calculateFare` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/fare_engine.js:9
   - backups/phase3-runtime-consolidation-20260725-215339/fare_engine.js:9
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/fare_engine.js:17
   - fare_engine.js:9
   - frontend/js/fare_engine.js:17
- `calcTotalFare` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:1113
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1186
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:1113
   - frontend/index.html:1186
   - index.html:1130
- `updateFareBreakdown` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:1166
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1240
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:1166
   - frontend/index.html:1240
   - index.html:1183
- `updateFareDisplay` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/fare_engine.js:20
   - backups/phase3-runtime-consolidation-20260725-215339/fare_engine.js:20
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/fare_engine.js:36
   - fare_engine.js:20
   - frontend/js/fare_engine.js:36
- `haversineKm` defined 6x:
   - .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:37
   - .cablink_backups/driver_consolidation_20260725_213935/app_core.js:37
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1132
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:37
   - frontend/index.html:1132
   - frontend/js/app_core.js:37
- `getRideDistance` defined 4x:
   - .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:61
   - .cablink_backups/driver_consolidation_20260725_213935/app_core.js:61
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:61
   - frontend/js/app_core.js:61
- `pollForRideRequests` defined 5x:
   - .cablink_backups/driver_consolidation_20260725_213935/index.html:1287
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1380
   - backups/phase3-runtime-consolidation-20260725-215339/index.html:1287
   - frontend/index.html:1380
   - index.html:1304
- `pollOnlineDrivers` defined 2x:
   - backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:915
   - frontend/index.html:915

_Note: with a single canonical entry file (no bundler ambiguity), the LAST definition in document/load order generally wins if names collide via `window.X =` reassignment. Plain `function X(){}` redeclarations follow normal JS scoping (later one wins if in the same scope)._

## 4. Operational flow — three personas

### PASSENGER

- ✅ bookingFunctionExists
- ✅ pickupDropoffInputsExist
- ✅ fareDisplayExists
- ✅ postRidesRouteExists
- ✅ rideStatusPollingExists
- ✅ thbRewardUiExists

### DRIVER

- ✅ toggleDriverModeExists
- ✅ acceptFunctionExists
- ✅ completeFunctionExists
- ✅ driversOnlineRouteExists
- ✅ driversOfflineRouteExists
- ✅ acceptRouteExists
- ✅ completeRouteExists
- ✅ earningsUiExists

### ADMIN

- ✅ anyAdminFileExists
- ❌ anyAdminRouteExists
- ❌ dispatchOverviewExists
- ✅ driverApplicationsReviewExists

## 5. GPS, distance, and fare logic

Geolocation (`navigator.geolocation`) used in: .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js, .cablink_backups/driver_consolidation_20260725_213935/app_core.js, .cablink_backups/driver_consolidation_20260725_213935/index.html, backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html, backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js, backups/phase3-runtime-consolidation-20260725-215339/index.html, cablink_runtime_truth_audit_v3.js, frontend/index.html, frontend/js/app_core.js, index.html

Distance-calculation implementations found: 10
- .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:37
- .cablink_backups/driver_consolidation_20260725_213935/app_core.js:37
- backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1132
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:37
- frontend/index.html:1132
- frontend/js/app_core.js:37
- .cablink_backups/appcore_toggle_removal_20260725_214056/app_core.js:61
- .cablink_backups/driver_consolidation_20260725_213935/app_core.js:61
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/app_core.js:61
- frontend/js/app_core.js:61
⚠️ More than one distance implementation exists — these can silently disagree with each other. Recommend consolidating to ONE.

Fare-calculation implementations found: 20
- .cablink_backups/driver_consolidation_20260725_213935/fare_engine.js:9
- backups/phase3-runtime-consolidation-20260725-215339/fare_engine.js:9
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/fare_engine.js:17
- fare_engine.js:9
- frontend/js/fare_engine.js:17
- .cablink_backups/driver_consolidation_20260725_213935/index.html:1113
- backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1186
- backups/phase3-runtime-consolidation-20260725-215339/index.html:1113
- frontend/index.html:1186
- index.html:1130
- .cablink_backups/driver_consolidation_20260725_213935/index.html:1166
- backups/phase3-runtime-consolidation-20260725-215339/frontend/index.html:1240
- backups/phase3-runtime-consolidation-20260725-215339/index.html:1166
- frontend/index.html:1240
- index.html:1183
- .cablink_backups/driver_consolidation_20260725_213935/fare_engine.js:20
- backups/phase3-runtime-consolidation-20260725-215339/fare_engine.js:20
- backups/phase3-runtime-consolidation-20260725-215339/frontend/js/fare_engine.js:36
- fare_engine.js:20
- frontend/js/fare_engine.js:36
⚠️ More than one fare implementation exists — passengers and drivers could see different prices for the same ride depending on which one runs. Recommend consolidating to ONE source of truth.

✅ No `Math.random` found near fare/distance function definitions.

## 6. What should be created / fixed, in priority order

1. Fix the 1 other broken .js file(s) listed in section 2.
2. Consolidate competing fare/distance implementations into one source of truth.
