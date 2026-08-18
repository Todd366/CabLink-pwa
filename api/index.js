// ============================================================
// VERCEL SERVERLESS ENTRYPOINT
//
// This used to be a completely separate, in-memory-only
// reimplementation of the ride API (rides stored in a plain
// JS array — wiped on every cold start, no persistence, no
// reward logic, no blockchain). It has been archived at:
//   archive/legacy_root_scripts_and_backups_2026-08-05/api_index_old_inmemory.js
//
// This file now simply exports the real canonical backend
// (backend/server/app.js) so that whichever way CabLink is
// deployed — a normal Node process (`npm start`) or Vercel
// serverless — every request runs through the exact same
// ride engine, persistence, and reward pipeline.
//
// IMPORTANT — persistence mode on Vercel:
// Vercel's serverless filesystem is not reliably persistent
// across invocations, so the default LOCAL (flat JSON file)
// persistence mode will lose ride data between requests in
// production. Before going live on Vercel, set:
//
//   CABLINK_RIDE_PERSISTENCE=FIRESTORE
//
// as an environment variable in the Vercel project settings,
// and make sure the Firebase Admin credentials are also set
// there. Without this, rides created in production may not
// be found on a subsequent request that hits a different
// serverless instance.
// ============================================================

module.exports = require("../backend/server/app");
