const router = require("express").Router();
const crypto = require("crypto");
const sec = require("../middleware/security");
const rideEngine = require("../canonical/ride_engine");

// Live trip sharing. The link carries an HMAC of the ride id, so it cannot be
// guessed or edited to look at other rides. It shows no phone numbers, and it
// stops working two hours after the trip ends.
const secret = () => process.env.TRACK_SECRET || process.env.ADMIN_KEY || "";
const token = rideId => crypto.createHmac("sha256", secret()).update(String(rideId)).digest("base64url").slice(0, 24);
const strip = s => String(s || "").replace(/\s*\(-?\d+\.\d+,-?\d+\.\d+\)/, "").replace(/^My location,? ?(near )?/i, "Near ").trim();
const firstName = n => String(n || "").trim().split(/\s+/)[0] || "";

router.post("/rides/:id/share", sec.requireAuth, async (req, res) => {
    try {
        if (secret().length < 16) return res.status(503).json({ success: false, error: "Trip sharing is not set up yet" });
        const ride = await rideEngine.getRide(req.params.id);
        if (!ride || ride.passengerAccountId !== req.account.id) return res.status(404).json({ success: false, error: "Ride not found" });
        res.json({ success: true, path: "/track.html?r=" + encodeURIComponent(ride.id) + "&k=" + token(ride.id) });
    } catch (e) { res.status(500).json({ success: false, error: "Could not create the link" }); }
});

router.get("/track", sec.limit("track", 90, 60 * 1000), async (req, res) => {
    try {
        const id = String(req.query.r || ""), k = String(req.query.k || "");
        if (secret().length < 16 || !sec.safeEqual(k, token(id))) return res.status(404).json({ success: false, error: "This link is not valid" });
        const ride = await rideEngine.getRide(id);
        if (!ride) return res.status(404).json({ success: false, error: "This link is not valid" });
        const ended = ["COMPLETED", "CANCELLED"].includes(ride.status);
        const endedAt = new Date(ride.completedAt || ride.updatedAt || ride.createdAt).getTime();
        if (ended && Date.now() - endedAt > 2 * 3600000) return res.status(410).json({ success: false, error: "This trip has ended" });
        let driverLocation = null;
        if (!ended && (ride.driverAccountId || ride.driverId)) {
            const d = (await require("../services/driver_registry_service").all()).find(x => x.id === (ride.driverAccountId || ride.driverId));
            const lat = d && Number(d.lat ?? d.latitude), lng = d && Number(d.lng ?? d.longitude);
            if (d && Number.isFinite(lat) && Number.isFinite(lng)) driverLocation = { lat, lng, updatedAt: d.updatedAt || null };
        }
        res.json({
            success: true, status: ride.status, ended, rider: firstName(ride.passengerName),
            pickup: strip(ride.pickup), dropoff: strip(ride.dropoff), pickupRaw: ride.pickup, dropoffRaw: ride.dropoff,
            driver: firstName(ride.driverName), vehicle: ride.assignedVehicle ? { makeModel: ride.assignedVehicle.makeModel, plate: ride.assignedVehicle.plate || null } : null,
            driverLocation
        });
    } catch (e) { res.status(500).json({ success: false, error: "Could not load the trip" }); }
});
module.exports = router;
