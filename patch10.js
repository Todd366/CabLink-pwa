// ============================================================
// PATCH 10 — PHASE 1: IDENTITY HARDENING
// ============================================================
//
// 1. auth_service.js becomes dual-mode (LOCAL flat-file /
//    FIRESTORE), same pattern already proven in
//    canonical/ride_persistence.js.
// 2. Adds auth.updateProfile() — name + avatar editing,
//    the backend half of the real profile page (Phase 2).
// 3. Rides are linked to real accounts: passengerAccountId
//    set on creation, driverAccountId attached on
//    acceptance, and a new GET /api/rides/mine returns real
//    ride history for the logged-in account.
// 4. The dead /api/users route is unmounted and archived —
//    from now on there is exactly one user system.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

function writeFile(relPath, content) {
    const full = p(relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    console.log("✓ wrote " + relPath);
}

function safeReplace(relPath, oldStr, newStr, label) {
    const full = p(relPath);
    if (!fs.existsSync(full)) {
        console.log("✗ MISSING FILE, skipped: " + relPath + " (" + label + ")");
        return false;
    }
    let content = fs.readFileSync(full, "utf8");
    if (!content.includes(oldStr)) {
        console.log("✗ ANCHOR NOT FOUND, skipped: " + relPath + " (" + label + ") — needs manual review");
        return false;
    }
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(full, content, "utf8");
    console.log("✓ patched " + relPath + " (" + label + ")");
    return true;
}

function archiveFile(relPath, archiveDir) {
    const full = p(relPath);
    if (!fs.existsSync(full)) {
        console.log("… skip (already gone): " + relPath);
        return;
    }
    const destDir = p(archiveDir);
    fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, path.basename(relPath));
    fs.renameSync(full, dest);
    console.log("✓ archived " + relPath + " → " + path.relative(ROOT, dest));
}

// ------------------------------------------------------------
// 1. NEW backend/services/auth_service.js — dual-mode
// ------------------------------------------------------------

