// ============================================================
// DRIVER APPLICATIONS API
//
// PATCH 13: driver_application_service.js's functions are now
// async (Firestore-capable), so every handler here needs
// await + try/catch instead of calling them synchronously.
// Same routes, same response shapes — just correctly awaited.
// ============================================================

const router = require("express").Router();
const applications = require("../services/driver_application_service");
const auth = require("../services/auth_service");
const rateLimiter = require("../services/rate_limiter_service");

const ADMIN_KEY = process.env.ADMIN_KEY || "cablink-admin-dev-key";

// requireAdmin now accepts EITHER:
//   - the x-admin-key header (unchanged, kept for admin.html /
//     scripting / recovery if session auth is ever broken), OR
//   - a valid Bearer session token whose account.role === "ADMIN"
// This is what lets admin capability live inside the main app
// (using the same login every other screen uses) instead of a
// separate page with a typed-in key as the only option.
async function requireAdmin(req, res, next) {
    // Check the session-token path first — a valid Bearer token
    // isn't a short guessable secret (logging in to get one is
    // already rate-limited separately), so a legitimate admin
    // making many requests in a session should never be throttled
    // here.
    const account = await auth.accountFromRequest(req);

    if (account && account.role === "ADMIN") {
        return next();
    }

    // Only the x-admin-key path is actually guessable — one static
    // shared secret with no other protection — so only requests
    // relying on it get rate-limited.
    const limit = await rateLimiter.checkAndRecord({
        key: "admin-key:" + req.ip,
        maxAttempts: 10,
        windowMs: 15 * 60 * 1000
    });
    if (!limit.allowed) {
        return res.status(429).json({ success: false, error: "Too many attempts — try again later" });
    }

    if (req.headers["x-admin-key"] === ADMIN_KEY) {
        return next();
    }

    return res.status(401).json({ success: false, error: "Admin access required" });
}

router.get("/drivers/application-status", async (req, res) => {
    try {
        const phone = String(req.query.phone || "").replace(/[^\d+]/g, "");

        if (!phone) {
            return res.status(400).json({ success: false, error: "phone query param required" });
        }

        const all = await applications.list();
        const mine = all
            .filter(a => a.phone === phone)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            status: mine[0] ? mine[0].status : "NONE"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/drivers/apply", async (req, res) => {
    try {
        const application = await applications.apply(req.body || {});
        res.json({ success: true, application });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.get("/admin/driver-applications", requireAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            applications: await applications.list(req.query.status)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/admin/driver-applications/:id/approve", requireAdmin, async (req, res) => {
    try {
        res.json({ success: true, application: await applications.setStatus(req.params.id, "APPROVED") });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.post("/admin/driver-applications/:id/reject", requireAdmin, async (req, res) => {
    try {
        res.json({ success: true, application: await applications.setStatus(req.params.id, "REJECTED") });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

router.get("/admin/accounts", requireAdmin, async (req, res) => {
    try {
        res.json({ success: true, accounts: await auth.allAccounts() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// ADMIN BOOTSTRAP
// ============================================================
// One-time (or rare) action: promote a logged-in account to the
// ADMIN role. Requires the raw ADMIN_KEY specifically — not just
// an existing admin session — so granting NEW admins always
// requires the key, the same way it always has. Once an account
// is ADMIN, it uses its normal session token for everything else
// above, no key needed day to day.
router.post("/admin/bootstrap", async (req, res) => {
    try {
        // This endpoint always requires the raw key by design (see
        // comment above) — meaning it's always the guessable-secret
        // path, never the session-token exception the other
        // requireAdmin checks make for it.
        const limit = await rateLimiter.checkAndRecord({
            key: "admin-key:" + req.ip,
            maxAttempts: 10,
            windowMs: 15 * 60 * 1000
        });
        if (!limit.allowed) {
            return res.status(429).json({ success: false, error: "Too many attempts — try again later" });
        }

        if (req.headers["x-admin-key"] !== ADMIN_KEY) {
            return res.status(401).json({ success: false, error: "Admin key required" });
        }

        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Log in first, then bootstrap that session" });
        }

        const updated = await auth.setRole(account.id, "ADMIN");
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
