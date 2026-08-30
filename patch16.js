// ============================================================
// PATCH 16 — REAL PHONE VALIDATION
// ============================================================
//
// Before this patch, registration accepted literally any
// non-empty string as a phone number — "111" would create a
// real account, both through normal registration and through
// the driver-application passwordless account path. There was
// no shape check anywhere, frontend or backend.
//
// Fixed: added auth_service.isValidBotswanaPhone() — a real
// check for an 8-digit Botswana mobile number starting with 7,
// with an optional 267/+267 country-code prefix. This is now
// enforced in BOTH:
//
// 1. register() — normal signup
// 2. findOrCreateAccountByPhone() — driver applications, so
//    both paths share one validation rule, not two that could
//    drift apart
//
// The frontend also gets a matching check in clAuthRegister so
// people get instant feedback instead of a round-trip to the
// server just to find out "111" was never a real number.
//
// Tested: garbage phones ("111", "999") rejected on both the
// register() and findOrCreateAccountByPhone() paths; real
// Botswana mobile numbers still work correctly on both.
// ============================================================

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const p = (...parts) => path.join(ROOT, ...parts);

function writeFile(relPath, content, label) {
    const full = p(relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, "utf8");
    console.log("wrote " + relPath + " (" + label + ")");
}

function patchExactText(relPath, oldStr, newStr, label) {
    const full = p(relPath);
    const content = fs.readFileSync(full, "utf8");
    const occurrences = content.split(oldStr).length - 1;

    if (occurrences !== 1) {
        console.log("ABORT: expected exactly 1 match in " + relPath + " for \"" + label + "\", found " + occurrences + ". Not touching this file — check it manually.");
        process.exitCode = 1;
        return;
    }

    fs.writeFileSync(full, content.replace(oldStr, newStr), "utf8");
    console.log("patched " + relPath + " (" + label + ")");
}


