// ============================================================
// CABLINK CANONICAL BACKEND SERVER ENTRY
// ============================================================
//
// This file is intentionally kept as the single package.json
// backend entry point.
//
// Canonical request flow:
//
// HTTP
//   ↓
// backend/server/app.js
//   ↓
// backend/routes/rides.js
//   ↓
// backend/canonical/ride_engine.js
//   ↓
// backend/canonical/ride_repository.js
//   ↓
// backend/data/rides.json
//
// Legacy ride systems are NOT deleted by this alignment.
// ============================================================

const app = require("./server/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `🚕 CabLink backend running on port ${PORT}`
    );
});
