const router = require("express").Router();
const sec = require("../middleware/security");
const rideEngine = require("../canonical/ride_engine");
const stats = require("../services/community_stats");
const settlements = require("../services/settlement_service");

// A driver's own balance: fees owed to CabLink, and recent payments.
router.get("/driver/balance", sec.requireRole("APPROVED_DRIVER"), async (req, res) => {
    try {
        const [rides, paid] = await Promise.all([rideEngine.getAllRides(), settlements.all()]);
        const mine = paid.filter(s => s.driverId === req.account.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const b = stats.balances(rides, mine).find(x => x.driverId === req.account.id) || { rides: 0, fees: 0, settled: 0, owed: 0 };
        res.json({ success: true, owed: b.owed, fees: b.fees, settled: b.settled, rides: b.rides, recent: mine.slice(0, 5).map(s => ({ amount: s.amount, note: s.note, createdAt: s.createdAt })) });
    } catch (e) { res.status(500).json({ success: false, error: "Failed to load balance" }); }
});

router.get("/admin/balances", sec.requireAdmin, async (req, res) => {
    try {
        const [rides, paid] = await Promise.all([rideEngine.getAllRides(), settlements.all()]);
        res.json({ success: true, balances: stats.balances(rides, paid) });
    } catch (e) { res.status(500).json({ success: false, error: "Failed to load balances" }); }
});

router.post("/admin/settlements", sec.requireAdmin, async (req, res) => {
    try { res.status(201).json({ success: true, settlement: await settlements.record(req.body || {}, req.account && req.account.id) }); }
    catch (e) { res.status(400).json({ success: false, error: e.message }); }
});

router.get("/admin/metrics", sec.requireAdmin, async (req, res) => {
    try { res.json({ success: true, metrics: stats.metrics(await rideEngine.getAllRides()), hotspots: stats.hotspots(await rideEngine.getAllRides()) }); }
    catch (e) { res.status(500).json({ success: false, error: "Failed to load metrics" }); }
});
module.exports = router;
