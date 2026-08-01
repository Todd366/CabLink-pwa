const express = require("express");

const app = express();

app.use(express.json());

const engine =
    require("../backend/canonical/ride_engine");

const repository =
    require("../backend/canonical/ride_repository");

console.log(
    "============================================================"
);

console.log(
    "CABLINK — CANONICAL RIDE API"
);

console.log(
    "============================================================"
);


// ============================================================
// HELPERS
// ============================================================

function httpError(
    res,
    status,
    error,
    details = {}
) {

    return res
        .status(status)
        .json({

            success:
                false,

            error,

            ...details

        });

}


// ============================================================
// HEALTH
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success:
                true,

            system:
                "CabLink API",

            status:
                "ONLINE",

            architecture:
                "CANONICAL_RIDE_ENGINE",

            persistence:
                repository.status(),

            time:
                new Date().toISOString()

        });

    }
);


// ============================================================
// CREATE RIDE
// ============================================================

app.post(
    "/api/rides",
    async (req, res) => {

        try {

            const ride =
                await engine.createRide(
                    req.body || {}
                );

            return res
                .status(201)
                .json({

                    success:
                        true,

                    ride

                });

        } catch (error) {

            console.error(
                "CREATE RIDE ERROR:",
                error
            );

            return httpError(
                res,
                500,
                "Failed to create ride",
                {
                    message:
                        error.message
                }
            );

        }

    }
);


// ============================================================
// GET ALL RIDES
// ============================================================

app.get(
    "/api/rides",
    async (req, res) => {

        try {

            const rides =
                await engine.getAllRides();

            return res.json({

                success:
                    true,

                count:
                    rides.length,

                rides

            });

        } catch (error) {

            console.error(
                "GET RIDES ERROR:",
                error
            );

            return httpError(
                res,
                500,
                "Failed to retrieve rides",
                {
                    message:
                        error.message
                }
            );

        }

    }
);


// ============================================================
// GET SINGLE RIDE
// ============================================================

app.get(
    "/api/rides/:id",
    async (req, res) => {

        try {

            const ride =
                await engine.getRide(
                    req.params.id
                );

            if (!ride) {

                return httpError(
                    res,
                    404,
                    "Ride not found"
                );

            }

            return res.json({

                success:
                    true,

                ride

            });

        } catch (error) {

            console.error(
                "GET RIDE ERROR:",
                error
            );

            return httpError(
                res,
                500,
                "Failed to retrieve ride",
                {
                    message:
                        error.message
                }
            );

        }

    }
);


// ============================================================
// TRANSITION RIDE
// ============================================================
//
// PATCH /api/rides/:id/status
//
// Body:
// {
//     "status": "MATCHING"
// }
//
// Optional metadata:
// {
//     "status": "DRIVER_ARRIVED",
//     "driverId": "...",
//     "driverName": "...",
//     "rating": 5,
//     "comment": "..."
// }
//
// ============================================================

app.patch(
    "/api/rides/:id/status",
    async (req, res) => {

        try {

            const {
                status,
                driverId,
                driverName,
                rating,
                comment
            } = req.body || {};

            if (!status) {

                return httpError(
                    res,
                    400,
                    "Ride status is required"
                );

            }

            const result =
                await engine.transition(

                    req.params.id,

                    status,

                    {

                        driverId,

                        driverName,

                        rating,

                        comment

                    }

                );

            if (
                !result.success
            ) {

                if (
                    result.error ===
                    "Ride not found"
                ) {

                    return httpError(
                        res,
                        404,
                        result.error
                    );

                }

                return httpError(
                    res,
                    409,
                    result.error
                );

            }

            return res.json(
                result
            );

        } catch (error) {

            console.error(
                "TRANSITION RIDE ERROR:",
                error
            );

            return httpError(
                res,
                500,
                "Failed to transition ride",
                {
                    message:
                        error.message
                }
            );

        }

    }
);


// ============================================================
// DRIVER ACCEPT RIDE
// ============================================================
//
// POST /api/rides/:id/accept
//
// Body:
// {
//     "driverId": "DRIVER-001",
//     "driverName": "Driver One"
// }
//
// ============================================================

