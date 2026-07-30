const express = require("express");

const app = express();

app.use(express.json());

const db =
    require(
        "../backend/production/database_adapter"
    );

const repository =
    require(
        "../backend/canonical/ride_repository_firestore_test"
    );

console.log(
    "============================================================"
);

console.log(
    "CABLINK TEST O.3: CANONICAL RIDE FIRESTORE LIFECYCLE"
);

console.log(
    "============================================================"
);


// ============================================================
// CANONICAL RIDE FIRESTORE LIFECYCLE TEST
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

            steps: {}

        };


        // ====================================================
        // STEP 1 — VERIFY FIRESTORE PROVIDER
        // ====================================================

        try {

            const provider =
                db.provider();

            result.steps.provider = {

                success:
                    provider.type ===
                        "FIRESTORE" &&

                    provider.configured ===
                        true,

                provider:
                    provider

            };

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
        // STEP 2 — CREATE CANONICAL RIDE
        // ====================================================

        const rideId =
            "O3-CANONICAL-TEST-" +
            Date.now();

        const originalRide = {

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
                "O3-TEST-PASSENGER",

            driverId:
                null,

            driverName:
                null,

            status:
                "REQUESTED",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        result.document = {

            collection:
                repository.COLLECTION,

            id:
                rideId

        };


        try {

            const created =
                await repository.create(
                    originalRide
                );

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

        let afterCreate;

        try {

            afterCreate =
                await repository.findById(
                    rideId
                );

            const readMatches =
                afterCreate !== null &&

                afterCreate.id ===
                    rideId &&

                afterCreate.pickup ===
                    "BSTM HQ" &&

                afterCreate.dropoff ===
                    "Game City Mall" &&

                Number(
                    afterCreate.fare
                ) === 20 &&

                afterCreate.passenger ===
                    "O3-TEST-PASSENGER" &&

                afterCreate.status ===
                    "REQUESTED";

            result.steps.readAfterCreate = {

                success:
                    readMatches,

                fieldChecks: {

                    exists:
                        afterCreate !== null,

                    id:
                        afterCreate &&
                        afterCreate.id ===
                            rideId,

                    pickup:
                        afterCreate &&
                        afterCreate.pickup ===
                            "BSTM HQ",

                    dropoff:
                        afterCreate &&
                        afterCreate.dropoff ===
                            "Game City Mall",

                    fare:
                        afterCreate &&
                        Number(
                            afterCreate.fare
                        ) === 20,

                    passenger:
                        afterCreate &&
                        afterCreate.passenger ===
                            "O3-TEST-PASSENGER",

                    status:
                        afterCreate &&
                        afterCreate.status ===
                            "REQUESTED"

                },

                ride:
                    afterCreate

            };

        } catch (error) {

            result.steps.readAfterCreate = {

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
        // STEP 4 — REQUESTED -> MATCHING
        // ====================================================

        let matching;

        try {

            matching =
                await repository.update(
                    rideId,
                    {
                        status:
                            "MATCHING"
                    }
                );

            result.steps.transitionToMatching = {

                success:
                    Boolean(
                        matching &&
                        matching.id ===
                            rideId &&
                        matching.status ===
                            "MATCHING"
                    ),

                ride:
                    matching

            };

        } catch (error) {

            result.steps.transitionToMatching = {

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
        // STEP 5 — PERSISTENT MATCHING READ
        // ====================================================

        let beforeAccept;

        try {

            beforeAccept =
                await repository.findById(
                    rideId
                );

            result.steps.persistentMatching = {

                success:
                    Boolean(
                        beforeAccept &&
                        beforeAccept.id ===
                            rideId &&
                        beforeAccept.status ===
                            "MATCHING"
                    ),

                ride:
                    beforeAccept

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

        let firstAccept;

        try {

            firstAccept =
                await repository.accept(
                    rideId,
                    "DRIVER-O3-001",
                    "O3 Test Driver One"
                );

            result.steps.firstDriverAccept = {

                success:
                    Boolean(
                        firstAccept &&
                        firstAccept.success ===
                            true &&

                        firstAccept.code ===
                            "ACCEPTED" &&

                        firstAccept.ride &&

                        firstAccept.ride.driverId ===
                            "DRIVER-O3-001" &&

                        firstAccept.ride.status ===
                            "DRIVER_ASSIGNED"
                    ),

                result:
                    firstAccept

            };

        } catch (error) {

            result.steps.firstDriverAccept = {

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
        // STEP 7 — READ PERSISTENT ASSIGNMENT
        // ====================================================

        let afterFirstAccept;

        try {

            afterFirstAccept =
                await repository.findById(
                    rideId
                );

            result.steps.persistentAssignment = {

                success:
                    Boolean(
                        afterFirstAccept &&

                        afterFirstAccept.driverId ===
                            "DRIVER-O3-001" &&

                        afterFirstAccept.driverName ===
                            "O3 Test Driver One" &&

                        afterFirstAccept.status ===
                            "DRIVER_ASSIGNED"
                    ),

                fieldChecks: {

                    exists:
                        afterFirstAccept !==
                            null,

                    driverId:
                        afterFirstAccept &&
                        afterFirstAccept.driverId ===
                            "DRIVER-O3-001",

                    driverName:
                        afterFirstAccept &&
                        afterFirstAccept.driverName ===
                            "O3 Test Driver One",

                    status:
                        afterFirstAccept &&
                        afterFirstAccept.status ===
                            "DRIVER_ASSIGNED"

                },

                ride:
                    afterFirstAccept

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
        // STEP 8 — SECOND DRIVER ATTEMPTS ACCEPTANCE
        // ====================================================

        let secondAccept;

        try {

            secondAccept =
                await repository.accept(
                    rideId,
                    "DRIVER-O3-002",
                    "O3 Test Driver Two"
                );

            result.steps.secondDriverAttempt = {

                success:
                    Boolean(
                        secondAccept &&
                        secondAccept.success ===
                            false &&

                        secondAccept.code ===
                            "ALREADY_ACCEPTED"
                    ),

                result:
                    secondAccept

            };

        } catch (error) {

            result.steps.secondDriverAttempt = {

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
        // STEP 9 — FINAL PERSISTENT READ
        // ====================================================

        let finalRide;

        try {

            finalRide =
                await repository.findById(
                    rideId
                );

            result.steps.finalPersistence = {

                success:
                    Boolean(
                        finalRide &&

                        finalRide.driverId ===
                            "DRIVER-O3-001" &&

                        finalRide.driverName ===
                            "O3 Test Driver One" &&

                        finalRide.status ===
                            "DRIVER_ASSIGNED"
                    ),

                ride:
                    finalRide

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
        // FINAL VERIFICATION
        // ====================================================

        const allSteps =
            Object.values(
                result.steps
            );

        result.success =
            allSteps.every(
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


        /*
         * IMPORTANT:
         *
         * This test intentionally does NOT delete the test ride.
         *
         * Current adapter exposes only:
         *
         * write()
         * read()
         *
         * No delete() operation exists.
         *
         * Test rides are isolated using:
         *
         * O3-CANONICAL-TEST-
         *
         * inside:
         *
         * cablink_test_rides
         */

        result.cleanup = {

            attempted:
                false,

            reason:
                "DELETE_OPERATION_NOT_EXPOSED_BY_CURRENT_ADAPTER",

            collection:
                repository.COLLECTION,

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
// HEALTH
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            system:
                "CabLink API",

            status:
                "ONLINE",

            test:
                "CANONICAL_RIDE_FIRESTORE_LIFECYCLE",

            time:
                new Date().toISOString()

        });

    }
);


module.exports =
    app;
