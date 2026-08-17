const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const walletResolver = require("../rewards/canonical_wallet_resolver");

const DRIVERS_FILE = path.join(__dirname, "..", "data", "drivers.json");

// ============================================================
// DRIVER WALLET LINKING
//
// This writes directly to backend/data/drivers.json — the same
// file canonical_wallet_resolver.js reads when resolving where
// to send a THB reward. Without a wallet linked here, every
// reward for that driver is skipped, regardless of how the
// rest of the reward pipeline is wired.
// ============================================================

function loadDrivers() {
    if (!fs.existsSync(DRIVERS_FILE)) {
        return { drivers: [] };
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(DRIVERS_FILE, "utf8"));
        return {
            drivers: Array.isArray(parsed.drivers) ? parsed.drivers : []
        };
    } catch (error) {
        throw new Error("Unable to read drivers file: " + error.message);
    }
}

function saveDrivers(data) {
    fs.writeFileSync(DRIVERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/driver/:id/wallet
router.get("/driver/:id/wallet", (req, res) => {
    try {
        const data = loadDrivers();
        const driver = data.drivers.find(d => String(d.id) === req.params.id);

        res.json({
            success: true,
            driverId: req.params.id,
            wallet: driver?.wallet || null
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/driver/:id/wallet
// body: { wallet: "0x..." }
router.post("/driver/:id/wallet", (req, res) => {
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

        const data = loadDrivers();
        const driverId = req.params.id;

        let driver = data.drivers.find(d => String(d.id) === driverId);

        if (!driver) {
            driver = { id: driverId };
            data.drivers.push(driver);
        }

        driver.wallet = validWallet;
        driver.walletLinkedAt = new Date().toISOString();

        saveDrivers(data);

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
