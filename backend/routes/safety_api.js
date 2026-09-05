const router = require("express").Router();
const incidents = require("../services/incident_service");
const auth = require("../services/auth_service");
const events = require("../services/event_service");

const ADMIN_KEY = process.env.ADMIN_KEY || "cablink-admin-dev-key";

async function requireAdmin(req, res, next) {
    if (req.headers["x-admin-key"] === ADMIN_KEY) {
        return next();
    }
    const account = await auth.accountFromRequest(req);
    if (account && account.role === "ADMIN") {
        return next();
    }
    return res.status(401).json({ success: false, error: "Admin access required" });
}

// ============================================================
// POST /api/incidents — create a report (SOS or otherwise)
// ============================================================
// Works whether or not the reporter is logged in — an SOS press
// mid-emergency shouldn't be blocked by an auth check. If a
// session token is present, the report gets attached to that
// account; otherwise it's still recorded, just anonymous.
router.post("/incidents", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        const incident = await incidents.createIncident({
            type: req.body?.type,
            description: req.body?.description,
            rideId: req.body?.rideId,
            location: req.body?.location,
            reporterAccountId: account ? account.id : null,
            reporterName: account ? account.name : (req.body?.reporterName || "Anonymous")
        });

        events.recordEvent("INCIDENT_CREATED", {
            rideId: incident.rideId,
            meta: { type: incident.type }
        });

        res.json({ success: true, incident });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// GET /api/incidents/mine — the logged-in account's own reports
// ============================================================
router.get("/incidents/mine", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);
        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }
        const mine = await incidents.listIncidentsForAccount(account.id);
        res.json({ success: true, incidents: mine });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// GET /api/admin/incidents — full list, admin only
// ============================================================
router.get("/admin/incidents", requireAdmin, async (req, res) => {
    try {
        const all = await incidents.listIncidents();
        res.json({ success: true, incidents: all });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/admin/incidents/:id — set status/action/outcome
// ============================================================
router.patch("/admin/incidents/:id", requireAdmin, async (req, res) => {
    try {
        const updated = await incidents.updateIncident(req.params.id, {
            status: req.body?.status,
            action: req.body?.action,
            outcome: req.body?.outcome
        });
        if (!updated) {
            return res.status(404).json({ success: false, error: "Incident not found" });
        }
        res.json({ success: true, incident: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// GET /api/admin/insights — real pattern analysis, admin only
// ============================================================
router.get("/admin/insights", requireAdmin, async (req, res) => {
    try {
        const insightsService = require("../services/insights_service");
        const insights = await insightsService.computeInsights();
        res.json({ success: true, insights });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
