const router = require("express").Router();
const push = require("../services/push_service");

// GET /api/push/vapid-public-key
// Frontend needs this to call pushManager.subscribe()
router.get("/push/vapid-public-key", (req, res) => {
    if (!push.isConfigured()) {
        return res.status(503).json({ success: false, error: "Push notifications not configured on this server" });
    }
    res.json({ success: true, publicKey: push.publicKey });
});

// POST /api/push/subscribe
// body: { accountId, role: 'driver'|'passenger', subscription: <PushSubscription> }
router.post("/push/subscribe", (req, res) => {
    try {
        push.save(req.body || {});
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
