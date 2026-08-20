const canonicalWalletResolver = require("../rewards/canonical_wallet_resolver");
const thbExecutor = require("../blockchain/thb_real_executor");
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

function getRewardForRide(rideId) {

    if (!rideId) return null;

    const ledger = loadLedger();

    return findExistingReward(
        ledger.transactions,
        String(rideId)
    );

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

        amount:
            amount,

        status:
            "PENDING_TRANSFER",

        wallet: await canonicalWalletResolver.resolveWallet(
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

    /*
     * Attempt the actual on-chain transfer.
     *
     * If nothing can be resolved, or the chain call fails,
     * the reward stays on the ledger as FAILED / SKIPPED so
     * it can be retried later. Ride completion itself is
     * never rolled back because of a blockchain failure —
     * the ride happened; the payout can be recovered.
     */

    let executionResult = {
        status: "SKIPPED",
        reason: "No wallet resolved for driver"
    };

    if (reward.wallet && amount > 0) {

        try {

            executionResult =
                await thbExecutor.executeTransfer({
                    wallet: reward.wallet,
                    amount: amount
                });

        } catch (error) {

            executionResult = {
                status: "FAILED",
                reason: error.message || "Unknown executor error"
            };

        }

    }

    reward.status = executionResult.status;
    reward.txHash = executionResult.hash || null;
    reward.executionReason = executionResult.reason || null;

    const persisted = loadLedger();

    const persistedTx =
        findExistingReward(
            persisted.transactions,
            canonicalRideId
        );

    if (persistedTx) {

        persistedTx.status = reward.status;
        persistedTx.txHash = reward.txHash;
        persistedTx.executionReason = reward.executionReason;

    }

    saveLedger(persisted);

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

    createRewardForCompletedRide,

    getRewardForRide

};
