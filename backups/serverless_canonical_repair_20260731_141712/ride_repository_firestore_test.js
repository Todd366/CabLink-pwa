const db =
    require("../production/database_adapter");

const COLLECTION =
    "cablink_test_rides";

async function create(ride) {

    return db.write(
        COLLECTION,
        ride.id,
        ride
    ).then(() => ride);

}

async function findById(id) {

    const result =
        await db.read(
            COLLECTION,
            String(id)
        );

    return result.exists
        ? result.data
        : null;

}

async function all() {

    /*
     * The current production adapter intentionally exposes
     * document-level read/write operations only.
     *
     * Therefore this isolated migration test verifies
     * canonical create/read/transition/accept persistence
     * through individual Firestore documents.
     *
     * Collection listing is intentionally not implemented
     * in this surgical test.
     */

    throw new Error(
        "COLLECTION_LIST_NOT_IMPLEMENTED_IN_TEST_ADAPTER"
    );

}

async function update(
    id,
    changes
) {

    const existing =
        await findById(id);

    if (!existing) {
        return null;
    }

    const updated = {

        ...existing,

        ...changes,

        updatedAt:
            new Date().toISOString()

    };

    await db.write(
        COLLECTION,
        String(id),
        updated
    );

    return updated;

}

async function accept(
    id,
    driverId,
    driverName
) {

    if (!driverId) {

        return {

            success: false,

            code:
                "DRIVER_ID_REQUIRED",

            error:
                "Driver ID is required"

        };

    }

    const ride =
        await findById(id);

    if (!ride) {

        return {

            success: false,

            code:
                "NOT_FOUND",

            error:
                "Ride not found"

        };

    }

    if (
        ride.status !==
        "MATCHING"
    ) {

        return {

            success: false,

            code:
                "ALREADY_ACCEPTED",

            error:
                "Ride is no longer available for acceptance",

            currentStatus:
                ride.status,

            ride

        };

    }

    const updated = {

        ...ride,

        driverId:
            String(driverId),

        driverName:
            driverName ||
            ride.driverName ||
            null,

        status:
            "DRIVER_ASSIGNED",

        acceptedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

    await db.write(
        COLLECTION,
        String(id),
        updated
    );

    return {

        success:
            true,

        code:
            "ACCEPTED",

        ride:
            updated

    };

}

module.exports = {

    COLLECTION,

    create,

    findById,

    all,

    update,

    accept

};
