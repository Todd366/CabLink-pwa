const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const LEDGER_FILE = path.join(__dirname, "..", "data", "economy_ledger.json");
const ACCOUNTS_FILE = path.join(__dirname, "..", "data", "accounts.json");

function loadJson(file, fallback) {
    if (!fs.existsSync(file)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        return fallback;
    }
}

// GET /api/leaderboard
// Computed from real completed-ride reward transactions, joined
// against real accounts for display names. Previously this was
// five hardcoded names with made-up numbers.
router.get("/leaderboard", (req, res) => {
    const ledger = loadJson(LEDGER_FILE, { transactions: [] });
    const accountsData = loadJson(ACCOUNTS_FILE, { accounts: [] });

    const byDriver = {};

    for (const tx of ledger.transactions || []) {
        if (!tx || tx.type !== "THB_REWARD") continue;

        // Historical ledger records used "driver" and "ride".
        // Canonical records use "driverId" and "rideId".
        // Read both without rewriting historical data.
        const driverId =
            tx.driverId ||
            tx.driver ||
            null;

        if (!driverId) continue;

        if (!byDriver[driverId]) {
            byDriver[driverId] = {
                driverId,
                rides: 0,
                thb: 0
            };
        }

        byDriver[driverId].rides += 1;
        byDriver[driverId].thb += Number(tx.amount) || 0;
    }

    const leaderboard = Object.values(byDriver)
        .map(entry => {
            const account = (accountsData.accounts || [])
                .find(a => String(a.id) === String(entry.driverId));

            return {
                name: account ? account.name : null,
                driverId: entry.driverId,
                rides: entry.rides,
                thb: Math.round(entry.thb * 10) / 10,
                isRealAccount: !!account
            };
        })
        // Only show drivers with a real, registered account — earlier
        // test data left raw generated IDs (e.g. "o840_DRIVER...") with
        // no account behind them, which looked like fake/junk entries.
        .filter(entry => entry.isRealAccount)
        .sort((a, b) => b.thb - a.thb)
        .slice(0, 20);

    res.json({ success: true, leaderboard });
});

module.exports = router;
