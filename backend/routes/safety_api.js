const router = require("express").Router();
const incidents = require("../services/incident_service");
const auth = require("../services/auth_service");
const events = require("../services/event_service");
const rateLimiter = require("../services/rate_limiter_service");

const { adminKeyValid } = require("../middleware/security");

async function requireAdmin(req, res, next) {
    // Session-token path first — never rate-limited (see
    // vehicles_api.js / driver_applications_api.js for the same
    // pattern and reasoning).
    const account = await auth.accountFromRequest(req);
    if (account && account.role === "ADMIN") {
        return next();
    }
    const limit = await rateLimiter.checkAndRecord({
        key: "admin-key:" + req.ip,
        maxAttempts: 10,
        windowMs: 15 * 60 * 1000
    });
    if (!limit.allowed) {
        return res.status(429).json({ success: false, error: "Too many attempts — try again later" });
    }
    if (adminKeyValid(req)) {
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
router.post("/incidents", require("../middleware/security").requireAuth, require("../middleware/security").limit("incident", 10, 60 * 60 * 1000), async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        const incident = await incidents.createIncident({
            type: req.body?.type,
            description: req.body?.description,
            rideId: req.body?.rideId,
            location: req.body?.location,
            reporterAccountId: account ? account.id : null,
            reporterName: account.name
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

// Phones report crashes here so real-world failures on real devices are visible (never fails the app).
router.post("/client-error", async (req, res) => {
    try {
        const limit = await rateLimiter.checkAndRecord({ key: "client-error:" + req.ip, maxAttempts: 30, windowMs: 15 * 60 * 1000 });
        if (limit.allowed) {
            const b = req.body || {};
            const clip = (v, n) => String(v == null ? "" : v).slice(0, n);
            events.recordEvent("CLIENT_ERROR", { meta: { message: clip(b.message, 300), source: clip(b.source, 200), line: Number(b.line) || 0, col: Number(b.col) || 0, stack: clip(b.stack, 800), page: clip(b.page, 120), v: clip(b.v, 20), ua: clip(req.headers["user-agent"], 160) } });
        }
    } catch (e) { /* a report must never fail */ }
    res.status(204).end();
});

module.exports = router;
