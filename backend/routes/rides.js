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


// ============================================================
// POST /api/rides
// Create new ride
// ============================================================

router.post("/", async (req, res) => {

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
            if (!Number.isFinite(fareNum) || fareNum < 0 || fareNum > 5000) {
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

router.patch("/:id/accept", async (req, res) => {

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

router.get("/mine", async (req, res) => {

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

router.get("/", async (req, res) => {

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

router.get("/:id", async (req, res) => {

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

router.patch("/:id", async (req, res) => {

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

router.patch("/:id/state", async (req,res)=>{

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

router.patch("/:id/rate", async (req, res) => {

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
