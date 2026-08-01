const engine =
    require("../canonical/ride_engine");

const rewardService =
    require("./canonical_reward_service");

const ledger =
    require("./economy_ledger_service");

const wallet =
    require("../rewards/wallet_service");


// ============================================================
// COMPLETE CANONICAL RIDE
//
// The canonical lifecycle requires:
//
// STARTED → COMPLETED
//
// Completion is therefore NOT allowed from:
//
// MATCHING
// DRIVER_ASSIGNED
// DRIVER_ARRIVED
// PICKED_UP
//
// Those states must transition correctly first.
// ============================================================

async function completeRideById(
    rideId,
    metadata = {}
) {

    if (!rideId) {

        return {

            success: false,

            code:
                "RIDE_ID_REQUIRED",

            error:
                "Ride ID is required"

        };

    }


    const ride =
        engine.getRide(rideId);


    if (!ride) {

        return {

            success: false,

            code:
                "NOT_FOUND",

            error:
                "Ride not found"

        };

    }


    // --------------------------------------------------------
    // Already completed
    // --------------------------------------------------------

    if (
        ride.status ===
        engine.STATES.COMPLETED
    ) {

        return {

            success: true,

            code:
                "ALREADY_COMPLETED",

            ride,

            reward:
                rewardService
                    .getRewardForRide
                    ? rewardService
                        .getRewardForRide(
                            ride.id
                        )
                    : null

        };

    }


    // --------------------------------------------------------
    // Canonical lifecycle enforcement
    // --------------------------------------------------------

    if (
        ride.status !==
        engine.STATES.STARTED
    ) {

        return {

            success: false,

            code:
                "INVALID_COMPLETION_STATE",

            error:
                "Ride must be STARTED before it can be COMPLETED",

            currentStatus:
                ride.status,

            requiredStatus:
                engine.STATES.STARTED

        };

    }


    // --------------------------------------------------------
    // Complete canonical ride
    // --------------------------------------------------------

    const transition =
        engine.transition(

            ride.id,

            engine.STATES.COMPLETED,

            {

                driverId:
                    metadata.driverId !== undefined
                        ? metadata.driverId
                        : ride.driverId,

                driverName:
                    metadata.driverName !== undefined
                        ? metadata.driverName
                        : ride.driverName

            }

        );


    if (!transition.success) {

        return {

            success: false,

            code:
                "CANONICAL_COMPLETION_FAILED",

            error:
                "Canonical completion failed",

            details:
                transition

        };

    }


    const completed =
        transition.ride;


    // --------------------------------------------------------
    // ECONOMY LEDGER
    // --------------------------------------------------------

    try {

        if (
            ledger &&
            typeof ledger.recordRide ===
                "function"
        ) {

            ledger.recordRide(
                completed
            );

        }

    } catch (error) {

        console.error(
            "⚠️ Economy ledger error:",
            error
        );

    }


    // --------------------------------------------------------
    // DRIVER WALLET
    // --------------------------------------------------------

    try {

        if (
            wallet &&
            typeof wallet.add ===
                "function" &&
            completed.driverId
        ) {

            wallet.add(

                completed.driverId,

                1

            );

        }

    } catch (error) {

        console.error(
            "⚠️ Driver wallet error:",
            error
        );

    }


    // --------------------------------------------------------
    // CANONICAL THB REWARD
    // --------------------------------------------------------

    let reward = null;


    try {

        reward =
            rewardService
                .createRewardForCompletedRide(
                    completed.id
                );

    } catch (error) {

        console.error(
            "⚠️ THB reward creation error:",
            error
        );

        return {

            success: false,

            code:
                "REWARD_CREATION_FAILED",

            error:
                "Ride completed but reward creation failed",

            ride:
                completed

        };

    }


    // --------------------------------------------------------
    // FINAL RESPONSE
    // --------------------------------------------------------

    return {

        success: true,

        code:
            "COMPLETED",

        ride:
            completed,

        fare: {

            amount:
                completed.fare,

            currency:
                "BWP"

        },

        reward

    };

}


module.exports = {

    completeRideById

};
