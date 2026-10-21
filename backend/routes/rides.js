const router = require("express").Router();

const rideEngine =
    require("../canonical/ride_engine");

const auth =
    require("../services/auth_service");

const rewardService =
    require("../services/canonical_reward_service");

const events =
    require("../services/event_service");

const vehicleService =
    require("../services/vehicle_service");

const {
    STATES
} = rideEngine;

const sec = require("../middleware/security");
const { calcFare, splitFare } = require("../pricing/fare");
const geo = require("../geo/geo");
const rules = require("../services/ride_rules");
const rideRelease = require("../services/ride_release");

const STALE_MS = 45 * 60 * 1000;

// A request nobody accepted within 45 minutes is closed automatically,
// so drivers never see ghost requests and riders are never stuck.
async function expireStale(req, res, next) {
    try {
        const ride = await rideEngine.getRide(req.params.id);
        if (ride && ride.status === "MATCHING" && rules.isStale(ride)) {
            await rideEngine.transition(ride.id, "CANCELLED", { reason: "No driver was available" });
        }
    } catch (e) { /* never block the read */ }
    next();
}

const DRIVER_STEPS = ["DRIVER_ARRIVED", "PICKED_UP", "STARTED", "COMPLETED", "CANCELLED"];

// Who may move which ride to which state. Passengers can only
// cancel their own ride; the assigned driver runs the trip;
// admins can do anything. Everyone else is refused.
async function authorizeTransition(req, res, next) {
    try {
        const ride = await rideEngine.getRide(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: "Ride not found" });
        const a = req.account;
        const target = (req.body || {}).status || (req.body || {}).state;
        if (a.role === "ADMIN") return next();
        const isOwner = ride.passengerAccountId === a.id;
        const isDriver = ride.driverId === a.id || ride.driverAccountId === a.id;
        // Only an admin may close a trip once the passenger is in the car.
        if (target === "CANCELLED" && !rules.PRE_PICKUP.includes(ride.status)) {
            return res.status(409).json({ success: false, error: "This trip is already under way. Contact CabLink to close it." });
        }
        if (isOwner && target === "CANCELLED") return next();
        // A driver who backs out before pickup puts the request back to other drivers.
        if (isDriver && target === "CANCELLED" && ["DRIVER_ASSIGNED", "DRIVER_ARRIVED"].includes(ride.status)) {
            const updated = await rideRelease.release(ride, "Your driver cancelled");
            return res.json({ success: true, released: true, ride: updated });
        }
        if (isDriver && DRIVER_STEPS.includes(target)) {
            // never let a client choose who the driver is
            if (req.body) { delete req.body.driverId; delete req.body.driverName; }
            return next();
        }
        return res.status(403).json({ success: false, error: "You cannot change this ride" });
    } catch (e) {
        return res.status(500).json({ success: false, error: "Failed to check ride access" });
    }
}

// Passengers never choose their identity or price.
function bindPassengerAndFare(req, res, next) {
    const b = req.body || {};
    const stops = Array.isArray(b.stops) ? b.stops.filter(x => typeof x === "string" && x.trim()).slice(0, 3) : [];
    const f = calcFare({ vehicle: b.vehicle, distanceKm: b.distanceKm, stops, taskType: b.taskType });
    req.body = Object.assign({}, b, {
        passenger: req.account.id,
        fare: f.total,
        distanceKm: f.distanceKm,
        stops
    });
    next();
}

// What a driver may see about an open request: no phone numbers.
function publicRide(r) {
    return {
        id: r.id, pickup: r.pickup, dropoff: r.dropoff, fare: r.fare,
        distanceKm: r.distanceKm, vehicle: r.vehicle, notes: r.notes,
        paymentMethod: r.paymentMethod, stops: r.stops || [],
        taskType: r.taskType || null, source: r.source || "app", status: r.status, createdAt: r.createdAt,
        driverEarns: splitFare(r.fare, r.taskType).driverEarns
    };
}


// ============================================================
// POST /api/rides
// Create new ride
// ============================================================

