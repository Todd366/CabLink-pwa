const canonicalWalletResolver = require("../rewards/canonical_wallet_resolver");
const thbExecutor = require("../blockchain/thb_real_executor");
const auth = require("./auth_service");
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

const ledgerStore = require("./ledger_store");

// loadLedger()/saveLedger() now delegate to the shared ledger_store
// (see backend/services/ledger_store.js) instead of maintaining a
// second, independent flat-file reader of the same file that
// economy_ledger_service.js also reads/writes. Converted to async
// since the Supabase-backed store is async; every call site below
// (5 of them) is updated to await accordingly.

async function loadLedger() {
    return ledgerStore.loadLedger();
}

async function saveLedger(data) {
    return ledgerStore.saveLedger(data);
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

async function getRewardForRide(rideId) {

    if (!rideId) return null;

    const ledger = await loadLedger();

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
        await loadLedger();


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

    await saveLedger(
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

    const persisted = await loadLedger();

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

    await saveLedger(persisted);

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


// Prefers the real wallet address saved directly on an account
// (via PATCH /api/auth/wallet) over the driver-only resolver below,
// since most accounts that need a wallet resolved here — passengers
// referring friends, passengers claiming ride rewards — aren't in
// the driver-specific data files canonicalWalletResolver reads from
// at all.
async function resolveWalletForAccount(accountId) {
    try {
        const account = await auth.getAccountById(accountId);
        if (account && account.walletAddress) return account.walletAddress;
    } catch (error) {
        // fall through to the driver resolver below
    }
    return canonicalWalletResolver.resolveWallet(accountId);
}

// Real referral bonus — 0.2 THB credited to whoever referred this
// rider, triggered once, on the referred rider's first completed
// ride (see ride_completion_service.js). Follows the exact same
// wallet-resolution and on-chain-transfer path as a normal ride
// reward above, rather than a lesser/fake version — a referral
// bonus should be just as real as any other reward.
async function createReferralBonus({ referrerId, referredAccountId }) {

    if (!referrerId || !referredAccountId) {
        return { success: false, status: "INVALID_REQUEST" };
    }

    const ledger = await loadLedger();

    const alreadyPaid = ledger.transactions.find(
        t => t && t.type === "REFERRAL_BONUS" && String(t.referredAccountId) === String(referredAccountId)
    );

    if (alreadyPaid) {
        return { success: true, status: "ALREADY_PAID", created: false, bonus: alreadyPaid };
    }

    const amount = 0.2;

    const bonus = {
        id: "TX-" + Date.now(),
        type: "REFERRAL_BONUS",
        referrerId,
        referredAccountId,
        amount,
        status: "PENDING_TRANSFER",
        // A passenger's real wallet address (saved via PATCH
        // /api/auth/wallet when they connect MetaMask) is the
        // correct source here. canonicalWalletResolver only checks
        // driver-specific data files, so it's kept only as a
        // fallback for a referrer who happens to also be a driver
        // with a wallet resolvable that way — not the primary path.
        wallet: await resolveWalletForAccount(referrerId)
    };

    ledger.transactions.push(bonus);
    await saveLedger(ledger);

    let executionResult = { status: "SKIPPED", reason: "No wallet resolved for referrer" };

    if (bonus.wallet) {
        try {
            executionResult = await thbExecutor.executeTransfer({ wallet: bonus.wallet, amount });
        } catch (error) {
            executionResult = { status: "FAILED", reason: error.message || "Unknown executor error" };
        }
    }

    bonus.status = executionResult.status;
    bonus.txHash = executionResult.hash || null;
    bonus.executionReason = executionResult.reason || null;

    const persisted = await loadLedger();
    const persistedTx = persisted.transactions.find(t => t.id === bonus.id);
    if (persistedTx) {
        persistedTx.status = bonus.status;
        persistedTx.txHash = bonus.txHash;
        persistedTx.executionReason = bonus.executionReason;
    }
    await saveLedger(persisted);

    return { success: true, status: "BONUS_CREATED", created: true, bonus };
}

// Real per-ride passenger reward — the actual backend behind the
// "Claim 1 THB reward" button on the passenger's Rewards screen.
// Previously that button called contract.transfer() directly from
// the PASSENGER's OWN connected wallet — standard ERC20 transfer()
// moves tokens OUT of the caller's balance, so that was the
// passenger sending THB to themselves, not receiving anything. It
// could only ever fail (insufficient balance, for anyone who'd never
// gotten THB before — which is everyone this button targets) or be a
// pointless no-op. This is the real version: the treasury wallet
// (held server-side, see thb_real_executor.js) sends the token,
// exactly like a driver's ride-completion reward or a referral bonus
// above — not a fundamentally-broken client-side self-transfer.
async function createRideClaimReward({ rideId, passengerAccountId }) {

    if (!rideId || !passengerAccountId) {
        return { success: false, status: "INVALID_REQUEST" };
    }

    const ride = await rideRepository.findById(rideId);

    if (!ride || ride.status !== "COMPLETED") {
        return { success: false, status: "RIDE_NOT_ELIGIBLE" };
    }

    if (ride.passengerAccountId !== passengerAccountId) {
        return { success: false, status: "NOT_YOUR_RIDE" };
    }

    const ledger = await loadLedger();

    const alreadyClaimed = ledger.transactions.find(
        t => t && t.type === "RIDE_CLAIM" && t.rideId === rideId
    );

    if (alreadyClaimed) {
        return { success: true, status: "ALREADY_CLAIMED", created: false, claim: alreadyClaimed };
    }

    const amount = 1;

    const claim = {
        id: "TX-" + Date.now(),
        type: "RIDE_CLAIM",
        rideId,
        passengerAccountId,
        amount,
        status: "PENDING_TRANSFER",
        wallet: await resolveWalletForAccount(passengerAccountId)
    };

    if (!claim.wallet) {
        return { success: false, status: "NO_WALLET", error: "Connect a wallet before claiming" };
    }

    ledger.transactions.push(claim);
    await saveLedger(ledger);

    let executionResult = { status: "SKIPPED", reason: "No wallet resolved" };

    try {
        executionResult = await thbExecutor.executeTransfer({ wallet: claim.wallet, amount });
    } catch (error) {
        executionResult = { status: "FAILED", reason: error.message || "Unknown executor error" };
    }

    claim.status = executionResult.status;
    claim.txHash = executionResult.hash || null;
    claim.executionReason = executionResult.reason || null;

    const persisted = await loadLedger();
    const persistedTx = persisted.transactions.find(t => t.id === claim.id);
    if (persistedTx) {
        persistedTx.status = claim.status;
        persistedTx.txHash = claim.txHash;
        persistedTx.executionReason = claim.executionReason;
    }
    await saveLedger(persisted);

    return { success: true, status: "CLAIM_CREATED", created: true, claim };
}

module.exports = {

    createRewardForCompletedRide,
    createReferralBonus,
    createRideClaimReward,

    getRewardForRide

};
