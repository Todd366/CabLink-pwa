// ============================================================
// ELOS EVENT SERVICE
//
// Outbound integration into BSTM ELOS (the ecosystem's learning/
// intelligence engine). Fires a RIDE_COMPLETED event the moment a
// ride reaches COMPLETED, mirroring marketplace_webhook_service.js's
// pattern exactly: fire-and-forget, never blocks or fails a real
// ride completion, defaults to working out of the box.
//
// Config (set in Vercel env vars, both optional):
//
//   ELOS_EVENTS_URL — defaults to https://bstm-elos.vercel.app/api/events
//   ELOS_INGEST_KEY — shared secret; ELOS currently fails open without
//                     it (logs a warning), so this works even before
//                     it's set. Set it to actually lock the endpoint down.
//
// IMPORTANT: this must never be allowed to break a real ride
// completion just because ELOS is slow, down, or misconfigured.
// Every failure is caught and logged, never thrown.
// ============================================================

const ELOS_EVENTS_URL = process.env.ELOS_EVENTS_URL || "https://bstm-elos.vercel.app/api/events";
const ELOS_INGEST_KEY = process.env.ELOS_INGEST_KEY || "";

async function notifyRideCompleted(ride) {
    if (!ride) return;

    const headers = { "Content-Type": "application/json" };
    if (ELOS_INGEST_KEY) headers["x-elos-api-key"] = ELOS_INGEST_KEY;

    try {
        const response = await fetch(ELOS_EVENTS_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
                event_type: "RIDE_COMPLETED",
                source: "cablink",
                entity_type: "TRANSACTION",
                entity_id: ride.id,
                data: {
                    fare: ride.fare,
                    distanceKm: ride.distanceKm,
                    vehicle: ride.vehicle,
                    paymentMethod: ride.paymentMethod,
                    taskType: ride.taskType,
                    source: ride.source,
                    driverId: ride.driverId || null,
                    passengerAccountId: ride.passengerAccountId || null,
                    completedAt: ride.completedAt || null,
                },
            }),
        });

        if (!response.ok) {
            console.error("❌ ELOS event delivery responded with " + response.status + " for ride " + ride.id);
        }
    } catch (error) {
        // Never let an ELOS outage affect a real ride's completion response.
        console.error("❌ ELOS event delivery failed:", error.message);
    }
}

module.exports = {
    notifyRideCompleted,
};