async function oneRideAtATime(req, res, next) {
    try {
        const mine = (await rideEngine.getAllRides()).find(r => r.passengerAccountId === req.account.id && rules.isActiveForRider(r));
        if (mine) return res.status(409).json({ success: false, error: "You already have a ride in progress", rideId: mine.id });
    } catch (e) { /* if the check fails, do not block booking */ }
    next();
}

router.post("/", sec.requireAuth, sec.limit("ride-create", 6, 10 * 60 * 1000), oneRideAtATime, bindPassengerAndFare, async (req, res) => {

    try {

        const {
            pickup,
            dropoff,
            vehicle,
            fare,
            distanceKm,
            wallet,
            notes,
            passenger,
            paymentMethod,
            stops,
            taskType
        } = req.body || {};

        if (typeof pickup !== "string" || !pickup.trim()) {
            return res.status(400).json({
                success: false,
                error: "Pickup location is required"
            });
        }

        if (pickup.length > 300) {
            return res.status(400).json({
                success: false,
                error: "Pickup location is too long"
            });
        }

        if (typeof dropoff !== "string" || !dropoff.trim()) {
            return res.status(400).json({
                success: false,
                error: "Drop-off location is required"
            });
        }

        if (dropoff.length > 300) {
            return res.status(400).json({
                success: false,
                error: "Drop-off location is too long"
            });
        }

        // fare arrives as a client-calculated estimate (see
        // updateFareBreakdown() on the frontend) — trusted for the
        // amount itself, since the real charge is cash/mobile-money
        // collected by the driver, not processed through this API.
        // But nothing previously checked it was even a sane number:
        // a negative fare would pass straight through, since
        // ride_engine.js's own fallback (Number(data.fare) || 20)
        // only catches falsy values, and a negative number is
        // truthy. A negative fare here would flow into the driver's
        // reward calculation (a percentage of fare) and could send a
        // negative amount toward a real token transfer.
        if (fare !== undefined && fare !== null) {
            const fareNum = Number(fare);
            if (!Number.isFinite(fareNum) || fareNum < 0 || fareNum > 20000) {
                return res.status(400).json({
                    success: false,
                    error: "Fare must be a reasonable positive amount"
                });
            }
        }

        if (notes !== undefined && notes !== null) {
            if (typeof notes !== "string") {
                return res.status(400).json({
                    success: false,
                    error: "Notes must be text"
                });
            }
            if (notes.length > 500) {
                return res.status(400).json({
                    success: false,
                    error: "Notes are too long"
                });
            }
        }

        const callingAccount =
            await auth.accountFromRequest(req);

        const ride =
            await rideEngine.createRide({
                pickup,
                dropoff,
                vehicle,
                fare,
                distanceKm,
                wallet,
                notes,
                passenger,
                paymentMethod,
                stops:
                    Array.isArray(stops) ? stops.filter(s => typeof s === "string" && s.trim()) : [],
                passengerAccountId:
                    callingAccount ? callingAccount.id : null,
                // Lets a passenger book a delivery from inside the app
                // itself, not just via the Digital Mall's server-to-
                // server webhook (see marketplace_api.js) — same ride
                // engine, same dispatch, same driver network, just
                // tagged so the driver/admin UI can show it as a
                // delivery. Only "delivery" is accepted from a
                // passenger request; any other value is ignored so
                // this can't be used to fake a marketplace-sourced
                // task's source field.
                taskType:
                    taskType === "delivery" ? "delivery" : undefined
            });

        // Move ride into matching state.
        const matching =
            await rideEngine.transition(
                ride.id,
                STATES.MATCHING
            );

        events.recordEvent("RIDE_CREATED", {
            rideId: ride.id,
            pickup: ride.pickup,
            dropoff: ride.dropoff,
            passengerAccountId: ride.passengerAccountId
        });

        res.status(201).json({
            success: true,
            ride:
                matching.success
                    ? matching.ride
                    : ride
        });

    } catch (error) {

        console.error(
            "❌ Ride creation error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to create ride"
        });

    }

});


// ============================================================
// PATCH /api/rides/:id/accept
//
// Canonical driver acceptance endpoint.
//
// Only the first valid acceptance of a MATCHING ride wins.
// A second acceptance returns HTTP 409.
// ============================================================