writeFile("backend/services/auth_service.js", `const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ============================================================
// REAL AUTH SERVICE — DUAL-MODE PERSISTENCE
//
// Same LOCAL / FIRESTORE pattern already proven in
// canonical/ride_persistence.js. Set:
//
//   CABLINK_ACCOUNT_PERSISTENCE=FIRESTORE
//
// in the Vercel project's environment variables (Firebase
// Admin credentials must also be set — see firebase/
// firestore_adapter.js) or accounts and sessions will be
// wiped whenever a new serverless instance cold-starts.
// Defaults to LOCAL flat-file storage for local dev in
// Termux, where a persistent filesystem is fine.
// ============================================================

const MODE = process.env.CABLINK_ACCOUNT_PERSISTENCE || "LOCAL";

const ACCOUNTS_FILE = path.join(__dirname, "..", "data", "accounts.json");
const SESSIONS_FILE = path.join(__dirname, "..", "data", "sessions.json");

const ACCOUNTS_COLLECTION = process.env.CABLINK_ACCOUNT_FIRESTORE_COLLECTION || "cablink_accounts";
const SESSIONS_COLLECTION = process.env.CABLINK_SESSION_FIRESTORE_COLLECTION || "cablink_sessions";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let firestore = null;
function getFirestoreAdapter() {
    if (!firestore) {
        firestore = require("../firebase/firestore_adapter");
    }
    return firestore;
}

// ------------------------------------------------------------
// LOCAL (flat-file) storage
// ------------------------------------------------------------

function localLoadAccounts() {
    if (!fs.existsSync(ACCOUNTS_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
        return Array.isArray(parsed.accounts) ? parsed.accounts : [];
    } catch (error) {
        throw new Error("Unable to read accounts file: " + error.message);
    }
}

function localSaveAccounts(accounts) {
    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts }, null, 2), "utf8");
}

function localLoadSessions() {
    if (!fs.existsSync(SESSIONS_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf8"));
        return Array.isArray(parsed.sessions) ? parsed.sessions : [];
    } catch (error) {
        return [];
    }
}

function localSaveSessions(sessions) {
    fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions }, null, 2), "utf8");
}

// ------------------------------------------------------------
// UNIFIED LOAD/SAVE — branches on MODE
// ------------------------------------------------------------

async function loadAccounts() {
    if (MODE === "FIRESTORE") {
        return getFirestoreAdapter().list(ACCOUNTS_COLLECTION);
    }
    return localLoadAccounts();
}

async function saveAccount(account) {
    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(ACCOUNTS_COLLECTION, account.id, account);
        return;
    }
    const accounts = localLoadAccounts();
    const idx = accounts.findIndex(a => a.id === account.id);
    if (idx >= 0) accounts[idx] = account;
    else accounts.push(account);
    localSaveAccounts(accounts);
}

async function loadSessions() {
    if (MODE === "FIRESTORE") {
        return getFirestoreAdapter().list(SESSIONS_COLLECTION);
    }
    return localLoadSessions();
}

async function saveSession(session) {
    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(SESSIONS_COLLECTION, session.token, session);
        return;
    }
    const sessions = localLoadSessions();
    sessions.push(session);
    localSaveSessions(sessions);
}

async function findSessionByToken(token) {
    if (MODE === "FIRESTORE") {
        const result = await getFirestoreAdapter().read(SESSIONS_COLLECTION, token);
        return result.exists ? result.data : null;
    }
    return localLoadSessions().find(s => s.token === token) || null;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function hashPin(pin, salt) {
    return crypto.scryptSync(String(pin), salt, 64).toString("hex");
}

function normalizePhone(phone) {
    return String(phone || "").replace(/[^\\d+]/g, "");
}

function publicAccount(account) {
    if (!account) return null;
    const { pinHash, pinSalt, ...safe } = account;
    return safe;
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------

async function register({ phone, pin, name }) {
    phone = normalizePhone(phone);

    if (!phone || !pin || String(pin).length < 4) {
        throw new Error("Phone number and a PIN of at least 4 digits are required");
    }

    const accounts = await loadAccounts();

    if (accounts.find(a => a.phone === phone)) {
        throw new Error("An account with this phone number already exists");
    }

    const salt = crypto.randomBytes(16).toString("hex");

    const account = {
        id: "ACC-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
        phone,
        name: name || phone,
        avatarUrl: null,
        pinSalt: salt,
        pinHash: hashPin(pin, salt),
        role: "PASSENGER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await saveAccount(account);

    return publicAccount(account);
}

async function login({ phone, pin }) {
    phone = normalizePhone(phone);
    const accounts = await loadAccounts();
    const account = accounts.find(a => a.phone === phone);

    if (!account || hashPin(pin, account.pinSalt) !== account.pinHash) {
        throw new Error("Incorrect phone number or PIN");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const session = {
        token,
        accountId: account.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
    };

    await saveSession(session);

    return { token, account: publicAccount(account) };
}

async function accountFromToken(token) {
    if (!token) return null;

    const session = await findSessionByToken(token);
    if (!session || new Date(session.expiresAt) < new Date()) return null;

    const accounts = await loadAccounts();
    const account = accounts.find(a => a.id === session.accountId);

    return publicAccount(account);
}

async function getAccountById(id) {
    const accounts = await loadAccounts();
    return publicAccount(accounts.find(a => a.id === id));
}

async function updateProfile(accountId, profileChanges) {
    profileChanges = profileChanges || {};
    const accounts = await loadAccounts();
    const account = accounts.find(a => a.id === accountId);

    if (!account) {
        throw new Error("Account not found");
    }

    if (typeof profileChanges.name === "string" && profileChanges.name.trim()) {
        account.name = profileChanges.name.trim();
    }

    if (typeof profileChanges.avatarUrl === "string") {
        account.avatarUrl = profileChanges.avatarUrl.trim() || null;
    }

    account.updatedAt = new Date().toISOString();

    await saveAccount(account);

    return publicAccount(account);
}

async function allAccounts() {
    const accounts = await loadAccounts();
    return accounts.map(publicAccount);
}

// Shared helper: resolve the calling account (or null) from a
// standard "Authorization: Bearer <token>" header.
async function accountFromRequest(req) {
    const token = (req.headers.authorization || "").replace(/^Bearer\\s+/i, "");
    return accountFromToken(token);
}

module.exports = {
    register,
    login,
    accountFromToken,
    accountFromRequest,
    getAccountById,
    updateProfile,
    allAccounts
};
`);

// ------------------------------------------------------------
// 2. NEW backend/routes/auth_api.js — async + profile endpoint
// ------------------------------------------------------------

writeFile("backend/routes/auth_api.js", `const router = require("express").Router();
const auth = require("../services/auth_service");

router.post("/auth/register", async (req, res) => {
    try {
        const account = await auth.register(req.body || {});
        res.json({ success: true, account });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post("/auth/login", async (req, res) => {
    try {
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

        res.json({ success: true, account });
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

module.exports = router;
`);

// ------------------------------------------------------------
// 3. driver_applications_api.js — await the now-async allAccounts()
// ------------------------------------------------------------

safeReplace(
    "backend/routes/driver_applications_api.js",
    'router.get("/admin/accounts", requireAdmin, (req, res) => {\n    res.json({ success: true, accounts: auth.allAccounts() });\n});',
    'router.get("/admin/accounts", requireAdmin, async (req, res) => {\n    res.json({ success: true, accounts: await auth.allAccounts() });\n});',
    "await allAccounts()"
);

// ------------------------------------------------------------
// 4. ride_engine.js — account linkage fields + attachDriverAccount()
// ------------------------------------------------------------

safeReplace(
    "backend/canonical/ride_engine.js",
    `        driverId:
            null,

        driverName:
            null,`,
    `        driverId:
            null,

        driverName:
            null,

        passengerAccountId:
            data.passengerAccountId ||
            null,

        driverAccountId:
            null,`,
    "account linkage fields on ride object"
);

