# CabLink — Session Changelog (2026-08-05)

## Critical fixes
- **Vercel was running a completely different, fake backend.** `vercel.json` routed all `/api/*` to `api/index.js`, a separate in-memory-only implementation (no persistence, no rewards, no blockchain). Replaced with a one-line delegate to the real canonical backend (`backend/server/app.js`), so local dev and Vercel production now run identical logic.
- **THB rewards were entirely fake.** Ride completion calculated a reward amount but never saved it, and nothing ever executed an on-chain transfer. Wired the real flow: ride completes → reward record created → real BSC transfer attempted via the (now-hardened) `thb_real_executor.js` → result written back to the ledger.
- **No driver ever had a wallet address on file**, so even a fixed reward pipeline had nowhere to send THB. Added `/api/driver/:id/wallet` endpoint + a "Link Wallet" UI on the driver dashboard. Ride acceptance is now blocked until a driver links a wallet.
- **The live frontend used a dead-end system.** `PassengerRide.jsx` called `/api/dispatch/*`, which had no completion step and no reward integration. The real, working system (`/api/rides`, canonical `ride_engine.js`) was never reachable from the actual app. Rewired both `PassengerRide.jsx` and `DriverDashboard.jsx` onto the canonical lifecycle.
- **`DriverDashboard.jsx` couldn't see or accept rides at all.** Added ride polling, accept/arrive/pickup/start/complete actions.
- **`PATCH /api/rides/:id` was silently broken** (missing `await` on an async call — every request returned 400). Fixed.
- **`driver_economy_api.js` and `driver_demand_api.js` existed but were never mounted** in `app.js` — both 404'd. Mounted both; also fixed a field-name mismatch (`driver` vs `driverId`) that meant driver earnings would've always shown zero.

## New
- Real map (Leaflet + OpenStreetMap, no API key needed) with live pickup/dropoff/driver markers.
- Real road routing via OSRM's free public API, with a straight-line fallback if the routing call fails.
- Curated Gaborone landmark list (`frontend/config/gaborone_locations.js`) for pickup/dropoff selection until a full geocoding service is added.

## Cleanup
- Archived (not deleted) the dead dispatch system, 14 duplicate/backup variants of `api/index.js`, and ~100+ root-level one-off audit scripts, reports, and backup files into `archive/`.

## Still open / recommended next
1. **Set `CABLINK_RIDE_PERSISTENCE=FIRESTORE`** as a Vercel environment variable before relying on this in production — the default flat-JSON-file mode won't reliably persist across serverless invocations.
2. Rotate the BSC private key that was in `.env` — it left the device during this audit, so treat it as compromised regardless of testnet/mainnet status.
3. Add a real driver-location reporting pipeline (currently the map shows the driver pinned at the pickup point once assigned, not their live GPS position).
4. Replace the curated landmark list with real geocoding once volume justifies it.
