const router = require("express").Router();
const sec = require("../middleware/security");
const rideEngine = require("../canonical/ride_engine");
const stats = require("../services/community_stats");

router.get("/leaderboard", sec.requireAuth, async (req, res) => {
    try {
        res.json({ success: true, days: 30, drivers: stats.leaderboard(await rideEngine.getAllRides()) });
    } catch (e) { res.status(500).json({ success: false, error: "Failed to load leaderboard" }); }
});
module.exports = router;
