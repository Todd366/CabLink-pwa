const router =
    require("express").Router();

const rewardService =
    require("../services/canonical_reward_service");

const auth =
    require("../services/auth_service");


/*
 * POST /api/rewards/ride/:rideId
 *
 * Canonical backend reward endpoint.
 *
 * The backend ride ID is the only accepted
 * reward identity.
 */

router.post(
    "/ride/:rideId",
    async (req, res) => {

        try {

            const result =
                await rewardService
                    .createRewardForCompletedRide(
                        req.params.rideId
                    );


            /*
             * Successful creation.
             */

            if (
                result.status ===
                "REWARD_CREATED"
            ) {

                return res
                    .status(201)
                    .json(result);

            }


            /*
             * Existing reward is not an error.
             *
             * Exactly-once semantics:
             * repeated requests return the
             * original reward.
             */

            if (
                result.status ===
                "ALREADY_REWARDED"
            ) {

                return res
                    .status(200)
                    .json(result);

            }


            /*
             * Ride does not exist.
             */

            if (
                result.status ===
                "RIDE_NOT_FOUND"
            ) {

                return res
                    .status(404)
                    .json(result);

            }


            /*
             * Ride exists but is not completed.
             */

            if (
                result.status ===
                "RIDE_NOT_COMPLETED"
            ) {

                return res
                    .status(409)
                    .json(result);

            }


            /*
             * Invalid request.
             */

            return res
                .status(400)
                .json(result);

        } catch (error) {

            console.error(

                "❌ Canonical reward error:",

                error

            );

            return res
                .status(500)
                .json({

                    success: false,

                    status:
                        "REWARD_PROCESSING_ERROR",

                    error:
                        "Failed to process canonical ride reward"

                });

        }

    }

);


module.exports =
    router;

// ============================================================
// POST /api/rewards/claim-ride
//
// Real backend for the passenger "Claim 1 THB reward" button —
// see createRideClaimReward in canonical_reward_service.js for why
// the previous client-side contract.transfer() call could never
// actually work. Requires a valid session; the passenger's account
// is taken from the token, never trusted from the request body, so
// nobody can claim a reward on someone else's ride.
// ============================================================
router.post("/claim-ride", async (req, res) => {
    try {
        const account = await auth.accountFromRequest(req);

        if (!account) {
            return res.status(401).json({ success: false, error: "Not logged in" });
        }

        const { rideId } = req.body || {};

        if (!rideId) {
            return res.status(400).json({ success: false, error: "rideId is required" });
        }

        const result = await rewardService.createRideClaimReward({
            rideId,
            passengerAccountId: account.id
        });

        if (!result.success) {
            const statusCode = result.status === "NOT_YOUR_RIDE" ? 403
                : result.status === "RIDE_NOT_ELIGIBLE" ? 409
                : 400;
            return res.status(statusCode).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Ride claim error:", error);
        res.status(500).json({ success: false, error: "Failed to process claim" });
    }
});