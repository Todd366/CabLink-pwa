const router = require("express").Router();

const rideEngine =
    require("../canonical/ride_engine");

const auth =
    require("../services/auth_service");

const rewardService =
    require("../services/canonical_reward_service");

const events =
    require("../services/event_service");

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
            paymentMethod
        } = req.body || {};

        if (!pickup) {
            return res.status(400).json({
                success: false,
                error: "Pickup location is required"
            });
        }

        if (!dropoff) {
            return res.status(400).json({
                success: false,
                error: "Drop-off location is required"
            });
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
                passengerAccountId:
                    callingAccount ? callingAccount.id : null
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


module.exports = router;
