const fs = require("fs");
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
//
// PATCH 13: added findOrCreateAccountByPhone() — the one
// shared way to get-or-create a passwordless account by phone
// number. driver_application_service.js now calls this instead
// of keeping its own separate copy of account read/write logic,
// so there is exactly one accounts collection, always.
//
// PATCH 16: added isValidBotswanaPhone() — a real shape check
// (8-digit mobile starting with 7, optional 267/+267 prefix),
// not just "is it non-empty". Before this, register() accepted
// literally any non-empty string as a phone number — "111" would
// create a real account. Both register() and
// findOrCreateAccountByPhone() now enforce this, so driver
// applications get the same protection as normal signup.
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

let supabase = null;
function getSupabaseAdapter() {
    if (!supabase) {
        supabase = require("../supabase/supabase_adapter");
    }
    return supabase;
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
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(ACCOUNTS_COLLECTION);
    }
    return localLoadAccounts();
}

async function saveAccount(account) {
    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(ACCOUNTS_COLLECTION, account.id, account);
        return;
    }
    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(ACCOUNTS_COLLECTION, account.id, account);
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
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(SESSIONS_COLLECTION);
    }
    return localLoadSessions();
}

async function saveSession(session) {
    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(SESSIONS_COLLECTION, session.token, session);
        return;
    }
    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(SESSIONS_COLLECTION, session.token, session);
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
    if (MODE === "SUPABASE") {
        const result = await getSupabaseAdapter().read(SESSIONS_COLLECTION, token);
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
    return String(phone || "").replace(/[^\d+]/g, "");
}

// PATCH 16: real shape validation — Botswana mobile numbers are
// 8 digits starting with 7, optionally prefixed with the country
// code (267 or +267). Rejects anything else, including short
// garbage strings that used to slip through as "valid" as long
// as they were non-empty.
function isValidBotswanaPhone(phone) {
    const normalized = normalizePhone(phone);
    return /^(\+?267)?7\d{7}$/.test(normalized);
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

    if (!phone || !isValidBotswanaPhone(phone)) {
        throw new Error("Enter a valid Botswana mobile number, e.g. 71234567");
    }

    if (!pin || String(pin).length < 4) {
        throw new Error("A PIN of at least 4 digits is required");
    }

    const accounts = await loadAccounts();
    const existing = accounts.find(a => a.phone === phone);

    // An account can already exist here without a PIN — e.g. it was
    // created by findOrCreateAccountByPhone when someone submitted a
    // driver application or booked a ride before ever registering.
    // Previously this always threw "already exists", which meant
    // that person could never log in at all: they had no PIN to log
    // in with, and registering was blocked. Claiming the existing
    // record (same id, same phone) instead preserves their ride and
    // application history rather than creating a disconnected
    // duplicate account.
    if (existing && existing.passwordless) {
        const salt = crypto.randomBytes(16).toString("hex");
        existing.pinSalt = salt;
        existing.pinHash = hashPin(pin, salt);
        existing.passwordless = false;
        if (name) existing.name = name;
        existing.updatedAt = new Date().toISOString();
        await saveAccount(existing);
        return publicAccount(existing);
    }

    if (existing) {
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
        passwordless: false,
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

    if (!account) {
        throw new Error("Incorrect phone number or PIN");
    }

    if (account.passwordless || !account.pinHash) {
        // This account exists (e.g. from a driver application or a
        // ride booked before registering) but has never had a PIN
        // set. hashPin() would crash on a null salt if we tried to
        // verify against it — give a real, actionable message
        // instead of a Node internal error.
        throw new Error("This number has no password set yet — tap 'Create an account' to set a PIN");
    }

    if (hashPin(pin, account.pinSalt) !== account.pinHash) {
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

const VALID_ROLES = ["PASSENGER", "DRIVER_APPLICANT", "APPROVED_DRIVER", "ADMIN"];

async function setRole(accountId, role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error("Invalid role: " + role);
    }

    const accounts = await loadAccounts();
    const account = accounts.find(a => a.id === accountId);

    if (!account) {
        throw new Error("Account not found");
    }

    account.role = role;
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
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    return accountFromToken(token);
}

// PATCH 13: single shared get-or-create for passwordless
// accounts by phone number. Used by driver_application_service.js
// so applying to drive never creates a second, disconnected
// account outside the real accounts collection.
//
// PATCH 16: now enforces the same real phone validation as
// register() — a driver application with a garbage phone number
// is rejected instead of silently creating a bad account.
async function findOrCreateAccountByPhone({ phone, name }) {
    phone = normalizePhone(phone);

    if (!phone || !isValidBotswanaPhone(phone)) {
        throw new Error("Enter a valid Botswana mobile number, e.g. 71234567");
    }

    const accounts = await loadAccounts();
    let account = accounts.find(a => a.phone === phone);

    if (!account) {
        account = {
            id: "ACC-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            phone,
            name: name || phone,
            avatarUrl: null,
            pinSalt: null,
            pinHash: null,
            passwordless: true,
            role: "PASSENGER",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await saveAccount(account);
    }

    return publicAccount(account);
}

module.exports = {
    register,
    login,
    accountFromToken,
    accountFromRequest,
    getAccountById,
    updateProfile,
    setRole,
    allAccounts,
    findOrCreateAccountByPhone,
    isValidBotswanaPhone
};
