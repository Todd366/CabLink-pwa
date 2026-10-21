// Web push, backed by the account store (durable on Vercel).
// Never throws into callers: a failed notification must never
// break a ride.
let webpush = null;
try { webpush = require("web-push"); } catch (e) { webpush = null; }

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@cablink.app";

let configured = false;
if (webpush && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    configured = true;
} else {
    console.warn("Push notifications disabled — VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set");
}

const auth = () => require("./auth_service");

async function save({ accountId, subscription }) {
    await auth().addPushSubscription(accountId, subscription);
}

async function sendTo(accountId, subs, payload) {
    let sent = 0;
    for (const sub of subs) {
        try {
            await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
            sent += 1;
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                await auth().removePushSubscription(accountId, sub.endpoint).catch(() => {});
            }
        }
    }
    return sent;
}

async function sendToAccount(accountId, payload) {
    if (!configured || !accountId) return { sent: 0, skipped: "not configured" };
    const subs = await auth().getPushSubscriptions(accountId);
    return { sent: await sendTo(accountId, subs, payload) };
}

async function sendToOnlineDrivers(payload) {
    if (!configured) return { sent: 0, skipped: "not configured" };
    const registry = require("./driver_registry_service");
    // 6 hours: backgrounded drivers still get alerts; drivers who forgot to go offline stop after that.
    const drivers = (await registry.all()).filter(d => d.status === "ONLINE" && Date.now() - new Date(d.updatedAt || 0).getTime() < 6 * 3600000);
    let sent = 0;
    for (const d of drivers.slice(0, 50)) sent += (await sendToAccount(d.id, payload)).sent || 0;
    return { sent };
}

module.exports = {
    save, sendToAccount, sendToOnlineDrivers,
    isConfigured: () => configured,
    publicKey: VAPID_PUBLIC_KEY
};
