const router = require("express").Router();
const sec = require("../middleware/security");
const rideEngine = require("../canonical/ride_engine");
const stats = require("../services/community_stats");

const guard = sec.requireRole("APPROVED_DRIVER", "ADMIN");
router.get("/driver/demand", guard, async (req, res) => {
    try { res.json({ success: true, ...stats.hotspots(await rideEngine.getAllRides()) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load demand" }); }
});
router.get("/driver/hotspots", guard, async (req, res) => {
    try { res.json({ success: true, ...stats.hotspots(await rideEngine.getAllRides()) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load hotspots" }); }
});
module.exports = router;