safeReplace(
    "backend/canonical/ride_engine.js",
    `async function transition(
    id,
    nextState,
    metadata = {}
) {`,
    `async function attachDriverAccount(
    id,
    accountId
) {

    if (!accountId) {
        return null;
    }

    return repository.update(
        id,
        { driverAccountId: accountId }
    );

}

async function transition(
    id,
    nextState,
    metadata = {}
) {`,
    "add attachDriverAccount()"
);

// Find the module.exports block and add the new export. We read
// the file fresh since the two edits above already touched it.
{
    const relPath = "backend/canonical/ride_engine.js";
    const full = p(relPath);
    let content = fs.readFileSync(full, "utf8");
    const exportMarker = "module.exports = {";
    if (content.includes(exportMarker) && !content.includes("attachDriverAccount,") && !content.includes("attachDriverAccount:")) {
        content = content.replace(exportMarker, exportMarker + "\n    attachDriverAccount,");
        fs.writeFileSync(full, content, "utf8");
        console.log("✓ patched " + relPath + " (export attachDriverAccount)");
    } else if (content.includes("attachDriverAccount,")) {
        console.log("… attachDriverAccount already exported, skipped");
    } else {
        console.log("✗ module.exports marker not found in " + relPath + " — export manually if needed");
    }
}

// ------------------------------------------------------------
// 5. rides.js — auth-aware create/accept + GET /mine
// ------------------------------------------------------------

safeReplace(
    "backend/routes/rides.js",
    `const rideEngine =
    require("../canonical/ride_engine");`,
    `const rideEngine =
    require("../canonical/ride_engine");

const auth =
    require("../services/auth_service");`,
    "require auth_service"
);

safeReplace(
    "backend/routes/rides.js",
    `        const ride =
            await rideEngine.createRide({
                pickup,
                dropoff,
                vehicle,
                fare,
                distanceKm,
                wallet,
                notes,
                passenger
            });`,
    `        const callingAccount =
            await auth.accountFromRequest(req);

        const ride =
            await rideEngine.createRide({
                pickup,
                dropoff,
                vehicle,
                fare,
                distanceKm,
                wallet,
                notes,
                passenger,
                passengerAccountId:
                    callingAccount ? callingAccount.id : null
            });`,
    "link passengerAccountId on ride creation"
);

safeReplace(
    "backend/routes/rides.js",
    `        const result =
            await rideEngine.acceptRide(
                req.params.id,
                driverId,
                driverName
            );

        if (!result.success) {`,
    `        const callingDriverAccount =
            await auth.accountFromRequest(req);

        const result =
            await rideEngine.acceptRide(
                req.params.id,
                driverId,
                driverName
            );

        if (result.success && callingDriverAccount) {
            rideEngine
                .attachDriverAccount(req.params.id, callingDriverAccount.id)
                .catch(() => {});
        }

        if (!result.success) {`,
    "attach driverAccountId on successful accept"
);

// Add GET /api/rides/mine right before the existing GET /api/rides (all rides).
safeReplace(
    "backend/routes/rides.js",
    `// ============================================================
// GET /api/rides
// Get all rides
// ============================================================

router.get("/", (req, res) => {`,
    `// ============================================================
// GET /api/rides/mine
// Real ride history for the logged-in account — as passenger
// or as driver. Requires a valid session token.
// ============================================================

router.get("/mine", async (req, res) => {

    try {

        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({
                success: false,
                error: "Not logged in"
            });
        }

        const all = await rideEngine.getAllRides();

        const mine = all.filter(ride =>
            ride.passengerAccountId === account.id ||
            ride.driverAccountId === account.id
        );

        res.json({
            success: true,
            count: mine.length,
            rides: mine
        });

    } catch (error) {

        console.error("❌ Ride history error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to load ride history"
        });

    }

});


// ============================================================
// GET /api/rides
// Get all rides
// ============================================================

router.get("/", (req, res) => {`,
    "add GET /mine ride history route"
);

// ------------------------------------------------------------
// 6. app.js — unmount the dead /api/users route
// ------------------------------------------------------------

safeReplace(
    "backend/server/app.js",
    `const userRoutes =
    require("../routes/users");

`,
    ``,
    "remove dead users require"
);

safeReplace(
    "backend/server/app.js",
    `// ============================================================
// USERS
// ============================================================

app.use(
    "/api/users",
    userRoutes
);


`,
    `// ============================================================
// USERS
// ============================================================
//
// The old /api/users route (routes/users.js) was a dead
// duplicate identity system talking to a separate
// user_repository that nothing else used. Archived. Real
// identity is /api/auth/* only — see auth_service.js.
// ============================================================


`,
    "unmount dead /api/users route"
);

// ------------------------------------------------------------
// 7. Archive the now-truly-dead files
// ------------------------------------------------------------

const archiveDir = "archive/superseded_dead_user_system_" + new Date().toISOString().slice(0, 10).replace(/-/g, "");
archiveFile("backend/routes/users.js", archiveDir);
archiveFile("backend/database/user_repository.js", archiveDir);

console.log("");
console.log("Patch 10 complete — Phase 1 (identity hardening) applied.");
console.log("Next: restart the server and test register/login/me/profile,");
console.log("plus GET /api/rides/mine while logged in.");