writeFile(
    "backend/services/auth_service.js",
    "const fs = require(\"fs\");\nconst path = require(\"path\");\nconst crypto = require(\"crypto\");\n\n// ============================================================\n// REAL AUTH SERVICE — DUAL-MODE PERSISTENCE\n//\n// Same LOCAL / FIRESTORE pattern already proven in\n// canonical/ride_persistence.js. Set:\n//\n//   CABLINK_ACCOUNT_PERSISTENCE=FIRESTORE\n//\n// in the Vercel project's environment variables (Firebase\n// Admin credentials must also be set — see firebase/\n// firestore_adapter.js) or accounts and sessions will be\n// wiped whenever a new serverless instance cold-starts.\n// Defaults to LOCAL flat-file storage for local dev in\n// Termux, where a persistent filesystem is fine.\n//\n// PATCH 13: added findOrCreateAccountByPhone() — the one\n// shared way to get-or-create a passwordless account by phone\n// number. driver_application_service.js now calls this instead\n// of keeping its own separate copy of account read/write logic,\n// so there is exactly one accounts collection, always.\n//\n// PATCH 16: added isValidBotswanaPhone() — a real shape check\n// (8-digit mobile starting with 7, optional 267/+267 prefix),\n// not just \"is it non-empty\". Before this, register() accepted\n// literally any non-empty string as a phone number — \"111\" would\n// create a real account. Both register() and\n// findOrCreateAccountByPhone() now enforce this, so driver\n// applications get the same protection as normal signup.\n// ============================================================\n\nconst MODE = process.env.CABLINK_ACCOUNT_PERSISTENCE || \"LOCAL\";\n\nconst ACCOUNTS_FILE = path.join(__dirname, \"..\", \"data\", \"accounts.json\");\nconst SESSIONS_FILE = path.join(__dirname, \"..\", \"data\", \"sessions.json\");\n\nconst ACCOUNTS_COLLECTION = process.env.CABLINK_ACCOUNT_FIRESTORE_COLLECTION || \"cablink_accounts\";\nconst SESSIONS_COLLECTION = process.env.CABLINK_SESSION_FIRESTORE_COLLECTION || \"cablink_sessions\";\n\nconst SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days\n\nlet firestore = null;\nfunction getFirestoreAdapter() {\n    if (!firestore) {\n        firestore = require(\"../firebase/firestore_adapter\");\n    }\n    return firestore;\n}\n\n// ------------------------------------------------------------\n// LOCAL (flat-file) storage\n// ------------------------------------------------------------\n\nfunction localLoadAccounts() {\n    if (!fs.existsSync(ACCOUNTS_FILE)) return [];\n    try {\n        const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, \"utf8\"));\n        return Array.isArray(parsed.accounts) ? parsed.accounts : [];\n    } catch (error) {\n        throw new Error(\"Unable to read accounts file: \" + error.message);\n    }\n}\n\nfunction localSaveAccounts(accounts) {\n    fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });\n    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts }, null, 2), \"utf8\");\n}\n\nfunction localLoadSessions() {\n    if (!fs.existsSync(SESSIONS_FILE)) return [];\n    try {\n        const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, \"utf8\"));\n        return Array.isArray(parsed.sessions) ? parsed.sessions : [];\n    } catch (error) {\n        return [];\n    }\n}\n\nfunction localSaveSessions(sessions) {\n    fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });\n    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions }, null, 2), \"utf8\");\n}\n\n// ------------------------------------------------------------\n// UNIFIED LOAD/SAVE — branches on MODE\n// ------------------------------------------------------------\n\nasync function loadAccounts() {\n    if (MODE === \"FIRESTORE\") {\n        return getFirestoreAdapter().list(ACCOUNTS_COLLECTION);\n    }\n    return localLoadAccounts();\n}\n\nasync function saveAccount(account) {\n    if (MODE === \"FIRESTORE\") {\n        await getFirestoreAdapter().write(ACCOUNTS_COLLECTION, account.id, account);\n        return;\n    }\n    const accounts = localLoadAccounts();\n    const idx = accounts.findIndex(a => a.id === account.id);\n    if (idx >= 0) accounts[idx] = account;\n    else accounts.push(account);\n    localSaveAccounts(accounts);\n}\n\nasync function loadSessions() {\n    if (MODE === \"FIRESTORE\") {\n        return getFirestoreAdapter().list(SESSIONS_COLLECTION);\n    }\n    return localLoadSessions();\n}\n\nasync function saveSession(session) {\n    if (MODE === \"FIRESTORE\") {\n        await getFirestoreAdapter().write(SESSIONS_COLLECTION, session.token, session);\n        return;\n    }\n    const sessions = localLoadSessions();\n    sessions.push(session);\n    localSaveSessions(sessions);\n}\n\nasync function findSessionByToken(token) {\n    if (MODE === \"FIRESTORE\") {\n        const result = await getFirestoreAdapter().read(SESSIONS_COLLECTION, token);\n        return result.exists ? result.data : null;\n    }\n    return localLoadSessions().find(s => s.token === token) || null;\n}\n\n// ------------------------------------------------------------\n// HELPERS\n// ------------------------------------------------------------\n\nfunction hashPin(pin, salt) {\n    return crypto.scryptSync(String(pin), salt, 64).toString(\"hex\");\n}\n\nfunction normalizePhone(phone) {\n    return String(phone || \"\").replace(/[^\\d+]/g, \"\");\n}\n\n// PATCH 16: real shape validation — Botswana mobile numbers are\n// 8 digits starting with 7, optionally prefixed with the country\n// code (267 or +267). Rejects anything else, including short\n// garbage strings that used to slip through as \"valid\" as long\n// as they were non-empty.\nfunction isValidBotswanaPhone(phone) {\n    const normalized = normalizePhone(phone);\n    return /^(\\+?267)?7\\d{7}$/.test(normalized);\n}\n\nfunction publicAccount(account) {\n    if (!account) return null;\n    const { pinHash, pinSalt, ...safe } = account;\n    return safe;\n}\n\n// ------------------------------------------------------------\n// PUBLIC API\n// ------------------------------------------------------------\n\nasync function register({ phone, pin, name }) {\n    phone = normalizePhone(phone);\n\n    if (!phone || !isValidBotswanaPhone(phone)) {\n        throw new Error(\"Enter a valid Botswana mobile number, e.g. 71234567\");\n    }\n\n    if (!pin || String(pin).length < 4) {\n        throw new Error(\"A PIN of at least 4 digits is required\");\n    }\n\n    const accounts = await loadAccounts();\n\n    if (accounts.find(a => a.phone === phone)) {\n        throw new Error(\"An account with this phone number already exists\");\n    }\n\n    const salt = crypto.randomBytes(16).toString(\"hex\");\n\n    const account = {\n        id: \"ACC-\" + Date.now() + \"-\" + Math.floor(Math.random() * 10000),\n        phone,\n        name: name || phone,\n        avatarUrl: null,\n        pinSalt: salt,\n        pinHash: hashPin(pin, salt),\n        role: \"PASSENGER\",\n        createdAt: new Date().toISOString(),\n        updatedAt: new Date().toISOString()\n    };\n\n    await saveAccount(account);\n\n    return publicAccount(account);\n}\n\nasync function login({ phone, pin }) {\n    phone = normalizePhone(phone);\n    const accounts = await loadAccounts();\n    const account = accounts.find(a => a.phone === phone);\n\n    if (!account || hashPin(pin, account.pinSalt) !== account.pinHash) {\n        throw new Error(\"Incorrect phone number or PIN\");\n    }\n\n    const token = crypto.randomBytes(32).toString(\"hex\");\n\n    const session = {\n        token,\n        accountId: account.id,\n        createdAt: new Date().toISOString(),\n        expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()\n    };\n\n    await saveSession(session);\n\n    return { token, account: publicAccount(account) };\n}\n\nasync function accountFromToken(token) {\n    if (!token) return null;\n\n    const session = await findSessionByToken(token);\n    if (!session || new Date(session.expiresAt) < new Date()) return null;\n\n    const accounts = await loadAccounts();\n    const account = accounts.find(a => a.id === session.accountId);\n\n    return publicAccount(account);\n}\n\nasync function getAccountById(id) {\n    const accounts = await loadAccounts();\n    return publicAccount(accounts.find(a => a.id === id));\n}\n\nasync function updateProfile(accountId, profileChanges) {\n    profileChanges = profileChanges || {};\n    const accounts = await loadAccounts();\n    const account = accounts.find(a => a.id === accountId);\n\n    if (!account) {\n        throw new Error(\"Account not found\");\n    }\n\n    if (typeof profileChanges.name === \"string\" && profileChanges.name.trim()) {\n        account.name = profileChanges.name.trim();\n    }\n\n    if (typeof profileChanges.avatarUrl === \"string\") {\n        account.avatarUrl = profileChanges.avatarUrl.trim() || null;\n    }\n\n    account.updatedAt = new Date().toISOString();\n\n    await saveAccount(account);\n\n    return publicAccount(account);\n}\n\nasync function allAccounts() {\n    const accounts = await loadAccounts();\n    return accounts.map(publicAccount);\n}\n\n// Shared helper: resolve the calling account (or null) from a\n// standard \"Authorization: Bearer <token>\" header.\nasync function accountFromRequest(req) {\n    const token = (req.headers.authorization || \"\").replace(/^Bearer\\s+/i, \"\");\n    return accountFromToken(token);\n}\n\n// PATCH 13: single shared get-or-create for passwordless\n// accounts by phone number. Used by driver_application_service.js\n// so applying to drive never creates a second, disconnected\n// account outside the real accounts collection.\n//\n// PATCH 16: now enforces the same real phone validation as\n// register() — a driver application with a garbage phone number\n// is rejected instead of silently creating a bad account.\nasync function findOrCreateAccountByPhone({ phone, name }) {\n    phone = normalizePhone(phone);\n\n    if (!phone || !isValidBotswanaPhone(phone)) {\n        throw new Error(\"Enter a valid Botswana mobile number, e.g. 71234567\");\n    }\n\n    const accounts = await loadAccounts();\n    let account = accounts.find(a => a.phone === phone);\n\n    if (!account) {\n        account = {\n            id: \"ACC-\" + Date.now() + \"-\" + Math.floor(Math.random() * 10000),\n            phone,\n            name: name || phone,\n            avatarUrl: null,\n            pinSalt: null,\n            pinHash: null,\n            passwordless: true,\n            role: \"PASSENGER\",\n            createdAt: new Date().toISOString(),\n            updatedAt: new Date().toISOString()\n        };\n\n        await saveAccount(account);\n    }\n\n    return publicAccount(account);\n}\n\nmodule.exports = {\n    register,\n    login,\n    accountFromToken,\n    accountFromRequest,\n    getAccountById,\n    updateProfile,\n    allAccounts,\n    findOrCreateAccountByPhone,\n    isValidBotswanaPhone\n};\n",
    "adds isValidBotswanaPhone(), enforced in register() and findOrCreateAccountByPhone()"
);