async function oneJobAtATime(req, res, next) {
    try {
        const all = await rideEngine.getAllRides();
        if (all.find(r => (r.driverId === req.account.id || r.driverAccountId === req.account.id) && rules.isActiveForDriver(r))) {
            return res.status(409).json({ success: false, error: "Finish your current trip before taking another" });
        }
        if (process.env.REQUIRE_VERIFIED_VEHICLE !== "false") {
            const veh = await require("../services/vehicle_service").getVehicleByAccountId(req.account.id);
            if (!veh || veh.verificationStatus !== "VERIFIED") {
                return res.status(403).json({ success: false, error: "Your vehicle has not been verified yet. CabLink will contact you." });
            }
        }
        const target = all.find(r => r.id === req.params.id);
        if (target && (target.declinedBy || []).includes(req.account.id)) {
            return res.status(409).json({ success: false, error: "You cancelled this ride earlier" });
        }
    } catch (e) { /* never block on a failed check */ }
    next();
}

router.patch("/:id/accept", sec.requireRole("APPROVED_DRIVER"), oneJobAtATime, (req, res, next) => {
    req.body = Object.assign({}, req.body, { driverId: req.account.id, driverName: req.account.name });
    next();
}, async (req, res) => {

    try {

        const {
            driverId,
            driverName
        } = req.body || {};

        if (!driverId) {

            return res.status(400).json({
                success: false,
                error: "Driver ID is required"
            });
        }

        const callingDriverAccount =
            await auth.accountFromRequest(req);

        const result =
            await rideEngine.acceptRide(
                req.params.id,
                driverId,
                driverName
            );

        if (result.success && callingDriverAccount) {
            rideEngine
                .attachDriverAccount(req.params.id, callingDriverAccount.id)
                .catch(() => {});

            // Best-effort: attach the driver's real, admin-verified
            // vehicle to the ride so the passenger sees what they're
            // actually getting into. A driver with no vehicle record
            // yet (or a lookup failure) should never block acceptance.
            vehicleService
                .getVehicleByAccountId(callingDriverAccount.id)
                .then(vehicle => {
                    const snapshot = vehicleService.toRideSnapshot(vehicle);
                    if (snapshot) {
                        return rideEngine.attachDriverVehicle(req.params.id, snapshot);
                    }
                })
                .catch(() => {});
        }

        if (result.success) {
            events.recordEvent("DRIVER_ASSIGNED", {
                rideId: req.params.id,
                driverId
            });
        }

        if (!result.success) {

            if (result.code === "NOT_FOUND") {

                return res.status(404).json(
                    result
                );
            }

            if (
                result.code ===
                "ALREADY_ACCEPTED"
            ) {

                return res.status(409).json(
                    result
                );
            }

            return res.status(400).json(
                result
            );
        }

        return res.status(200).json(
            result
        );

    } catch (error) {

        console.error(
            "❌ Ride acceptance error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Failed to accept ride"
        });
    }
});


// ============================================================
// GET /api/rides/mine
// Real ride history for the logged-in account — as passenger
// or as driver. Requires a valid session token.
// ============================================================

router.get("/open", sec.requireRole("APPROVED_DRIVER", "ADMIN"), async (req, res) => {
    try {
        const all = await rideEngine.getAllRides();
        // Housekeeping: close requests nobody took (max 20 per call).
        for (const old of all.filter(r => r.status === "MATCHING" && rules.isStale(r)).slice(0, 20)) {
            rideEngine.transition(old.id, "CANCELLED", { reason: "No driver was available" }).catch(() => {});
        }
        for (const noShow of all.filter(r => rules.isNoShow(r)).slice(0, 10)) {
            rideRelease.release(noShow, "Your driver did not arrive in time").catch(() => {});
        }
        let open = all.filter(r => rules.isOpenForDrivers(r) && !(r.declinedBy || []).includes(req.account.id));
        // Nearest first: distance from this driver's last known position to each pickup.
        const registry = require("../services/driver_registry_service");
        const mine = (await registry.all()).find(d => d.id === req.account.id);
        const here = mine && Number.isFinite(Number(mine.lat ?? mine.latitude)) ? { lat: Number(mine.lat ?? mine.latitude), lng: Number(mine.lng ?? mine.longitude) } : null;
        open = open.map(r => {
            const p = geo.coordsFromLabel(r.pickup);
            const km = here && p ? Math.round(geo.haversineKm(here, p) * 10) / 10 : null;
            return Object.assign(publicRide(r), { pickupKm: km });
        }).sort((a, b) => (a.pickupKm ?? 1e9) - (b.pickupKm ?? 1e9));
        res.json({ success: true, count: open.length, rides: open });
    } catch (e) {
        res.status(500).json({ success: false, error: "Failed to load requests" });
    }
});

