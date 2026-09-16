const engine =
    require("../canonical/ride_engine");

const rewardService =
    require("./canonical_reward_service");

const ledger =
    require("./economy_ledger_service");

const wallet =
    require("../rewards/wallet_service");

const events =
    require("./event_service");

const auth =
    require("./auth_service");


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
        await engine.getRide(rideId);


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
                    ? await rewardService
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
        await engine.transition(

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

            await ledger.recordRide(
                completed
            );

        }

        events.recordEvent("TRIP_COMPLETED", {
            rideId: completed.id,
            driverId: completed.driverId,
            pickup: completed.pickup,
            dropoff: completed.dropoff,
            meta: { fare: completed.fare }
        });

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
            await rewardService
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
    // REFERRAL BONUS
    //
    // If this rider was referred by someone, and this is their
    // first ever COMPLETED ride, and the bonus hasn't already been
    // paid, credit the referrer 0.2 THB. Previously the entire
    // referral system was decorative: a client-side random code,
    // a "referrals" counter nothing ever incremented, and a link to
    // a domain (cablink.io) that isn't even where this app is
    // deployed — so no referral could ever actually be earned. This
    // is real, best-effort: it never blocks or fails ride completion
    // itself if anything here goes wrong.
    // --------------------------------------------------------

    try {

        if (completed.passengerAccountId) {

            const passengerAccount =
                await auth.getAccountById(completed.passengerAccountId);

            if (
                passengerAccount &&
                passengerAccount.referredBy &&
                !passengerAccount.referralBonusPaid
            ) {

                const allRides = await engine.getAllRides();

                const completedRideCount = allRides.filter(
                    r => r.status === "COMPLETED" &&
                        r.passengerAccountId === completed.passengerAccountId
                ).length;

                // This ride itself is already COMPLETED in the data
                // by this point, so "first ever" means exactly one.
                if (completedRideCount === 1) {

                    await rewardService.createReferralBonus({
                        referrerId: passengerAccount.referredBy,
                        referredAccountId: passengerAccount.id
                    });

                    await auth.markReferralBonusPaid(passengerAccount.id);

                }

            }

        }

    } catch (error) {

        console.error(
            "⚠️ Referral bonus error:",
            error
        );

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
