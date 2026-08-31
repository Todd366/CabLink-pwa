// =========================================
// CABLINK DRIVER ONLINE API
// =========================================
//
// PATCH 12: rewired onto the persistent driver registry
// (backend/services/driver_registry_service.js) instead of a
// plain in-memory array. The array approach lost every online
// driver on each Vercel serverless cold start, which meant ride
// matching could silently see zero drivers in production even
// with real drivers logged in and online. See
// driver_registry_service.js for the LOCAL/FIRESTORE dual-mode
// persistence this now goes through.
// =========================================

const express = require("express");
const router = express.Router();

const registry = require("../services/driver_registry_service");
const applications = require("../services/driver_application_service");

// GET ONLINE DRIVERS

router.get("/drivers/online", async (req, res) => {
    try {
        const drivers = await registry.all();
        res.json({ __CANARY_0817: "patch12-verify", drivers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DRIVER GO ONLINE
//
// Gated on driver-application approval: an account can only go
// online (and therefore appear in matching / receive ride
// requests) if their driver application has status APPROVED.
// Without this check, any account — including one that never
// applied at all — could mark itself online and start receiving
// real ride requests. This enforces Role 2's "not allowed to go
// online until approved" rule from the architecture doc.
//
// Uses driver.id from the request body (the logged-in account's
// real id, set by the frontend — see the `driver` object built
// in frontend/index.html's goOnline flow) rather than requiring
// a Bearer token, since this endpoint doesn't send one today. An
// anonymous/local-only id (the "DRV-<timestamp>" fallback used
// when nobody is logged in) will correctly fail this check, since
// no driver application will exist for it.

router.post("/drivers/online", async (req, res) => {
    try {
        const driver = req.body || {};

        if (!driver.id) {
            return res.status(400).json({
                success: false,
                error: "driver.id is required"
            });
        }

        const approved = await applications.isApprovedDriver(driver.id);

        if (!approved) {
            return res.status(403).json({
                success: false,
                error: "Driver application not approved yet"
            });
        }

        const result = await registry.goOnline(driver);
        res.json({ success: true, driver: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DRIVER GO OFFLINE

router.post("/drivers/offline", async (req, res) => {
    try {
        const id = req.body && req.body.id;

        if (!id) {
            return res.status(400).json({ success: false, error: "id is required" });
        }

        await registry.goOffline(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
