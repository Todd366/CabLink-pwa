const router = require("express").Router();
const sec = require("../middleware/security");
const rideEngine = require("../canonical/ride_engine");
const ledgerStore = require("../services/ledger_store");
const stats = require("../services/community_stats");
const auth = require("../services/auth_service");

// Everything the Rewards screen needs, from real data only.
router.get("/rewards/mine", sec.requireAuth, async (req, res) => {
    try {
        const me = req.account;
        const [ledger, rides, referral] = await Promise.all([ledgerStore.loadLedger(), rideEngine.getAllRides(), auth.getReferralStats(me.id)]);
        const txs = ledger.transactions || [];
        const summary = stats.rewardSummary(txs, me.id);
        const mineDone = rides.filter(r => r.status === "COMPLETED" && (r.passengerAccountId === me.id || r.driverId === me.id || r.driverAccountId === me.id));
        const claimed = new Set(txs.filter(t => t && t.type === "RIDE_CLAIM").map(t => t.rideId));
        const claimable = me.role === "PASSENGER"
            ? rides.filter(r => r.status === "COMPLETED" && r.passengerAccountId === me.id && !claimed.has(r.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(r => ({ id: r.id, dropoff: r.dropoff, fare: r.fare }))
            : [];
        res.json({
            success: true, hasWallet: Boolean(me.walletAddress), wallet: me.walletAddress ? me.walletAddress.slice(0, 6) + "…" + me.walletAddress.slice(-4) : null,
            ...summary, claimable, ridesDone: mineDone.length, streak: stats.streak(mineDone.map(r => r.completedAt || r.createdAt)),
            referral: { code: me.referralCode || null, invited: referral.totalReferred, bonusesPaid: referral.bonusesPaid, bonusAmount: 0.2 }
        });
    } catch (e) { res.status(500).json({ success: false, error: "Failed to load rewards" }); }
});
module.exports = router;
