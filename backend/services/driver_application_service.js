// ============================================================
// DRIVER APPLICATION SERVICE — DUAL-MODE PERSISTENCE
//
// PATCH 13: two fixes bundled together, because they're the
// same root cause.
//
// 1. This file used to keep its own private copy of account
//    read/write logic (loadAccounts/saveAccounts/findOrCreateAccount
//    pointing at backend/data/accounts.json) — completely
//    separate from auth_service.js's account storage. In
//    FIRESTORE mode those would be two disconnected sources of
//    truth: a driver applying here could end up with a second,
//    orphaned account instead of the one they registered with
//    in the real app. Now this file calls
//    auth_service.findOrCreateAccountByPhone() instead, so
//    there is exactly one accounts collection, always.
//
// 2. Applications themselves were flat-JSON only, same class of
//    bug as the old auth_service.js — breaks on Vercel's
//    read-only filesystem. Same LOCAL/FIRESTORE dual-mode
//    pattern as everywhere else now. Set:
//
//      CABLINK_APPLICATION_PERSISTENCE=FIRESTORE
//
//    in Vercel's environment variables (same Firebase Admin
//    credentials already configured for the other collections).
//    Defaults to LOCAL flat-file storage for local Termux dev.
// ============================================================

const fs = require("fs");
const path = require("path");
const auth = require("./auth_service");

const MODE = process.env.CABLINK_APPLICATION_PERSISTENCE || "LOCAL";

const APPLICATIONS_FILE = path.join(__dirname, "..", "data", "driver_applications.json");
const APPLICATIONS_COLLECTION = process.env.CABLINK_APPLICATION_FIRESTORE_COLLECTION || "cablink_driver_applications";

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

function localLoadApplications() {
    if (!fs.existsSync(APPLICATIONS_FILE)) return [];
    try {
        const parsed = JSON.parse(fs.readFileSync(APPLICATIONS_FILE, "utf8"));
        return Array.isArray(parsed.applications) ? parsed.applications : [];
    } catch (error) {
        return [];
    }
}

function localSaveApplications(applications) {
    fs.mkdirSync(path.dirname(APPLICATIONS_FILE), { recursive: true });
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify({ applications }, null, 2), "utf8");
}

// ------------------------------------------------------------
// UNIFIED LOAD/SAVE — branches on MODE
// ------------------------------------------------------------

async function loadApplications() {
    if (MODE === "FIRESTORE") {
        return getFirestoreAdapter().list(APPLICATIONS_COLLECTION);
    }
    if (MODE === "SUPABASE") {
        return getSupabaseAdapter().list(APPLICATIONS_COLLECTION);
    }
    return localLoadApplications();
}

async function saveApplication(application) {
    if (MODE === "FIRESTORE") {
        await getFirestoreAdapter().write(APPLICATIONS_COLLECTION, application.id, application);
        return application;
    }
    if (MODE === "SUPABASE") {
        await getSupabaseAdapter().write(APPLICATIONS_COLLECTION, application.id, application);
        return application;
    }

    const applications = localLoadApplications();
    const idx = applications.findIndex(a => a.id === application.id);
    if (idx >= 0) applications[idx] = application;
    else applications.push(application);
    localSaveApplications(applications);
    return application;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function normalizePhone(phone) {
    return String(phone || "").replace(/[^\d+]/g, "");
}

// ------------------------------------------------------------
// PUBLIC API
// ------------------------------------------------------------

async function apply({ name, phone, license, vehicle }) {
    if (!name || !phone || !license || !vehicle) {
        throw new Error("Name, phone, license number, and vehicle are all required");
    }

    // Same accounts collection as real login/registration — no
    // more separate, disconnected copy of account logic here.
    const account = await auth.findOrCreateAccountByPhone({ name, phone });

    const applications = await loadApplications();

    const existing = applications.find(
        app => app.accountId === account.id &&
        (app.status === "PENDING" || app.status === "APPROVED")
    );

    if (existing) {
        return existing;
    }

    const application = {
        id: "APP-" + Date.now(),
        accountId: account.id,
        name,
        phone: normalizePhone(phone),
        license,
        vehicle,
        status: "PENDING",
        createdAt: new Date().toISOString()
    };

    await saveApplication(application);

    return application;
}

async function list(status) {
    const applications = await loadApplications();
    return status
        ? applications.filter(a => a.status === status)
        : applications;
}

async function setStatus(id, status) {
    const applications = await loadApplications();
    const application = applications.find(a => a.id === id);

    if (!application) throw new Error("Application not found");

    application.status = status;
    application.reviewedAt = new Date().toISOString();

    await saveApplication(application);
    return application;
}

async function isApprovedDriver(accountId) {
    const applications = await loadApplications();
    return applications.some(
        a => a.accountId === accountId && a.status === "APPROVED"
    );
}

// Deprecated: kept only in case something still imports this
// directly. Delegates to the real, shared account logic in
// auth_service.js instead of maintaining its own copy.
async function findOrCreateAccount({ name, phone }) {
    return auth.findOrCreateAccountByPhone({ name, phone });
}

module.exports = {
    apply,
    list,
    setStatus,
    isApprovedDriver,
    findOrCreateAccount
};
