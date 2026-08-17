const fs = require("fs");
const path = require("path");

const APPLICATIONS_FILE = path.join(__dirname, "..", "data", "driver_applications.json");
const ACCOUNTS_FILE = path.join(__dirname, "..", "data", "accounts.json");

function loadApplications() {
    if (!fs.existsSync(APPLICATIONS_FILE)) return { applications: [] };
    try {
        const parsed = JSON.parse(fs.readFileSync(APPLICATIONS_FILE, "utf8"));
        return { applications: Array.isArray(parsed.applications) ? parsed.applications : [] };
    } catch (error) {
        return { applications: [] };
    }
}

function saveApplications(data) {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function loadAccounts() {
    if (!fs.existsSync(ACCOUNTS_FILE)) return { accounts: [] };
    try {
        const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, "utf8"));
        return { accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [] };
    } catch (error) {
        return { accounts: [] };
    }
}

function saveAccounts(data) {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function normalizePhone(phone) {
    return String(phone || "").replace(/[^\d+]/g, "");
}

// Finds an existing account by phone, or creates a lightweight
// passwordless one. A real PIN/login can be added by that person
// later without losing this identity — the phone number is the
// durable key.
function findOrCreateAccount({ name, phone }) {
    phone = normalizePhone(phone);
    const data = loadAccounts();

    let account = data.accounts.find(a => a.phone === phone);

    if (!account) {
        account = {
            id: "ACC-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            phone,
            name: name || phone,
            role: "PASSENGER",
            passwordless: true,
            createdAt: new Date().toISOString()
        };
        data.accounts.push(account);
        saveAccounts(data);
    }

    return account;
}

function apply({ name, phone, license, vehicle }) {
    if (!name || !phone || !license || !vehicle) {
        throw new Error("Name, phone, license number, and vehicle are all required");
    }

    const account = findOrCreateAccount({ name, phone });
    const data = loadApplications();

    const existing = data.applications.find(
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

    data.applications.push(application);
    saveApplications(data);

    return application;
}

function list(status) {
    const data = loadApplications();
    return status
        ? data.applications.filter(a => a.status === status)
        : data.applications;
}

function setStatus(id, status) {
    const data = loadApplications();
    const application = data.applications.find(a => a.id === id);

    if (!application) throw new Error("Application not found");

    application.status = status;
    application.reviewedAt = new Date().toISOString();

    saveApplications(data);
    return application;
}

function isApprovedDriver(accountId) {
    const data = loadApplications();
    return data.applications.some(
        a => a.accountId === accountId && a.status === "APPROVED"
    );
}

module.exports = {
    apply,
    list,
    setStatus,
    isApprovedDriver,
    findOrCreateAccount
};
