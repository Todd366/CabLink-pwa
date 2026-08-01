const express = require("express");

const app = express();

app.use(express.json());

console.log("CABLINK TEST F: Loading storage database...");

const db =
    require("../backend/storage/database");

console.log("CABLINK TEST F: Storage database loaded");

app.get("/api/health", (req, res) => {

    res.json({
        system: "CabLink API",
        status: "ONLINE",
        test: "STORAGE_DATABASE_ONLY",
        time: new Date().toISOString()
    });

});

app.get("/api/storage-test", (req, res) => {

    try {

        console.log("CABLINK TEST F: Calling db.read()");

        const data = db.read();

        res.json({
            success: true,
            test: "STORAGE_DATABASE_READ",
            data
        });

    } catch (error) {

        console.error(
            "CABLINK TEST F: DATABASE READ FAILED"
        );

        console.error(
            error.stack || error
        );

        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });

    }

});

module.exports = app;
