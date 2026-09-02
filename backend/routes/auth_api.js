const router = require("express").Router();
const auth = require("../services/auth_service");

router.post("/auth/register", async (req, res) => {
    try {
        const account = await auth.register(req.body || {});
        res.json({ success: true, account });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        const result = await auth.login(req.body || {});
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

router.get("/auth/me", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        res.json({ success: true, account });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/auth/profile
// Real profile editing (name, avatar). Requires a valid
// session token. Backend half of the real profile page.
// ============================================================
router.patch("/auth/profile", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const updated = await auth.updateProfile(account.id, req.body || {});
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/auth/pin
// Real PIN change — requires current PIN, same session-token
// auth as the rest of the account. Nothing in the app could
// change a PIN before this; the Profile page only offered name
// editing.
// ============================================================
router.patch("/auth/pin", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const { currentPin, newPin } = req.body || {};
        const updated = await auth.changePin(account.id, currentPin, newPin);
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
