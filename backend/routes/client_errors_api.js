const router = require("express").Router();
const sec = require("../middleware/security");
const svc = require("../services/client_error_service");

// Open to logged-out phones too (login screens can break), but rate limited.
router.post("/client-errors", sec.limit("client-error", 20, 60 * 60 * 1000), async (req, res) => {
    try { await svc.record(req.body || {}, req.account); } catch (e) { /* reporting must never fail loudly */ }
    res.status(202).json({ success: true });
});
router.get("/admin/client-errors", sec.requireAdmin, async (req, res) => {
    try { res.json({ success: true, errors: await svc.latest(50) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load error reports" }); }
});
module.exports = router;