app.post(
    "/api/rides/:id/accept",
    async (req, res) => {

        try {

            const {
                driverId,
                driverName
            } = req.body || {};

            if (!driverId) {

                return httpError(
                    res,
                    400,
                    "Driver ID is required"
                );

            }

            const result =
                await engine.acceptRide(

                    req.params.id,

                    driverId,

                    driverName

                );

            if (
                !result.success
            ) {

                if (
                    result.code ===
                    "NOT_FOUND"
                ) {

                    return httpError(
                        res,
                        404,
                        result.error,
                        {
                            code:
                                result.code
                        }
                    );

                }

                return res
                    .status(409)
                    .json(
                        result
                    );

            }

            return res.json(
                result
            );

        } catch (error) {

            console.error(
                "ACCEPT RIDE ERROR:",
                error
            );

            return httpError(
                res,
                500,
                "Failed to accept ride",
                {
                    message:
                        error.message
                }
            );

        }

    }
);


// ============================================================
// CANONICAL FIRESTORE LIFECYCLE TEST
// ============================================================
//
// This route is a diagnostic verification of the canonical
// application architecture.
//
// It intentionally requires FIRESTORE mode.
//
// The test path is:
//
// HTTP
//   ↓
// canonical engine
//   ↓
// canonical repository
//   ↓
// canonical persistence
//   ↓
// Firestore
//
// ============================================================

