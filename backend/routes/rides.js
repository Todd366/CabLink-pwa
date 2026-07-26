const router = require("express").Router();

const rideEngine =
    require("../canonical/ride_engine");

const {
    STATES
} = rideEngine;


// ============================================================
// POST /api/rides
// Create new ride
// ============================================================

router.post("/", (req, res) => {

    try {

        const {
            pickup,
            dropoff,
            vehicle,
            fare,
            distanceKm,
            wallet,
            notes,
            passenger
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

        const ride =
            rideEngine.createRide({
                pickup,
                dropoff,
                vehicle,
                fare,
                distanceKm,
                wallet,
                notes,
                passenger
            });

        // Move ride into matching state.
        const matching =
            rideEngine.transition(
                ride.id,
                STATES.MATCHING
            );

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
// GET /api/rides
// Get all rides
// ============================================================

router.get("/", (req, res) => {

    try {

        const rides =
            rideEngine.getAllRides();

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

router.get("/:id", (req, res) => {

    const ride =
        rideEngine.getRide(
            req.params.id
        );

    if (!ride) {

        return res.status(404).json({
            success: false,
            error: "Ride not found"
        });

    }

    res.json({
        success: true,
        ride
    });

});


// ============================================================
// PATCH /api/rides/:id
// Change ride state / update metadata
// ============================================================

router.patch("/:id", (req, res) => {

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
            rideEngine.transition(
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

module.exports = router;