router.get("/mine", sec.requireAuth, async (req, res) => {

    try {

        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({
                success: false,
                error: "Not logged in"
            });
        }

        const all = await rideEngine.getAllRides();

        const mine = all.filter(ride =>
            ride.passengerAccountId === account.id ||
            ride.driverAccountId === account.id
        );

        res.json({
            success: true,
            count: mine.length,
            rides: mine
        });

    } catch (error) {

        console.error("❌ Ride history error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to load ride history"
        });

    }

});


// ============================================================
// GET /api/rides
// Get all rides
// ============================================================

router.get("/", sec.requireAdmin, async (req, res) => {

    try {

        const rides =
            await rideEngine.getAllRides();

        res.json({
            success: true,
            count: rides.length,
            rides
        });

    } catch (error) {

        console.error(
            "❌ Ride list error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to load rides"
        });

    }

});


// ============================================================
// GET /api/rides/:id
// Get one ride
// ============================================================

// Phone number of the other person on an ACTIVE trip only —
// so riders and drivers can call each other, but numbers are
// never exposed on open requests or finished trips.
// Where the assigned driver is right now. Only the passenger or the driver
// of an ACTIVE trip can ask; nobody can browse driver locations.
router.get("/:id/driver-location", sec.requireAuth, async (req, res) => {
    try {
        const ride = await rideEngine.getRide(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: "Ride not found" });
        const me = req.account;
        const involved = ride.passengerAccountId === me.id || ride.driverId === me.id || ride.driverAccountId === me.id;
        const live = ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"].includes(ride.status);
        if (!involved || !live) return res.status(403).json({ success: false, error: "Not available" });
        const registry = require("../services/driver_registry_service");
        const id = ride.driverAccountId || ride.driverId;
        const d = (await registry.all()).find(x => x.id === id);
        const lat = d && Number(d.lat ?? d.latitude), lng = d && Number(d.lng ?? d.longitude);
        if (!d || !Number.isFinite(lat) || !Number.isFinite(lng)) return res.json({ success: true, location: null });
        res.json({ success: true, location: { lat, lng, updatedAt: d.updatedAt || d.lastSeen || null } });
    } catch (e) {
        res.status(500).json({ success: false, error: "Failed to load location" });
    }
});

// How to pay the driver by mobile money (Orange Money / MyZaka / Smega).
router.get("/:id/payment", sec.requireAuth, async (req, res) => {
    try {
        const ride = await rideEngine.getRide(req.params.id);
        if (!ride || ride.passengerAccountId !== req.account.id) return res.status(404).json({ success: false, error: "Ride not found" });
        if (ride.paymentMethod !== "mobile_money") return res.json({ success: true, method: ride.paymentMethod });
        const number = await auth.getPayoutNumber(ride.driverAccountId || ride.driverId);
        res.json({ success: true, method: "mobile_money", driverName: ride.driverName || null, number });
    } catch (e) {
        res.status(500).json({ success: false, error: "Failed to load payment details" });
    }
});

