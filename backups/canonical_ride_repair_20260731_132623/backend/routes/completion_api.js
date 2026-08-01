const router = require("express").Router();

const completion =
    require("../services/ride_completion_service");


// ============================================================
// CANONICAL COMPLETION
//
// PATCH /api/rides/:id/complete
//
// This is the primary completion endpoint.
// ============================================================

router.patch(
    "/rides/:id/complete",
    async (req, res) => {

        try {

            const result =
                await completion.completeRideById(
                    req.params.id,
                    req.body || {}
                );

            if (!result.success) {

                if (
                    result.code === "NOT_FOUND"
                ) {

                    return res
                        .status(404)
                        .json(result);

                }

                return res
                    .status(400)
                    .json(result);

            }

            return res
                .status(200)
                .json(result);

        } catch (error) {

            console.error(
                "❌ Canonical ride completion error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    error:
                        "Failed to complete ride"

                });

        }

    }
);


// ============================================================
// LEGACY / COMPATIBILITY COMPLETION
//
// POST /api/ride/complete
//
// Existing tests and older frontend code can still use this.
// Internally it resolves the canonical ride.
// ============================================================

router.post(
    "/ride/complete",
    async (req, res) => {

        try {

            const {
                id,
                driverId,
                driverName
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


            const result =
                await completion.completeRideById(
                    id,
                    {
                        driverId,
                        driverName
                    }
                );


            if (!result.success) {

                if (
                    result.code === "NOT_FOUND"
                ) {

                    return res
                        .status(404)
                        .json(result);

                }

                return res
                    .status(400)
                    .json(result);

            }


            return res.json(result);

        } catch (error) {

            console.error(
                "❌ Legacy completion error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    error:
                        "Failed to complete ride"

                });

        }

    }
);


module.exports = router;
