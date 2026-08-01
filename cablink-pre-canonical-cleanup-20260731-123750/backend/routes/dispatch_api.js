const router =
    require("express").Router();

const dispatch =
    require("../services/dispatch_service");


// ============================================================
// PASSENGER REQUEST
//
// POST /api/dispatch/request
// ============================================================

router.post(
    "/dispatch/request",
    (req, res) => {

        try {

            const request =
                dispatch.createRequest(
                    req.body || {}
                );

            res.status(201).json({

                success: true,

                request

            });

        } catch (error) {

            console.error(
                "❌ Dispatch request error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "Failed to create dispatch request"

            });

        }

    }
);


// ============================================================
// DRIVER REQUEST POLLING
//
// GET /api/dispatch/requests
//
// Driver frontend uses this endpoint.
// ============================================================

router.get(
    "/dispatch/requests",
    (req, res) => {

        try {

            const requests =
                dispatch.list();

            res.json({

                success: true,

                requests

            });

        } catch (error) {

            console.error(
                "❌ Dispatch request polling error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "Failed to load dispatch requests"

            });

        }

    }
);


// ============================================================
// LEGACY LIST ALIAS
//
// GET /api/dispatch/list
// ============================================================

router.get(
    "/dispatch/list",
    (req, res) => {

        try {

            res.json(
                dispatch.list()
            );

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    "Failed to load dispatch list"

            });

        }

    }
);


// ============================================================
// MATCH DRIVERS
//
// POST /api/dispatch/match
// ============================================================

router.post(
    "/dispatch/match",
    (req, res) => {

        try {

            const request =
                dispatch.dispatch(

                    req.body.id,

                    req.body.drivers ||
                        []

                );

            if (!request) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        error:
                            "Dispatch request not found"

                    });

            }

            res.json({

                success: true,

                request

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    "Failed to match drivers"

            });

        }

    }
);


// ============================================================
// DRIVER ACCEPT
//
// POST /api/dispatch/accept
// ============================================================

router.post(
    "/dispatch/accept",
    (req, res) => {

        try {

            const id =
                req.body.id ||
                req.body.rideId;

            const driver =
                req.body.driver ||
                req.body.driverId;


            if (!id) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        error:
                            "Dispatch request ID is required"

                    });

            }


            const request =
                dispatch.accept(

                    id,

                    driver

                );


            if (!request) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        error:
                            "Dispatch request not found"

                    });

            }


            res.json({

                success: true,

                request

            });

        } catch (error) {

            console.error(
                "❌ Dispatch acceptance error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    "Failed to accept dispatch request"

            });

        }

    }
);


module.exports = router;
