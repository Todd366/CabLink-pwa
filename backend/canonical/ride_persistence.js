const fs =
    require("fs");

const path =
    require("path");


const MODE =
    process.env.CABLINK_RIDE_PERSISTENCE ||
    "LOCAL";


const DATA_DIR =
    path.join(
        __dirname,
        "..",
        "data"
    );


const FILE =
    path.join(
        DATA_DIR,
        "rides.json"
    );


const COLLECTION =
    process.env.CABLINK_RIDE_FIRESTORE_COLLECTION ||
    "cablink_rides";


let firestore =
    null;


// ============================================================
// FIRESTORE ADAPTER
// ============================================================

function getFirestoreAdapter() {

    if (!firestore) {

        firestore =
            require(
                "../firebase/firestore_adapter"
            );

    }

    return firestore;

}


// ============================================================
// LOCAL STORAGE
// ============================================================

function ensureLocalStore() {

    try {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive:
                    true
            }
        );

    } catch (_) {}

    if (
        !fs.existsSync(
            FILE
        )
    ) {

        try {

            fs.writeFileSync(
                FILE,
                "[]",
                "utf8"
            );

        } catch (_) {}

    }

}


function loadLocal() {

    ensureLocalStore();

    try {

        const raw =
            fs.readFileSync(
                FILE,
                "utf8"
            );

        const data =
            JSON.parse(
                raw
            );

        return Array.isArray(
            data
        )
            ? data
            : [];

    } catch (error) {

        console.error(
            "Canonical ride local read error:",
            error
        );

        return [];

    }

}