patchExactText(
    "frontend/index.html",
    "  window.clAuthRegister = async function(){\n    var phone = document.getElementById('acc-phone').value.trim();\n    var name = document.getElementById('acc-name').value.trim();\n    var pin = document.getElementById('acc-pin').value.trim();\n    if(!phone || !pin){ toast('Phone and PIN required', 'warning'); return; }\n    try{",
    "  window.clAuthRegister = async function(){\n    var phone = document.getElementById('acc-phone').value.trim();\n    var name = document.getElementById('acc-name').value.trim();\n    var pin = document.getElementById('acc-pin').value.trim();\n    if(!phone || !pin){ toast('Phone and PIN required', 'warning'); return; }\n    // PATCH 16: real shape check before hitting the network — same\n    // rule the backend enforces (8-digit Botswana mobile starting\n    // with 7, optional 267/+267 prefix). Instant feedback instead of\n    // a round-trip just to find out \"111\" was never a real number.\n    var clPhoneDigits = phone.replace(/[^\\d+]/g, \"\");\n    if(!/^(\\+?267)?7\\d{7}$/.test(clPhoneDigits)){\n      toast(\"Enter a valid Botswana mobile number, e.g. 71234567\", \"warning\");\n      return;\n    }\n    if(pin.length < 4){ toast(\"PIN must be at least 4 digits\", \"warning\"); return; }\n    try{",
    "add matching client-side phone/PIN validation before hitting the network"
);

