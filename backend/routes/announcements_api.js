const router = require("express").Router();
const sec = require("../middleware/security");
const svc = require("../services/announcement_service");

router.get("/announcements", sec.requireAuth, async (req, res) => {
    try { res.json({ success: true, announcements: svc.visibleTo(req.account.role, await svc.loadAll()) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load announcements" }); }
});

router.get("/admin/announcements", sec.requireAdmin, async (req, res) => {
    try { res.json({ success: true, announcements: (await svc.loadAll()).filter(a => a.active !== false).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load announcements" }); }
});
router.post("/admin/announcements", sec.requireAdmin, async (req, res) => {
    try { res.status(201).json({ success: true, announcement: await svc.create(req.body || {}, req.account && req.account.id) }); }
    catch (e) { res.status(400).json({ success: false, error: e.message }); }
});
router.delete("/admin/announcements/:id", sec.requireAdmin, async (req, res) => {
    try { res.json({ success: true, announcement: await svc.retire(req.params.id) }); }
    catch (e) { res.status(404).json({ success: false, error: e.message }); }
});

module.exports = router;
