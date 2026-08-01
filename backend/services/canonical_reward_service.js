const canonicalWalletResolver = require("../rewards/canonical_wallet_resolver");
const fs = require("fs");
const path = require("path");

const rideRepository =
    require("../canonical/ride_repository");

const LEDGER_FILE =
    path.join(
        __dirname,
        "..",
        "data",
        "economy_ledger.json"
    );

function loadLedger() {

    if (!fs.existsSync(LEDGER_FILE)) {

        return {
            rides: [],
            transactions: []
        };

    }

    try {

        const data =
            JSON.parse(
                fs.readFileSync(
                    LEDGER_FILE,
                    "utf8"
                )
            );

        return {

            rides:
                Array.isArray(data.rides)
                    ? data.rides
                    : [],

            transactions:
                Array.isArray(data.transactions)
                    ? data.transactions
                    : []

        };

    } catch (error) {

        throw new Error(
            "Unable to read economy ledger: " +
            error.message
        );

    }

}

function saveLedger(data) {

    fs.writeFileSync(

        LEDGER_FILE,

        JSON.stringify(
            data,
            null,
            2
        ),

        "utf8"

    );

}

function findExistingReward(
    transactions,
    rideId
) {

    return transactions.find(

        transaction =>

            transaction &&
            transaction.type === "THB_REWARD" &&
            String(
                transaction.rideId ||
                transaction.ride
            ) === String(rideId)

    ) || null;

}

async function createRewardForCompletedRide(
    rideId
) {

    /*
     * Canonical identity:
     *
     * backend ride.id
     */

    if (!rideId) {

        return {

            success: false,

            status: "INVALID_REQUEST",

            error:
                "Canonical rideId is required"

        };

    }

    const canonicalRideId =
        String(rideId);


    /*
     * Load canonical ride.
     */

    const ride =
        await rideRepository.findById(
            canonicalRideId
        );


    if (!ride) {

        return {

            success: false,

            status: "RIDE_NOT_FOUND",

            rideId:
                canonicalRideId

        };

    }


    /*
     * Reward eligibility:
     *
     * Only a canonical COMPLETED ride
     * may receive a THB reward.
     */

    if (
        ride.status !== "COMPLETED"
    ) {

        return {

            success: false,

            status: "RIDE_NOT_COMPLETED",

            rideId:
                canonicalRideId,

            rideStatus:
                ride.status

        };

    }


    const ledger =
        loadLedger();


    /*
     * Exactly-once guard.
     *
     * Search by canonical ride ID.
     *
     * This is the authoritative backend
     * duplicate protection.
     */

    const existingReward =
        findExistingReward(

            ledger.transactions,

            canonicalRideId

        );


    if (existingReward) {

        return {

            success: true,

            status: "ALREADY_REWARDED",

            created: false,

            duplicate: true,

            rideId:
                canonicalRideId,

            reward:
                existingReward

        };

    }


    /*
     * Canonical reward calculation.
     *
     * Stage 4 reward policy:
     * 5% of completed ride fare,
     * minimum whole THB unit.
     */

    const fare =
        Number(ride.fare) || 0;

    const amount =
        Math.floor(
            fare * 0.05
        );


    /*
     * Create exactly one reward transaction.
     *
     * IMPORTANT:
     * rideId is the canonical backend ride ID.
     */

    const reward = {

        id:
            "TX-" +
            Date.now(),

        type:
            "THB_REWARD",

        rideId:
            canonicalRideId,

        driverId:
            ride.driverId ||
            null,

        wallet: canonicalWalletResolver.resolveWallet(
      ride.driverId || ride.userId,
      ride.wallet
    )

    };


    /*
     * Persist reward atomically within
     * the current ledger operation.
     */

    ledger.transactions.push(
        reward
    );

    saveLedger(
        ledger
    );


    return {

        success: true,

        status: "REWARD_CREATED",

        created: true,

        duplicate: false,

        rideId:
            canonicalRideId,

        reward

    };

}


module.exports = {

    createRewardForCompletedRide

};
