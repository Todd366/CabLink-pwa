// ============================================================
// MARKETPLACE WEBHOOK SERVICE
//
// Outbound half of the Digital Mall integration. marketplace_api.js
// already lets Digital Mall hand CabLink a task (POST /api/marketplace/tasks)
// and poll its status (GET /api/marketplace/tasks/:id/status) — but
// until now CabLink never told Digital Mall anything back. This
// notifies Digital Mall's own backend the moment a marketplace-
// sourced ride reaches COMPLETED, so it doesn't have to poll forever.
//
// Config (set in Vercel env vars):
//
//   MARKETPLACE_WEBHOOK_URL — Digital Mall's endpoint that receives
//                             completion notifications. If unset,
//                             this is a no-op (logs once, does
//                             nothing) rather than an error — the
//                             marketplace integration already works
//                             fine via polling without this.
//
// Reuses MARKETPLACE_API_KEY (already configured for inbound auth)
// as the outbound shared secret too, sent as x-marketplace-key —
// same header name Digital Mall already sends to CabLink, just in
// the other direction.
//
// IMPORTANT: this must never be allowed to break a real ride
// completion just because Digital Mall's server is slow, down, or
// misconfigured. Every failure is caught and logged, never thrown.
// ============================================================

const WEBHOOK_URL = process.env.MARKETPLACE_WEBHOOK_URL || "";
const MARKETPLACE_API_KEY = process.env.MARKETPLACE_API_KEY || "";

let warnedOnce = false;

async function notifyTaskCompleted(ride) {
    if (!ride || ride.source !== "digital_mall") {
        // Not a marketplace-sourced ride — nothing to notify.
        return;
    }

    if (!WEBHOOK_URL) {
        if (!warnedOnce) {
            console.warn(
                "⚠️ MARKETPLACE_WEBHOOK_URL not set — Digital Mall will not be " +
                "notified of completed tasks (they can still poll " +
                "/api/marketplace/tasks/:id/status)."
            );
            warnedOnce = true;
        }
        return;
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-marketplace-key": MARKETPLACE_API_KEY
            },
            body: JSON.stringify({
                taskId: ride.id,
                externalRef: ride.externalRef || null,
                status: ride.status,
                driverName: ride.driverName || null,
                completedAt: ride.completedAt || null
            })
        });

        if (!response.ok) {
            console.error(
                "❌ Marketplace webhook responded with " + response.status +
                " for task " + ride.id
            );
        }
    } catch (error) {
        // Never let a Digital Mall outage affect a real ride's
        // completion response.
        console.error("❌ Marketplace webhook delivery failed:", error.message);
    }
}

module.exports = {
    notifyTaskCompleted
};
