const router =
    require("express").Router();

const rewardService =
    require("../services/canonical_reward_service");


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
