const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

const SUBSCRIPTIONS_FILE = path.join(__dirname, "..", "data", "push_subscriptions.json");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@cablink.app";

let configured = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    configured = true;
} else {
    console.warn("⚠️  Push notifications disabled — VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set in .env");
}

function loadSubscriptions() {
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) return { subscriptions: [] };
    try {
        const parsed = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, "utf8"));
        return { subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [] };
    } catch (error) {
        return { subscriptions: [] };
    }
}

function saveSubscriptions(data) {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Save (or replace) a push subscription for a given account/device.
function save({ accountId, role, subscription }) {
    if (!subscription || !subscription.endpoint) {
        throw new Error("Invalid push subscription");
    }

    const data = loadSubscriptions();

    // One active subscription per endpoint — replace if it already exists
    // (e.g. re-subscribing after a permission reset).
    data.subscriptions = data.subscriptions.filter(
        s => s.subscription.endpoint !== subscription.endpoint
    );

    data.subscriptions.push({
        accountId: accountId || null,
        role: role || "unknown",
        subscription,
        savedAt: new Date().toISOString()
    });

    saveSubscriptions(data);
}

async function sendToAccount(accountId, payload) {
    if (!configured) return { sent: 0, skipped: "not configured" };

    const data = loadSubscriptions();
    const targets = data.subscriptions.filter(s => s.accountId === accountId);

    return sendToSubscriptions(targets, payload);
}

async function sendToOnlineDrivers(payload) {
    if (!configured) return { sent: 0, skipped: "not configured" };

    const data = loadSubscriptions();
    const targets = data.subscriptions.filter(s => s.role === "driver");

    return sendToSubscriptions(targets, payload);
}

async function sendToSubscriptions(targets, payload) {
    let sent = 0;
    const stale = [];

    for (const target of targets) {
        try {
            await webpush.sendNotification(target.subscription, JSON.stringify(payload));
            sent += 1;
        } catch (error) {
            // 410/404 means the subscription is dead (uninstalled, expired) — clean it up.
            if (error.statusCode === 410 || error.statusCode === 404) {
                stale.push(target.subscription.endpoint);
            }
        }
    }

    if (stale.length) {
        const data = loadSubscriptions();
        data.subscriptions = data.subscriptions.filter(
            s => !stale.includes(s.subscription.endpoint)
        );
        saveSubscriptions(data);
    }

    return { sent, staleRemoved: stale.length };
}

module.exports = {
    save,
    sendToAccount,
    sendToOnlineDrivers,
    isConfigured: () => configured,
    publicKey: VAPID_PUBLIC_KEY
};
