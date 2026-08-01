"use strict";

/*
 * CABLINK — CANONICAL RIDE STATE API
 *
 * This route is a compatibility-facing API.
 *
 * It delegates all ride state ownership and mutation to:
 *
 *   ride_state_service
 *        ↓
 *   canonical/ride_compatibility
 *        ↓
 *   canonical/ride_engine
 *        ↓
 *   canonical/ride_repository
 *
 * The route itself owns NO ride state.
 */

const router =
    require("express").Router();

const state =
    require("../services/ride_state_service");


/**
 * Create a canonical ride.
 *
 * POST /ride/create
 */
router.post(
    "/ride/create",
    (req, res) => {

        try {

            const ride =
                state.create(
                    req.body || {}
                );

            return res
                .status(201)
                .json({
                    success: true,
                    ride
                });

        } catch (error) {

            console.error(
                "[CABLINK] Canonical ride creation error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Failed to create ride"
                });

        }

    }
);


/**
 * Transition a canonical ride.
 *
 * POST /ride/status
 *
 * Body:
 *
 * {
 *   "id": "RIDE-...",
 *   "status": "MATCHING"
 * }
 *
 * Optional metadata:
 *
 * {
 *   "driverId": "...",
 *   "driverName": "...",
 *   "rating": 5,
 *   "comment": "..."
 * }
 */
router.post(
    "/ride/status",
    (req, res) => {

        try {

            const {
                id,
                status,
                ...metadata
            } = req.body || {};


            if (!id) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Ride ID is required"
                    });

            }


            if (!status) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Ride status is required"
                    });

            }


            const result =
                state.update(
                    id,
                    status,
                    metadata
                );


            /*
             * Canonical engine explicitly reports
             * transition failures.
             */
            if (
                !result ||
                result.success !== true
            ) {

                const errorMessage =
                    result &&
                    result.error
                        ? result.error
                        : "Ride transition failed";


                /*
                 * Missing ride → 404.
                 */
                if (
                    errorMessage ===
                    "Ride not found"
                ) {

                    return res
                        .status(404)
                        .json({
                            success: false,
                            error:
                                errorMessage
                        });

                }


                /*
                 * Invalid state transition
                 * or other client-side state error.
                 */
                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            errorMessage
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    ride:
                        result.ride
                });

        } catch (error) {

            console.error(
                "[CABLINK] Canonical ride transition error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Failed to transition ride"
                });

        }

    }
);


/**
 * Retrieve one canonical ride.
 *
 * GET /ride/:id/status
 */
router.get(
    "/ride/:id/status",
    (req, res) => {

        try {

            const ride =
                state.get(
                    req.params.id
                );


            if (!ride) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        error:
                            "Ride not found"
                    });

            }


            return res
                .status(200)
                .json({
                    success: true,
                    ride
                });

        } catch (error) {

            console.error(
                "[CABLINK] Canonical ride lookup error:",
                error
            );

            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Failed to load ride"
                });

        }

    }
);


module.exports =
    router;
