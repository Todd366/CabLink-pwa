const express = require("express");

const app = express();

app.use(express.json());

console.log("CABLINK TEST G: Loading user routes...");

const userRoutes =
    require("../backend/routes/users");

console.log("CABLINK TEST G: User routes loaded");

app.get("/api/health", (req, res) => {

    res.json({
        system: "CabLink API",
        status: "ONLINE",
        test: "USERS_AFTER_DATABASE_FIX",
        time: new Date().toISOString()
    });

});

app.use(
    "/api/users",
    userRoutes
);

module.exports = app;
