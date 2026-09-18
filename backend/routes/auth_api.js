const router = require("express").Router();
const auth = require("../services/auth_service");
const rateLimiter = require("../services/rate_limiter_service");

router.post("/auth/register", async (req, res) => {
    try {
        // Cheap to spam otherwise — 10 accounts per phone number per
        // hour is generous for a real user, restrictive for a script.
        const phone = String((req.body || {}).phone || "").trim();
        if (phone) {
            const limit = await rateLimiter.checkAndRecord({
                key: "register:" + phone,
                maxAttempts: 10,
                windowMs: 60 * 60 * 1000
            });
            if (!limit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Too many attempts — try again in " + limit.retryAfterSeconds + " seconds"
                });
            }
        }
        const account = await auth.register(req.body || {});
        res.json({ success: true, account });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/auth/login", async (req, res) => {
    try {
        // A PIN can be as short as 4 digits — 10,000 combinations,
        // trivially brute-forceable with no protection at all. 5
        // attempts per 15 minutes per phone number is enough for a
        // real person who fat-fingered their PIN twice, nowhere near
        // enough to brute-force it.
        const phone = String((req.body || {}).phone || "").trim();
        if (phone) {
            const limit = await rateLimiter.checkAndRecord({
                key: "login:" + phone,
                maxAttempts: 5,
                windowMs: 15 * 60 * 1000
            });
            if (!limit.allowed) {
                return res.status(429).json({
                    success: false,
                    error: "Too many attempts — try again in " + limit.retryAfterSeconds + " seconds"
                });
            }
        }
        const result = await auth.login(req.body || {});
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

router.get("/auth/me", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        // Real referral counts — computed from actual accounts that
        // registered with this account's code, not a local counter
        // nothing ever incremented.
        const referralStats = await auth.getReferralStats(account.id);

        res.json({ success: true, account: { ...account, referralStats } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/auth/profile
// Real profile editing (name, avatar). Requires a valid
// session token. Backend half of the real profile page.
// ============================================================
router.patch("/auth/profile", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const updated = await auth.updateProfile(account.id, req.body || {});
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/auth/pin
// Real PIN change — requires current PIN, same session-token
// auth as the rest of the account. Nothing in the app could
// change a PIN before this; the Profile page only offered name
// editing.
// ============================================================
router.patch("/auth/pin", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const { currentPin, newPin } = req.body || {};
        const updated = await auth.changePin(account.id, currentPin, newPin);
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ============================================================
// PATCH /api/auth/wallet
// Persists a connected wallet address to the account — the missing
// link that made real THB rewards impossible for passengers.
// connectWallet() on the frontend used to only keep the address in
// local browser state; the backend had no way to know it existed,
// so no server-side payout (referral bonus, ride-claim reward)
// could ever find where to actually send tokens.
// ============================================================
router.patch("/auth/wallet", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const { walletAddress } = req.body || {};
        const updated = await auth.saveWalletAddress(account.id, walletAddress);
        res.json({ success: true, account: updated });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
