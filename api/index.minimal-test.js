const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        system: "CabLink API",
        status: "ONLINE",
        mode: "VERCEL_MINIMAL_TEST",
        time: new Date().toISOString()
    });
});

app.get("/health", (req, res) => {
    res.json({
        system: "CabLink API",
        status: "ONLINE",
        mode: "VERCEL_MINIMAL_TEST",
        time: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        system: "CabLink API",
        status: "ONLINE",
        mode: "VERCEL_MINIMAL_TEST",
        time: new Date().toISOString()
    });
});

module.exports = app;