app.get(
    "/api/canonical-firestore-lifecycle",
    async (req, res) => {

        const result = {

            success:
                false,

            test:
                "CANONICAL_RIDE_FIRESTORE_LIFECYCLE",

            timestamp:
                new Date().toISOString(),

            architecture:
                "HTTP -> ENGINE -> REPOSITORY -> PERSISTENCE -> FIRESTORE",

            steps: {}

        };


        // ====================================================
        // STEP 1 — VERIFY PERSISTENCE MODE
        // ====================================================

        try {

            const persistence =
                repository.status();

            result.steps.provider = {

                success:
                    persistence.mode ===
                    "FIRESTORE",

                persistence

            };

            if (
                persistence.mode !==
                "FIRESTORE"
            ) {

                result.error =
                    "Canonical persistence mode is not FIRESTORE";

                return res
                    .status(400)
                    .json(result);

            }

        } catch (error) {

            result.steps.provider = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 2 — CREATE
        // ====================================================

        const rideId =
            "O3-CANONICAL-TEST-" +
            Date.now();

        try {

            const created =
                await engine.createRide({

                    id:
                        rideId,

                    pickup:
                        "BSTM HQ",

                    dropoff:
                        "Game City Mall",

                    vehicle:
                        "standard",

                    fare:
                        20,

                    distanceKm:
                        5.2,

                    wallet:
                        null,

                    passenger:
                        "O3-TEST-PASSENGER"

                });

            result.document = {

                id:
                    rideId,

                collection:
                    repository.status()
                        .collection

            };

            result.steps.create = {

                success:
                    Boolean(

                        created &&

                        created.id ===
                        rideId &&

                        created.status ===
                        "REQUESTED"

                    ),

                ride:
                    created

            };

        } catch (error) {

            result.steps.create = {

                success:
                    false,

                name:
                    error.name,

                code:
                    error.code,

                message:
                    error.message,

                stack:
                    error.stack

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 3 — READ AFTER CREATE
        // ====================================================

        try {

            const ride =
                await engine.getRide(
                    rideId
                );

            result.steps.readAfterCreate = {

                success:
                    Boolean(

                        ride &&

                        ride.id ===
                        rideId &&

                        ride.pickup ===
                        "BSTM HQ" &&

                        ride.dropoff ===
                        "Game City Mall" &&

                        Number(
                            ride.fare
                        ) === 20 &&

                        ride.passenger ===
                        "O3-TEST-PASSENGER" &&

                        ride.status ===
                        "REQUESTED"

                    ),

                ride

            };

        } catch (error) {

            result.steps.readAfterCreate = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 4 — REQUESTED -> MATCHING
        // ====================================================

        try {

            const matching =
                await engine.transition(

                    rideId,

                    engine.STATES.MATCHING

                );

            result.steps.transitionToMatching = {

                success:
                    Boolean(

                        matching &&

                        matching.success ===
                        true &&

                        matching.ride &&

                        matching.ride.status ===
                        "MATCHING"

                    ),

                result:
                    matching

            };

        } catch (error) {

            result.steps.transitionToMatching = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 5 — PERSISTENT MATCHING READ
        // ====================================================

        try {

            const ride =
                await engine.getRide(
                    rideId
                );

            result.steps.persistentMatching = {

                success:
                    Boolean(

                        ride &&

                        ride.id ===
                        rideId &&

                        ride.status ===
                        "MATCHING"

                    ),

                ride

            };

        } catch (error) {

            result.steps.persistentMatching = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 6 — FIRST DRIVER ACCEPTS
        // ====================================================

        try {

            const accepted =
                await engine.acceptRide(

                    rideId,

                    "DRIVER-O3-001",

                    "O3 Test Driver One"

                );

            result.steps.firstDriverAccept = {

                success:
                    Boolean(

                        accepted &&

                        accepted.success ===
                        true &&

                        accepted.code ===
                        "ACCEPTED" &&

                        accepted.ride &&

                        accepted.ride.driverId ===
                        "DRIVER-O3-001" &&

                        accepted.ride.status ===
                        "DRIVER_ASSIGNED"

                    ),

                result:
                    accepted

            };

        } catch (error) {

            result.steps.firstDriverAccept = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 7 — PERSISTENT ASSIGNMENT
        // ====================================================

        try {

            const ride =
                await engine.getRide(
                    rideId
                );

            result.steps.persistentAssignment = {

                success:
                    Boolean(

                        ride &&

                        ride.driverId ===
                        "DRIVER-O3-001" &&

                        ride.driverName ===
                        "O3 Test Driver One" &&

                        ride.status ===
                        "DRIVER_ASSIGNED"

                    ),

                ride

            };

        } catch (error) {

            result.steps.persistentAssignment = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 8 — SECOND DRIVER
        // ====================================================

        try {

            const second =
                await engine.acceptRide(

                    rideId,

                    "DRIVER-O3-002",

                    "O3 Test Driver Two"

                );

            result.steps.secondDriverAttempt = {

                success:
                    Boolean(

                        second &&

                        second.success ===
                        false &&

                        second.code ===
                        "ALREADY_ACCEPTED"

                    ),

                result:
                    second

            };

        } catch (error) {

            result.steps.secondDriverAttempt = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // STEP 9 — FINAL PERSISTENCE
        // ====================================================

        try {

            const ride =
                await engine.getRide(
                    rideId
                );

            result.steps.finalPersistence = {

                success:
                    Boolean(

                        ride &&

                        ride.driverId ===
                        "DRIVER-O3-001" &&

                        ride.driverName ===
                        "O3 Test Driver One" &&

                        ride.status ===
                        "DRIVER_ASSIGNED"

                    ),

                ride

            };

        } catch (error) {

            result.steps.finalPersistence = {

                success:
                    false,

                error:
                    error.message

            };

            return res
                .status(500)
                .json(result);

        }


        // ====================================================
        // FINAL
        // ====================================================

        result.success =
            Object.values(
                result.steps
            ).every(
                step =>
                    step.success ===
                    true
            );

        result.overall = {

            provider:
                result.steps.provider.success,

            create:
                result.steps.create.success,

            readAfterCreate:
                result.steps.readAfterCreate.success,

            requestedToMatching:
                result.steps.transitionToMatching.success,

            matchingPersistence:
                result.steps.persistentMatching.success,

            firstDriverAccepted:
                result.steps.firstDriverAccept.success,

            assignmentPersistence:
                result.steps.persistentAssignment.success,

            secondDriverRejected:
                result.steps.secondDriverAttempt.success,

            finalPersistence:
                result.steps.finalPersistence.success,

            final:
                result.success

        };

        result.cleanup = {

            attempted:
                false,

            reason:
                "DELETE_OPERATION_NOT_IMPLEMENTED",

            collection:
                repository.status()
                    .collection,

            documentId:
                rideId

        };

        return res
            .status(
                result.success
                    ? 200
                    : 500
            )
            .json(result);

    }
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
    app;