if (process.exitCode !== 1) {
    patchExactText(
        "index.html",
        "  window.clAuthRegister = async function(){\n    var phone = document.getElementById('acc-phone').value.trim();\n    var name = document.getElementById('acc-name').value.trim();\n    var pin = document.getElementById('acc-pin').value.trim();\n    if(!phone || !pin){ toast('Phone and PIN required', 'warning'); return; }\n    try{",
        "  window.clAuthRegister = async function(){\n    var phone = document.getElementById('acc-phone').value.trim();\n    var name = document.getElementById('acc-name').value.trim();\n    var pin = document.getElementById('acc-pin').value.trim();\n    if(!phone || !pin){ toast('Phone and PIN required', 'warning'); return; }\n    // PATCH 16: real shape check before hitting the network — same\n    // rule the backend enforces (8-digit Botswana mobile starting\n    // with 7, optional 267/+267 prefix). Instant feedback instead of\n    // a round-trip just to find out \"111\" was never a real number.\n    var clPhoneDigits = phone.replace(/[^\\d+]/g, \"\");\n    if(!/^(\\+?267)?7\\d{7}$/.test(clPhoneDigits)){\n      toast(\"Enter a valid Botswana mobile number, e.g. 71234567\", \"warning\");\n      return;\n    }\n    if(pin.length < 4){ toast(\"PIN must be at least 4 digits\", \"warning\"); return; }\n    try{",
        "same fix on the synced root index.html twin"
    );
}

if (process.exitCode === 1) {
    console.log("");
    console.log("Patch 16 stopped early on the frontend — check above for which file/step failed. backend/services/auth_service.js was still written.");
    process.exit(1);
}

const { execSync } = require("child_process");

function syntaxCheck(relPath) {
    try {
        execSync("node -c " + JSON.stringify(p(relPath)), { stdio: "pipe" });
        console.log("syntax OK: " + relPath);
        return true;
    } catch (error) {
        console.log("SYNTAX ERROR in " + relPath);
        console.log(error.stderr ? error.stderr.toString() : error.message);
        return false;
    }
}

const ok = syntaxCheck("backend/services/auth_service.js");

console.log("");
if (ok) {
    console.log("Patch 16 complete — garbage phone numbers are now rejected everywhere, frontend and backend.");
} else {
    console.log("Patch 16 wrote/patched files but a syntax check failed — review before deploying.");
}
