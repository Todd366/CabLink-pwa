const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());

console.log("CABLINK TEST H: Starting write forensics");

const db =
    require("../backend/storage/database");

const databaseFile =
    path.join(
        __dirname,
        "..",
        "backend",
        "storage",
        "cablink_db.json"
    );

app.get("/api/health", (req, res) => {

    res.json({
        system: "CabLink API",
        status: "ONLINE",
        test: "SERVERLESS_WRITE_FORENSICS",
        time: new Date().toISOString()
    });

});

app.get("/api/write-test", (req, res) => {

    const result = {
        success: false,
        test: "SERVERLESS_WRITE_FORENSICS",
        environment: {},
        filesystem: {},
        database: {},
        error: null
    };

    try {

        result.environment = {
            cwd: process.cwd(),
            dirname: __dirname,
            databaseFile
        };

        result.filesystem = {
            databaseExists:
                fs.existsSync(databaseFile),

            directoryExists:
                fs.existsSync(
                    path.dirname(databaseFile)
                )
        };

        try {

            fs.accessSync(
                databaseFile,
                fs.constants.R_OK
            );

            result.filesystem.readAccess = true;

        } catch (error) {

            result.filesystem.readAccess = false;

            result.filesystem.readAccessError = {
                code: error.code,
                message: error.message
            };

        }

        try {

            fs.accessSync(
                path.dirname(databaseFile),
                fs.constants.W_OK
            );

            result.filesystem.directoryWriteAccess = true;

        } catch (error) {

            result.filesystem.directoryWriteAccess = false;

            result.filesystem.directoryWriteAccessError = {
                code: error.code,
                message: error.message
            };

        }

        console.log(
            "CABLINK TEST H: Reading database"
        );

        const data =
            db.read();

        result.database.before = {
            users:
                Array.isArray(data.users)
                    ? data.users.length
                    : null,

            rides:
                Array.isArray(data.rides)
                    ? data.rides.length
                    : null
        };

        const testUser = {

            id:
                "WRITE-TEST-" +
                Date.now(),

            name:
                "CabLink Serverless Write Test",

            test:
                true,

            created:
                new Date().toISOString()

        };

        data.users.push(
            testUser
        );

        console.log(
            "CABLINK TEST H: Attempting database.write()"
        );

        try {

            db.write(data);

            result.database.write =
                "SUCCESS";

            result.success =
                true;

            result.database.after = {
                users:
                    data.users.length,

                rides:
                    Array.isArray(data.rides)
                        ? data.rides.length
                        : null
            };

        } catch (error) {

            result.database.write =
                "FAILED";

            result.error = {

                name:
                    error.name,

                code:
                    error.code,

                errno:
                    error.errno,

                syscall:
                    error.syscall,

                path:
                    error.path,

                message:
                    error.message,

                stack:
                    error.stack

            };

        }

        res.status(
            result.success
                ? 200
                : 500
        ).json(result);

    } catch (error) {

        result.error = {

            name:
                error.name,

            code:
                error.code,

            errno:
                error.errno,

            syscall:
                error.syscall,

            path:
                error.path,

            message:
                error.message,

            stack:
                error.stack

        };

        console.error(
            "CABLINK TEST H FAILED"
        );

        console.error(
            error.stack || error
        );

        res.status(500).json(result);

    }

});

module.exports = app;
