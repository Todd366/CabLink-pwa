# CABLINK TRUTH REPORT

## What is REAL
- index.html main vanilla JS app (STATE, wallet, rides, chat, confetti)
- backend/server.js Express API (rides, drivers, health endpoints)
- Firebase Firestore (driver_applications collection)
- BSC Testnet THB contract via ethers.js

## What is FAKE (intentionally, for testing)
- Simulate Ride button (test mode only)
- animateDriverDots() SVG animation
- Daily bonus (+0.5 THB local only)
- Leaderboard (mock data until Firebase)

## What is NOW FIXED
- bookRide() calls POST /api/rides — real API
- toggleDriverMode() polls GET /api/rides every 4s — real API
- submitDriverForm() calls POST /api/drivers/apply — real API + Firestore fallback
- backend/server.js broken require() fixed
- #nav duplicate CSS removed — position:fixed z-index:9999
- Override script blocks removed
- /main.jsx React entry removed (conflicts with vanilla JS)
- :root CSS vars restored

## What is BROKEN (needs Phase 2)
- Real GPS distance calculation (currently defaults to 5km estimate)
- Real driver matching (currently shows API rides to all online drivers)
- WebSocket real-time (currently polling every 4s)
- THB treasury relay (user self-transfers from own wallet)

## Production Readiness Score: 6/10
Phase 1 (GitHub Pages demo): READY
Phase 2 (real dispatch): Needs Firebase + WebSocket
