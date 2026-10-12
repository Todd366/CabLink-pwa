const router = require("express").Router();
const push = require("../services/push_service");
const sec = require("../middleware/security");

router.get("/push/vapid-public-key", (req, res) => {
    if (!push.isConfigured()) {
        return res.status(503).json({ success: false, error: "Push notifications not configured on this server" });
    }
    res.json({ success: true, publicKey: push.publicKey });
});

// Bound to the logged-in account: nobody can subscribe on behalf of someone else.
router.post("/push/subscribe", sec.requireAuth, sec.limit("push-subscribe", 20, 60 * 60 * 1000), async (req, res) => {
    try {
        await push.save({ accountId: req.account.id, subscription: (req.body || {}).subscription });
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