router.get("/:id/contact", sec.requireAuth, async (req, res) => {
    try {
        const ride = await rideEngine.getRide(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: "Ride not found" });
        const me = req.account;
        const live = ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"].includes(ride.status);
        if (!live) return res.status(409).json({ success: false, error: "This trip is not active" });
        const isDriver = ride.driverId === me.id || ride.driverAccountId === me.id;
        if (isDriver && !ride.passengerAccountId && ride.customerPhone) {
            return res.json({ success: true, name: ride.passengerName || "Customer", phone: ride.customerPhone });
        }
        let otherId = null;
        if (ride.passengerAccountId === me.id) otherId = ride.driverAccountId || ride.driverId;
        else if (ride.driverId === me.id || ride.driverAccountId === me.id) otherId = ride.passengerAccountId;
        if (!otherId) return res.status(403).json({ success: false, error: "You cannot contact this person" });
        const other = await auth.getAccountById(otherId);
        if (!other) return res.status(404).json({ success: false, error: "Contact not found" });
        res.json({ success: true, name: other.name, phone: other.phone });
    } catch (e) {
        res.status(500).json({ success: false, error: "Failed to load contact" });
    }
});

router.get("/:id", sec.requireAuth, expireStale, async (req, res) => {

    const ride =
        await rideEngine.getRide(
            req.params.id
        );

    if (!ride) {

        return res.status(404).json({
            success: false,
            error: "Ride not found"
        });

    }

    const me = req.account;
    const involved = me.role === "ADMIN" || ride.passengerAccountId === me.id ||
        ride.driverId === me.id || ride.driverAccountId === me.id;
    if (!involved) {
        if (me.role === "APPROVED_DRIVER" && ride.status === "MATCHING") {
            return res.json({ success: true, ride: publicRide(ride) });
        }
        return res.status(403).json({ success: false, error: "You cannot view this ride" });
    }

    const reward =
        ride.status === STATES.COMPLETED
            ? await rewardService.getRewardForRide(ride.id)
            : null;

    res.json({
        success: true,
        ride: { ...ride, reward }
    });

});


// ============================================================
// PATCH /api/rides/:id
// Change ride state / update metadata
// ============================================================

router.patch("/:id", sec.requireAuth, authorizeTransition, async (req, res) => {

    try {

        const {
            status,
            driverId,
            driverName,
            rating,
            comment
        } = req.body || {};

        if (!status) {

            return res.status(400).json({
                success: false,
                error: "Ride status is required"
            });

        }

        const result =
            await rideEngine.transition(
                req.params.id,
                status,
                {
                    driverId,
                    driverName,
                    rating,
                    comment
                }
            );

        if (!result.success) {

            return res.status(400).json(
                result
            );

        }

        res.json(result);

    } catch (error) {

        console.error(
            "❌ Ride update error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to update ride"
        });

    }

});


// ============================================================
// EXPORT
// ============================================================



// ============================================================
// PATCH /api/rides/:id/state
//
// Canonical lifecycle transition bridge
// ============================================================

router.patch("/:id/state", sec.requireAuth, authorizeTransition, async (req,res)=>{

    try {

        const { state } = req.body || {};

        if(!state){

            return res.status(400).json({
                success:false,
                error:"State required"
            });

        }

        const result =
            await rideEngine.transition(
                req.params.id,
                state
            );

        return res.json(result);

    } catch(error){

        console.error(
            "State transition error:",
            error
        );

        return res.status(500).json({
            success:false,
            error:"Failed state transition"
        });

    }

});


// ============================================================
// PATCH /api/rides/:id/rate — passenger rates a completed ride.
// Real backend record now — this used to be a client-side-only
// array update that never left the browser.
// ============================================================

router.patch("/:id/rate", sec.requireAuth, async (req, res, next) => {
    const ride = await rideEngine.getRide(req.params.id);
    if (!ride) return res.status(404).json({ success: false, error: "Ride not found" });
    if (ride.passengerAccountId !== req.account.id) {
        return res.status(403).json({ success: false, error: "Only the passenger can rate this ride" });
    }
    next();
}, async (req, res) => {

    try {

        const { rating, comment } = req.body || {};

        const result =
            await rideEngine.rateRide(
                req.params.id,
                rating,
                comment
            );

        if (!result.success) {
            const status = result.code === "NOT_FOUND" ? 404 : 400;
            return res.status(status).json(result);
        }

        events.recordEvent("RIDE_RATED", {
            rideId: req.params.id,
            driverId: result.ride.driverId,
            meta: { rating: result.ride.rating }
        });

        res.json(result);

    } catch (error) {

        console.error("Ride rating error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to submit rating"
        });

    }

});


module.exports = router;
