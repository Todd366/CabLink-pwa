const router = require("express").Router();
const applications = require("../services/driver_application_service");
const auth = require("../services/auth_service");

const ADMIN_KEY = process.env.ADMIN_KEY || "cablink-admin-dev-key";

function requireAdmin(req, res, next) {
    if (req.headers["x-admin-key"] !== ADMIN_KEY) {
        return res.status(401).json({ success: false, error: "Admin key required" });
    }
    next();
}

router.get("/drivers/application-status", (req, res) => {
    const phone = String(req.query.phone || "").replace(/[^\d+]/g, "");

    if (!phone) {
        return res.status(400).json({ success: false, error: "phone query param required" });
    }

    const all = applications.list();
    const mine = all
        .filter(a => a.phone === phone)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
        success: true,
        status: mine[0] ? mine[0].status : "NONE"
    });
});

router.post("/drivers/apply", (req, res) => {
    try {
        const application = applications.apply(req.body || {});
        res.json({ success: true, application });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get("/admin/driver-applications", requireAdmin, (req, res) => {
    res.json({
        success: true,
        applications: applications.list(req.query.status)
    });
});

router.post("/admin/driver-applications/:id/approve", requireAdmin, (req, res) => {
    try {
        res.json({ success: true, application: applications.setStatus(req.params.id, "APPROVED") });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.post("/admin/driver-applications/:id/reject", requireAdmin, (req, res) => {
    try {
        res.json({ success: true, application: applications.setStatus(req.params.id, "REJECTED") });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.get("/admin/accounts", requireAdmin, async (req, res) => {
    res.json({ success: true, accounts: await auth.allAccounts() });
});

module.exports = router;
