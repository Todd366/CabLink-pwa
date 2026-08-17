const router = require("express").Router();
const rideEngine = require("../canonical/ride_engine");

// ============================================================
// DIGITAL MALL (bstm-marketplace-app) INTEGRATION
//
// This lets any other BSTM Ecosystem property — starting with
// the Digital Mall marketplace — hand a delivery task to CabLink
// and have it dispatched through the exact same real driver
// network as a normal passenger ride (same map, same accept
// flow, same THB reward pipeline). It is NOT a separate system —
// a marketplace task IS a canonical ride, just tagged with
// source: "digital_mall" and taskType: "delivery" so the driver
// app and admin panel can show it differently.
//
// AUTH: server-to-server only. Requires a shared secret in the
// x-marketplace-key header, set via MARKETPLACE_API_KEY in .env.
// This is NOT meant to be called from a browser — it's meant to
// be called from the Digital Mall's own backend.
// ============================================================

const MARKETPLACE_API_KEY = process.env.MARKETPLACE_API_KEY || "";

function requireMarketplaceAuth(req, res, next) {
    if (!MARKETPLACE_API_KEY) {
        return res.status(503).json({
            success: false,
            error: "Marketplace integration not configured — set MARKETPLACE_API_KEY in .env"
        });
    }

    if (req.headers["x-marketplace-key"] !== MARKETPLACE_API_KEY) {
        return res.status(401).json({ success: false, error: "Invalid marketplace API key" });
    }

    next();
}

// POST /api/marketplace/tasks
//
// body: {
//   orderId: string          — Digital Mall's own order/reference ID (required)
//   pickup: string            — where the driver collects the item (required)
//   dropoff: string           — where it's delivered (required)
//   itemDescription: string   — what's being delivered
//   customerName: string
//   customerPhone: string
//   fare: number               — BWP amount, in whole units
//   notes: string
// }
//
// Returns the created ride, including its id, which the
// marketplace should store to poll status later.
router.post("/marketplace/tasks", requireMarketplaceAuth, async (req, res) => {
    try {
        const {
            orderId,
            pickup,
            dropoff,
            itemDescription,
            customerName,
            customerPhone,
            fare,
            notes
        } = req.body || {};

        if (!orderId || !pickup || !dropoff) {
            return res.status(400).json({
                success: false,
                error: "orderId, pickup, and dropoff are required"
            });
        }

        const ride = await rideEngine.createRide({
            pickup,
            dropoff,
            fare: fare || 25,
            notes: [itemDescription, notes].filter(Boolean).join(" — "),
            source: "digital_mall",
            taskType: "delivery",
            externalRef: orderId,
            passenger: customerName || "Digital Mall customer",
            passengerName: customerName || null
        });

        res.json({
            success: true,
            ride,
            statusUrl: `/api/marketplace/tasks/${ride.id}/status`
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/marketplace/tasks/:id/status
router.get("/marketplace/tasks/:id/status", requireMarketplaceAuth, async (req, res) => {
    try {
        const ride = await rideEngine.getRide(req.params.id);

        if (!ride) {
            return res.status(404).json({ success: false, error: "Task not found" });
        }

        res.json({
            success: true,
            taskId: ride.id,
            externalRef: ride.externalRef,
            status: ride.status,
            driverName: ride.driverName || null,
            updatedAt: ride.updatedAt
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
