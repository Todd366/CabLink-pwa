const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

let initialized = false;

function getCredentials() {

    const projectId =
        process.env.FIREBASE_PROJECT_ID;

    const clientEmail =
        process.env.FIREBASE_CLIENT_EMAIL;

    const privateKey =
        process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY
                .replace(/\\n/g, "\n")
            : null;

    const missing = [];

    if (!projectId)
        missing.push("FIREBASE_PROJECT_ID");

    if (!clientEmail)
        missing.push("FIREBASE_CLIENT_EMAIL");

    if (!privateKey)
        missing.push("FIREBASE_PRIVATE_KEY");

    if (missing.length > 0) {

        throw new Error(
            "Missing Firebase Admin credentials: " +
            missing.join(", ")
        );

    }

    return {
        projectId,
        clientEmail,
        privateKey
    };

}

function initialize() {

    if (initialized) {

        return admin.getApp();

    }

    const existingApps =
        admin.getApps();

    if (
        existingApps.length > 0
    ) {

        initialized = true;

        return existingApps[0];

    }

    const credentials =
        getCredentials();

    const app =
        admin.initializeApp({

            credential:
                admin.cert(
                    credentials
                ),

            projectId:
                credentials.projectId

        });

    initialized = true;

    return app;

}

function db() {

    initialize();

    return getFirestore();

}

async function write(
    collection,
    id,
    data
) {

    if (
        !collection ||
        !id
    ) {

        throw new Error(
            "Firestore collection and document ID are required"
        );

    }

    const firestore =
        db();

    await firestore
        .collection(collection)
        .doc(id)
        .set(
            data,
            {
                merge: true
            }
        );

    return {

        success:
            true,

        collection,

        id,

        status:
            "FIRESTORE_WRITE_SUCCESS"

    };

}

async function read(
    collection,
    id
) {

    if (
        !collection ||
        !id
    ) {

        throw new Error(
            "Firestore collection and document ID are required"
        );

    }

    const firestore =
        db();

    const snapshot =
        await firestore
            .collection(collection)
            .doc(id)
            .get();

    return {

        exists:
            snapshot.exists,

        data:
            snapshot.exists
                ? snapshot.data()
                : null

    };

}

function status() {

    return {

        provider:
            "FIRESTORE",

        configured:
            Boolean(
                process.env.FIREBASE_PROJECT_ID &&
                process.env.FIREBASE_CLIENT_EMAIL &&
                process.env.FIREBASE_PRIVATE_KEY
            ),

        project:
            process.env.FIREBASE_PROJECT_ID
                || null

    };

}

module.exports = {

    initialize,

    write,

    read,

    status

};
