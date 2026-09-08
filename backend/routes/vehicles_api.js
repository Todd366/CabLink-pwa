// ============================================================
// VEHICLES API
//
// GET   /api/vehicles/mine              — the logged-in driver's own vehicle
// GET   /api/admin/vehicles             — admin: list all (optional ?status=)
// PATCH /api/admin/vehicles/:id         — admin: correct serviceClass/capacity/
//                                          makeModel/plate, or verify/reject
//
// Same requireAdmin pattern as driver_applications_api.js — accepts
// either the x-admin-key header or a Bearer session whose account
// role is ADMIN.
// ============================================================

const router = require("express").Router();
const vehicles = require("../services/vehicle_service");
const auth = require("../services/auth_service");

const ADMIN_KEY = process.env.ADMIN_KEY || "cablink-admin-dev-key";

async function requireAdmin(req, res, next) {
    if (req.headers["x-admin-key"] === ADMIN_KEY) {
        return next();
    }

    const account = await auth.accountFromRequest(req);

    if (account && account.role === "ADMIN") {
        req.adminAccount = account;
        return next();
    }

    return res.status(401).json({ success: false, error: "Admin access required" });
}

router.get("/vehicles/mine", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);
        if (!account) {
            return res.status(401).json({ success: false, error: "Log in first" });
        }

        const vehicle = await vehicles.getVehicleByAccountId(account.id);
        res.json({ success: true, vehicle: vehicle || null });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/admin/vehicles", requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            vehicles: await vehicles.listVehicles(req.query.status)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch("/admin/vehicles/:id", requireAdmin, async (req, res) => {
    try {
        const updated = await vehicles.updateVehicle(
            req.params.id,
            req.body || {},
            req.adminAccount ? req.adminAccount.id : null
        );
        res.json({ success: true, vehicle: updated });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

module.exports = router;
