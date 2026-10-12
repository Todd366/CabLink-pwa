import { api } from "./api.js";

const toKey = s => {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
};
export const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// Asks permission (only from a tap), subscribes this phone, and
// binds the subscription to the logged-in account on the server.
// Returns true when alerts are on. Never throws.
export async function enablePush({ ask = true } = {}) {
    try {
        if (!pushSupported() || Notification.permission === "denied") return false;
        if (Notification.permission !== "granted") {
            if (!ask) return false;
            if ((await Notification.requestPermission()) !== "granted") return false;
        }
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            const { publicKey } = await api("/push/vapid-public-key");
            sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey) });
        }
        await api("/push/subscribe", { method: "POST", body: { subscription: sub.toJSON() } });
        return true;
    } catch (e) { return false; }
}
