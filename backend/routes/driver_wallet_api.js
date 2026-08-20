// ============================================================
// DRIVER WALLET LINKING API
//
// PATCH 13: rewired onto driver_wallet_service.js (persistent
// LOCAL/FIRESTORE dual-mode) instead of writing directly to
// backend/data/drivers.json. Same routes, same response shapes.
//
// See driver_wallet_service.js for an important known gap this
// patch does NOT fix: canonical_wallet_resolver.js still reads
// the old flat drivers.json directly when resolving where to
// send a reward, so it won't see wallets linked here once this
// runs in FIRESTORE mode. Needs its own follow-up fix.
// ============================================================

const router = require("express").Router();
const wallets = require("../services/driver_wallet_service");
const walletResolver = require("../rewards/canonical_wallet_resolver");

// GET /api/driver/:id/wallet
router.get("/driver/:id/wallet", async (req, res) => {
    try {
        const wallet = await wallets.getWallet(req.params.id);

        res.json({
            success: true,
            driverId: req.params.id,
            wallet
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/driver/:id/wallet
// body: { wallet: "0x..." }
router.post("/driver/:id/wallet", async (req, res) => {
    try {
        const { wallet } = req.body || {};

        if (!wallet) {
            return res.status(400).json({
                success: false,
                error: "Wallet address is required"
            });
        }

        const validWallet = walletResolver.validateWallet(wallet);

        if (!validWallet) {
            return res.status(400).json({
                success: false,
                error: "That doesn't look like a valid wallet address. Double-check it and try again."
            });
        }

        const driverId = req.params.id;
        await wallets.setWallet(driverId, validWallet);

        res.json({
            success: true,
            driverId,
            wallet: validWallet
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
