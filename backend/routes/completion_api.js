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
    require("../middleware/security").requireAuth,
    async (req, res, next) => {
        const eng = require("../canonical/ride_engine");
        const ride = await eng.getRide(req.params.id);
        if (!ride) return res.status(404).json({ success: false, error: "Ride not found" });
        const a = req.account;
        const mine = ride.driverId === a.id || ride.driverAccountId === a.id;
        if (!mine && a.role !== "ADMIN") {
            return res.status(403).json({ success: false, error: "Only the assigned driver can complete this ride" });
        }
        next();
    },
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

// Legacy unauthenticated completion endpoint removed: it let anyone
// finish any ride and trigger rewards. Use PATCH /api/rides/:id/complete.
router.post("/ride/complete", (req, res) => {
    res.status(410).json({ success: false, error: "This endpoint was retired. Use PATCH /api/rides/:id/complete" });
});

module.exports = router;
