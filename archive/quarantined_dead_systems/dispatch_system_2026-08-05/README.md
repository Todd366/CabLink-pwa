# Quarantined: legacy dispatch system

Moved here 2026-08-05 during the production audit.

## Why
This was a fully separate, parallel ride system living at
`/api/dispatch/*`, backed by `backend/data/dispatch_requests.json`.
It had no completion endpoint, no state machine, and no connection
to the reward pipeline — a ride could reach "ACCEPTED" and then go
nowhere. It was still being called by the live frontend
(`PassengerRide.jsx`) while the real, working system
(`/api/rides`, canonical/ride_engine.js) sat unused.

The frontend has been rewired to use `/api/rides` end to end.
This system is kept here (not deleted) only for reference in case
any historical logic needs to be recovered.

## Do not re-mount these routes in app.js.
