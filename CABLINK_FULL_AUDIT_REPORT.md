# CABLINK FULL STRUCTURAL AUDIT

Generated: 2026-07-28T07:24:37.414Z
Root: /data/data/com.termux/files/home/CabLink-pwa

This tool changed nothing. Every finding below is backed by a file path and line number you can go check yourself.

## 1. File structure

Total files scanned: 598

By top-level folder:
- backend: 238 files
- (root): 139 files
- frontend: 122 files
- beta: 42 files
- api: 13 files
- database: 13 files
- pilot: 11 files
- deployment: 10 files
- .vercel: 3 files
- docs: 3 files
- .cablink_audits: 1 files
- admin: 1 files
- config: 1 files
- future: 1 files

By extension:
- .js: 416
- .json: 52
- .py: 24
- .md: 19
- .sh: 19
- .jsx: 16
- .bak: 14
- .txt: 7
- .pre_o6: 5
- .log: 4
- (no ext): 3
- .before-firestore-test: 3
- .html: 3
- .example: 1
- .local: 1
- .zip: 1
- .before-adapter-test: 1
- .before-canonical-firestore-test: 1
- .before-firestore-boot-diagnostic: 1
- .before-firestore-canonical-lifecycle: 1
- .before-firestore-operation-diagnostic: 1
- .before-firestore: 1
- .disabled: 1
- .bak_before_sync: 1
- .pre_driver_count_fix: 1
- .css: 1

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

Checked: 415 (415 OK, 0 BROKEN)

✅ No syntax errors found in any other .js file.

## 3. Duplicate / competing implementations

- `bookRide` defined 3x:
   - fix.js:59
   - frontend/index.html:984
   - index.html:978
- `requestRide` defined 4x:
   - frontend/js/app_core.js:334
   - frontend/js/rides/rideService.js:3
   - frontend/pages/PassengerRide.jsx:22
   - frontend/services/ride_service.js:6
- `toggleDriverMode` defined 6x:
   - fix.js:84
   - frontend/index.html:1347
   - frontend/index.html:1859
   - frontend/js/app.js:123
   - frontend/js/core.js:6
   - index.html:1281
- `completeRide` defined 3x:
   - backend/services/ride_completion_service.js:12
   - frontend/index.html:1062
   - frontend/js/app_core.js:798
- `calculateFare` defined 2x:
   - fare_engine.js:9
   - frontend/js/fare_engine.js:17
- `calcTotalFare` defined 2x:
   - frontend/index.html:1186
   - index.html:1130
- `updateFareBreakdown` defined 2x:
   - frontend/index.html:1240
   - index.html:1183
- `updateFareDisplay` defined 2x:
   - fare_engine.js:20
   - frontend/js/fare_engine.js:36
- `haversineKm` defined 2x:
   - frontend/index.html:1132
   - frontend/js/app_core.js:37
- `pollForRideRequests` defined 2x:
   - frontend/index.html:1380
   - index.html:1304

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
- ❌ driversOnlineRouteExists
- ❌ driversOfflineRouteExists
- ✅ acceptRouteExists
- ✅ completeRouteExists
- ✅ earningsUiExists

### ADMIN

- ✅ anyAdminFileExists
- ❌ anyAdminRouteExists
- ❌ dispatchOverviewExists
- ❌ driverApplicationsReviewExists

## 5. GPS, distance, and fare logic

Geolocation (`navigator.geolocation`) used in: cablink_runtime_truth_audit_v3.js, frontend/index.html, frontend/js/app_core.js, index.html

Distance-calculation implementations found: 3
- frontend/index.html:1132
- frontend/js/app_core.js:37
- frontend/js/app_core.js:61
⚠️ More than one distance implementation exists — these can silently disagree with each other. Recommend consolidating to ONE.

Fare-calculation implementations found: 8
- fare_engine.js:9
- frontend/js/fare_engine.js:17
- frontend/index.html:1186
- index.html:1130
- frontend/index.html:1240
- index.html:1183
- fare_engine.js:20
- frontend/js/fare_engine.js:36
⚠️ More than one fare implementation exists — passengers and drivers could see different prices for the same ride depending on which one runs. Recommend consolidating to ONE source of truth.

✅ No `Math.random` found near fare/distance function definitions.

## 6. What should be created / fixed, in priority order

1. Consolidate competing fare/distance implementations into one source of truth.
2. Driver flow gap: `driversOnlineRouteExists` — not found.
3. Driver flow gap: `driversOfflineRouteExists` — not found.
