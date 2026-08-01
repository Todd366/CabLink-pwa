const express = require("express");
const app = express();

app.use(express.json());

console.log(
    "CABLINK TEST K: Firebase production readiness"
);

function envPresent(name) {

    return Boolean(
        process.env[name]
    );

}

app.get("/api/health", (req, res) => {

    res.json({

        system:
            "CabLink API",

        status:
            "ONLINE",

        test:
            "FIREBASE_PRODUCTION_READINESS",

        time:
            new Date().toISOString()

    });

});

app.get("/api/firebase-readiness", async (req, res) => {

    const result = {

        success:
            false,

        test:
            "FIREBASE_PRODUCTION_READINESS",

        runtime: {

            node:
                process.version,

            platform:
                process.platform,

            cwd:
                process.cwd(),

            vercel:
                Boolean(
                    process.env.VERCEL
                )

        },

        environment: {

            firebaseProjectId:
                envPresent(
                    "FIREBASE_PROJECT_ID"
                ),

            firebaseClientEmail:
                envPresent(
                    "FIREBASE_CLIENT_EMAIL"
                ),

            firebasePrivateKey:
                envPresent(
                    "FIREBASE_PRIVATE_KEY"
                ),

            firebaseApiKey:
                envPresent(
                    "FIREBASE_API_KEY"
                ),

            googleApplicationCredentials:
                envPresent(
                    "GOOGLE_APPLICATION_CREDENTIALS"
                )

        },

        sdk: {},

        adapter: {},

        error:
            null

    };

    try {

        try {

            const admin =
                require(
                    "firebase-admin"
                );

            result.sdk.firebaseAdmin =
                "INSTALLED";

            result.sdk.firebaseAdminVersion =
                require(
                    "firebase-admin/package.json"
                ).version;

        } catch (error) {

            result.sdk.firebaseAdmin =
                "NOT_INSTALLED";

            result.sdk.firebaseAdminError = {

                code:
                    error.code,

                message:
                    error.message

            };

        }

        try {

            const firebase =
                require(
                    "../backend/firebase/firebase_adapter"
                );

            result.adapter.loaded =
                true;

            result.adapter.exports =
                Object.keys(
                    firebase
                );

            if (
                typeof firebase.status ===
                "function"
            ) {

                result.adapter.status =
                    firebase.status();

            }

        } catch (error) {

            result.adapter.loaded =
                false;

            result.adapter.error = {

                name:
                    error.name,

                code:
                    error.code,

                message:
                    error.message,

                stack:
                    error.stack

            };

        }

        result.success =
            true;

        res
            .status(200)
            .json(result);

    } catch (error) {

        result.error = {

            name:
                error.name,

            code:
                error.code,

            message:
                error.message,

            stack:
                error.stack

        };

        res
            .status(500)
            .json(result);

    }

});

module.exports = app;
