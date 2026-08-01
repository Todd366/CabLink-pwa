const express = require("express");

const app = express();

app.use(express.json());

console.log("CABLINK TEST: Loading ride routes...");

const rideRoutes =
    require("../backend/routes/rides");

console.log("CABLINK TEST: Ride routes loaded");

app.get("/api/health", (req, res) => {

    res.json({
        system: "CabLink API",
        status: "ONLINE",
        test: "RIDE_ROUTES_ONLY",
        time: new Date().toISOString()
    });

});

app.use(
    "/api/rides",
    rideRoutes
);

module.exports = app;
