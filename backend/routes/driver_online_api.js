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

router.post("/drivers/online", async (req, res) => {
    try {
        const driver = await registry.goOnline(req.body || {});
        res.json({ success: true, driver });
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
