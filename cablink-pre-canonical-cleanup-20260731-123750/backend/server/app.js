const express = require("express");

const app = express();

app.use(express.json());


// ============================================================
// ROUTES
// ============================================================

const rideRoutes =
    require("../routes/rides");

const userRoutes =
    require("../routes/users");

const canonicalRewardRoutes =
    require("../routes/canonical_reward_api");

const completionRoutes =
    require("../routes/completion_api");

const dispatchRoutes =
    require("../routes/dispatch_api");

const driverOnlineRoutes =
    require("../routes/driver_online_api");


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

app.use(
    "/api/users",
    userRoutes
);


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
// DISPATCH
//
// Dispatch is now mounted.
//
// Canonical driver polling endpoint:
//
// GET /api/dispatch/requests
//
// Passenger request:
//
// POST /api/dispatch/request
//
// Driver acceptance:
//
// POST /api/dispatch/accept
// ============================================================

app.use(
    "/api",
    dispatchRoutes
);


// ============================================================
// DRIVER ONLINE REGISTRY
// ============================================================

app.use(
    "/api",
    driverOnlineRoutes
);


// ============================================================
// EXPORT
// ============================================================

module.exports = app;