function saveLocal(
    rides
) {

    ensureLocalStore();

    try {

        fs.writeFileSync(
            FILE,
            JSON.stringify(
                rides,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "Canonical ride local write error:",
            error
        );

        return false;

    }

}


// ============================================================
// CREATE
// ============================================================

async function create(
    ride
) {

    if (
        MODE ===
        "FIRESTORE"
    ) {

        const db =
            getFirestoreAdapter();

        await db.write(
            COLLECTION,
            String(
                ride.id
            ),
            ride
        );

        return ride;

    }


    const rides =
        loadLocal();

    rides.push(
        ride
    );

    saveLocal(
        rides
    );

    return ride;

}


// ============================================================
// READ ONE
// ============================================================

async function findById(
    id
) {

    if (
        MODE ===
        "FIRESTORE"
    ) {

        const db =
            getFirestoreAdapter();

        const result =
            await db.read(
                COLLECTION,
                String(id)
            );

        return result.exists
            ? result.data
            : null;

    }


    return (

        loadLocal()
            .find(
                ride =>
                    ride.id ===
                    String(id)
            )

        ||

        null

    );

}


// ============================================================
// READ ALL
// ============================================================

async function all() {

    if (
        MODE ===
        "FIRESTORE"
    ) {

        const db =
            getFirestoreAdapter();

        return db.list(
            COLLECTION
        );

    }


    return loadLocal();

}


// ============================================================
// UPDATE
// ============================================================

async function update(
    id,
    changes
) {

    const existing =
        await findById(
            id
        );


    if (
        !existing
    ) {

        return null;

    }


    const updated = {

        ...existing,

        ...changes,

        updatedAt:
            new Date()
                .toISOString()

    };


    if (
        MODE ===
        "FIRESTORE"
    ) {

        const db =
            getFirestoreAdapter();

        await db.write(
            COLLECTION,
            String(id),
            updated
        );

        return updated;

    }


    const rides =
        loadLocal();


    const index =
        rides.findIndex(
            ride =>
                ride.id ===
                String(id)
        );


    if (
        index ===
        -1
    ) {

        return null;

    }


    rides[index] =
        updated;


    saveLocal(
        rides
    );


    return updated;

}


// ============================================================
// DELETE
// ============================================================

async function remove(
    id
) {

    if (
        MODE ===
        "FIRESTORE"
    ) {

        const existing =
            await findById(
                id
            );


        if (
            !existing
        ) {

            return null;

        }


        const db =
            getFirestoreAdapter();

        await db.delete(
            COLLECTION,
            String(id)
        );


        return existing;

    }


    const rides =
        loadLocal();


    const index =
        rides.findIndex(
            ride =>
                ride.id ===
                String(id)
        );


    if (
        index ===
        -1
    ) {

        return null;

    }


    const removed =
        rides.splice(
            index,
            1
        )[0];


    saveLocal(
        rides
    );


    return removed;

}


// ============================================================
// ACCEPT RIDE
// ============================================================
//
// FIRESTORE MODE:
//
// This operation is transaction-safe.
//
// The ride is read inside a Firestore transaction.
// The transaction verifies that the ride is still MATCHING.
// The driver assignment is then written atomically.
//
// This guarantees first-driver-wins semantics.
//
// ============================================================

async function accept(
    id,
    driverId,
    driverName
) {

    if (
        !driverId
    ) {

        return {

            success:
                false,

            code:
                "DRIVER_ID_REQUIRED",

            error:
                "Driver ID is required"

        };

    }


    // ========================================================
    // FIRESTORE
    // ========================================================

    if (
        MODE ===
        "FIRESTORE"
    ) {

        const db =
            getFirestoreAdapter();


        const result =
            await db.transaction(
                async transaction => {

                    const firestore =
                        require(
                            "firebase-admin/firestore"
                        );


                    const firestoreDb =
                        firestore
                            .getFirestore();


                    const ref =
                        firestoreDb
                            .collection(
                                COLLECTION
                            )
                            .doc(
                                String(id)
                            );


                    const snapshot =
                        await transaction.get(
                            ref
                        );


                    if (
                        !snapshot.exists
                    ) {

                        return {

                            success:
                                false,

                            code:
                                "NOT_FOUND",

                            error:
                                "Ride not found"

                        };

                    }


                    const ride =
                        snapshot.data();


                    if (
                        ride.status !==
                        "MATCHING"
                    ) {

                        return {

                            success:
                                false,

                            code:
                                "ALREADY_ACCEPTED",

                            error:
                                "Ride is no longer available for acceptance",

                            currentStatus:
                                ride.status,

                            ride

                        };

                    }


                    const now =
                        new Date()
                            .toISOString();


                    const updated = {

                        ...ride,

                        driverId:
                            String(
                                driverId
                            ),

                        driverName:
                            driverName ||
                            ride.driverName ||
                            null,

                        status:
                            "DRIVER_ASSIGNED",

                        acceptedAt:
                            now,

                        updatedAt:
                            now

                    };


                    transaction.set(
                        ref,
                        updated,
                        {
                            merge:
                                true
                        }
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
            );


        return result;

    }


    // ========================================================
    // LOCAL
    // ========================================================

    const ride =
        await findById(
            id
        );


    if (
        !ride
    ) {

        return {

            success:
                false,

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

            success:
                false,

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
            String(
                driverId
            ),

        driverName:
            driverName ||
            ride.driverName ||
            null,

        status:
            "DRIVER_ASSIGNED",

        acceptedAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString()

    };


    const rides =
        loadLocal();


    const index =
        rides.findIndex(
            ride =>
                ride.id ===
                String(id)
        );


    if (
        index ===
        -1
    ) {

        return {

            success:
                false,

            code:
                "NOT_FOUND",

            error:
                "Ride not found"

        };

    }


    rides[index] =
        updated;


    saveLocal(
        rides
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


// ============================================================
// STATUS
// ============================================================

function status() {

    return {

        mode:
            MODE,

        provider:
            MODE ===
            "FIRESTORE"

                ? "FIRESTORE"

                : "LOCAL",

        file:
            FILE,

        collection:
            COLLECTION

    };

}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    create,

    findById,

    all,

    update,

    delete:
        remove,

    accept,

    status

};
