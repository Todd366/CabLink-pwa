const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());


// ============================================================
// ROUTES
// ============================================================

const rideRoutes =
    require("../routes/rides");

const canonicalRewardRoutes =
    require("../routes/canonical_reward_api");

const completionRoutes =
    require("../routes/completion_api");

const driverOnlineRoutes =
    require("../routes/driver_online_api");

const driverWalletRoutes =
    require("../routes/driver_wallet_api");

const driverEconomyRoutes =
    require("../routes/driver_economy_api");

const driverDemandRoutes =
    require("../routes/driver_demand_api");

const authRoutes =
    require("../routes/auth_api");

const driverApplicationRoutes =
    require("../routes/driver_applications_api");

const leaderboardRoutes =
    require("../routes/leaderboard_api");

const pushRoutes =
    require("../routes/push_api");

const marketplaceRoutes =
    require("../routes/marketplace_api");

const safetyRoutes =
    require("../routes/safety_api");


// ============================================================
// HEALTH
// ============================================================

function healthResponse(req, res) {

    res.json({

        system: "CabLink API",

        status: "ONLINE",

        time: new Date().toISOString()

    });

}


app.get(
    "/health",
    healthResponse
);


app.get(
    "/api/health",
    healthResponse
);


// ============================================================
// CANONICAL RIDE API
//
// PRIMARY RIDE SYSTEM
//
// POST  /api/rides
// GET   /api/rides
// GET   /api/rides/:id
// PATCH /api/rides/:id
// PATCH /api/rides/:id/accept
// PATCH /api/rides/:id/complete
// ============================================================

app.use(
    "/api/rides",
    rideRoutes
);


// ============================================================
// USERS
// ============================================================
//
// The old /api/users route (routes/users.js) was a dead
// duplicate identity system talking to a separate
// user_repository that nothing else used. Archived. Real
// identity is /api/auth/* only — see auth_service.js.
// ============================================================


// ============================================================
// REWARDS
// ============================================================

app.use(
    "/api/rewards",
    canonicalRewardRoutes
);


// ============================================================
// RIDE COMPLETION
//
// Legacy-compatible endpoint:
//
// POST /api/ride/complete
//
// Canonical endpoint:
//
// PATCH /api/rides/:id/complete
// ============================================================

app.use(
    "/api",
    completionRoutes
);


// ============================================================
// DISPATCH — REMOVED
//
// The legacy dispatch system (/api/dispatch/*) has been
// quarantined to:
//   archive/quarantined_dead_systems/dispatch_system_2026-08-05/
//
// It was a disconnected parallel ride system with no completion
// step or reward integration. The app now uses /api/rides only.
// ============================================================


// ============================================================
// DRIVER ONLINE REGISTRY
// ============================================================

app.use(
    "/api",
    driverOnlineRoutes
);


// ============================================================
// DRIVER WALLET LINKING
// ============================================================

app.use(
    "/api",
    driverWalletRoutes
);


// ============================================================
// DRIVER ECONOMY + DEMAND
// ============================================================

app.use(
    "/api",
    driverEconomyRoutes
);

app.use(
    "/api",
    driverDemandRoutes
);


// ============================================================
// AUTH + DRIVER APPLICATIONS
// ============================================================

app.use(
    "/api",
    authRoutes
);

app.use(
    "/api",
    driverApplicationRoutes
);

app.use(
    "/api",
    leaderboardRoutes
);

app.use(
    "/api",
    pushRoutes
);

app.use(
    "/api",
    marketplaceRoutes
);

app.use(
    "/api",
    safetyRoutes
);


// ============================================================
// EXPORT
// ============================================================

module.exports = app;
