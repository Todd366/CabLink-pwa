const fs = require("fs");
const http = require("http");

const BASE = "http://127.0.0.1:3000";
const engine = require("./backend/canonical/ride_engine");

let passed = 0;
let failed = 0;

function pass(msg) {
    passed++;
    console.log("  ✅ " + msg);
}

function fail(msg) {
    failed++;
    console.log("  ❌ " + msg);
}

function section(msg) {
    console.log("\n" + "=".repeat(70));
    console.log(msg);
    console.log("=".repeat(70));
}

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;

        const req = http.request(
            BASE + path,
            {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(data
                        ? { "Content-Length": Buffer.byteLength(data) }
                        : {})
                }
            },
            res => {
                let raw = "";

                res.on("data", chunk => {
                    raw += chunk;
                });

                res.on("end", () => {
                    let json = null;

                    try {
                        json = JSON.parse(raw);
                    } catch (_) {}

                    resolve({
                        status: res.statusCode,
                        body: json,
                        raw
                    });
                });
            }
        );

        req.on("error", reject);

        if (data) {
            req.write(data);
        }

        req.end();
    });
}

async function main() {

    console.log(`
======================================================================
🚕 CABLINK — STAGE 3 CANONICAL RIDE SYSTEM VERIFICATION
======================================================================
`);

    // ================================================================
    // 1. FILE STRUCTURE
    // ================================================================

    section("1. VERIFY CANONICAL FILE STRUCTURE");

    const requiredFiles = [
        "backend/canonical/ride_repository.js",
        "backend/canonical/ride_engine.js",
        "backend/data/rides.json",
        "backend/routes/rides.js",
        "CABLINK_CANONICAL_RIDE_MIGRATION.txt"
    ];

    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            pass(file);
        } else {
            fail("Missing: " + file);
        }
    }


    // ================================================================
    // 2. VERIFY ENGINE STATES
    // ================================================================

    section("2. VERIFY CANONICAL STATE MACHINE");

    const expectedStates = [
        "REQUESTED",
        "MATCHING",
        "DRIVER_ASSIGNED",
        "DRIVER_ARRIVED",
        "PICKED_UP",
        "STARTED",
        "COMPLETED",
        "CANCELLED"
    ];

    for (const state of expectedStates) {
        if (engine.STATES[state] === state) {
            pass("State exists: " + state);
        } else {
            fail("Missing state: " + state);
        }
    }


    // ================================================================
    // 3. DIRECT ENGINE LIFECYCLE TEST
    // ================================================================

    section("3. DIRECT ENGINE LIFECYCLE TEST");

    let directRide;

    try {

        directRide = engine.createRide({
            pickup: "BSTM HQ, Mmopane",
            dropoff: "Game City Mall",
            vehicle: "standard",
            fare: 20,
            distanceKm: 8,
            wallet: "TEST-WALLET",
            passenger: "TEST-PASSENGER"
        });

        if (
            directRide &&
            directRide.status === "REQUESTED"
        ) {
            pass("Ride created in REQUESTED state");
        } else {
            fail("Ride creation failed");
        }


        const lifecycle = [
            ["MATCHING", {}],
            [
                "DRIVER_ASSIGNED",
                {
                    driverId: "TEST-DRIVER-001",
                    driverName: "Stage 3 Test Driver"
                }
            ],
            ["DRIVER_ARRIVED", {}],
            ["PICKED_UP", {}],
            ["STARTED", {}],
            ["COMPLETED", {}]
        ];

        for (const [state, metadata] of lifecycle) {

            const result = engine.transition(
                directRide.id,
                state,
                metadata
            );

            if (
                result.success &&
                result.ride &&
                result.ride.status === state
            ) {
                pass("Transitioned to " + state);
            } else {
                fail(
                    "Failed transition to " +
                    state +
                    ": " +
                    JSON.stringify(result)
                );
            }
        }


        const finalRide =
            engine.getRide(directRide.id);

        if (
            finalRide &&
            finalRide.status === "COMPLETED" &&
            finalRide.driverId === "TEST-DRIVER-001"
        ) {
            pass(
                "Final completed ride persisted with driver assignment"
            );
        } else {
            fail(
                "Final ride persistence verification failed"
            );
        }

    } catch (error) {

        fail(
            "Direct lifecycle test crashed: " +
            error.message
        );

    }


    // ================================================================
    // 4. INVALID TRANSITION TEST
    // ================================================================

    section("4. VERIFY INVALID TRANSITIONS ARE BLOCKED");

    try {

        const invalid =
            engine.transition(
                directRide.id,
                "DRIVER_ASSIGNED"
            );

        if (
            invalid.success === false
        ) {
            pass(
                "Completed ride cannot move backwards to DRIVER_ASSIGNED"
            );
        } else {
            fail(
                "Invalid backward transition was incorrectly accepted"
            );
        }

    } catch (error) {

        fail(
            "Invalid transition test crashed: " +
            error.message
        );

    }


    // ================================================================
    // 5. BACKEND API HEALTH CHECK
    // ================================================================

    section("5. VERIFY LIVE /api/rides API");

    let apiAvailable = false;

    try {

        const response =
            await request(
                "GET",
                "/api/rides"
            );

        console.log(
            "  API status:",
            response.status
        );

        if (
            response.status === 200 &&
            response.body &&
            response.body.success === true &&
            Array.isArray(response.body.rides)
        ) {
            apiAvailable = true;
            pass(
                "GET /api/rides is working"
            );

            console.log(
                "  Ride count:",
                response.body.count
            );

        } else {

            fail(
                "GET /api/rides returned unexpected response"
            );

            console.log(
                response.raw
            );
        }

    } catch (error) {

        fail(
            "Backend unavailable at " +
            BASE +
            " — start your CabLink backend and rerun this script"
        );

        console.log(
            "  Error:",
            error.message
        );

    }


    // ================================================================
    // 6. API CREATE RIDE
    // ================================================================

    let apiRide = null;

    if (apiAvailable) {

        section("6. VERIFY POST /api/rides");

        try {

            const response =
                await request(
                    "POST",
                    "/api/rides",
                    {
                        pickup: "BSTM HQ, Mmopane",
                        dropoff: "Game City Mall",
                        vehicle: "standard",
                        fare: 20,
                        distanceKm: 8,
                        wallet: "API-TEST-WALLET",
                        notes: "Stage 3 API verification"
                    }
                );

            console.log(
                "  POST status:",
                response.status
            );

            apiRide =
                response.body &&
                response.body.ride;

            if (
                response.status === 201 &&
                response.body &&
                response.body.success === true &&
                apiRide
            ) {

                pass(
                    "POST /api/rides created ride"
                );

                console.log(
                    "  Ride ID:",
                    apiRide.id
                );

                console.log(
                    "  Initial API state:",
                    apiRide.status
                );

                if (
                    apiRide.status === "MATCHING"
                ) {
                    pass(
                        "New API ride automatically entered MATCHING"
                    );
                } else {
                    fail(
                        "New API ride did not enter MATCHING"
                    );
                }

            } else {

                fail(
                    "POST /api/rides failed"
                );

                console.log(
                    response.raw
                );

            }

        } catch (error) {

            fail(
                "POST /api/rides crashed: " +
                error.message
            );

        }

    }


    // ================================================================
    // 7. API GET RIDE
    // ================================================================

    if (apiRide) {

        section("7. VERIFY GET /api/rides/:id");

        try {

            const response =
                await request(
                    "GET",
                    "/api/rides/" +
                    apiRide.id
                );

            if (
                response.status === 200 &&
                response.body &&
                response.body.success === true &&
                response.body.ride &&
                response.body.ride.id === apiRide.id
            ) {

                pass(
                    "GET /api/rides/:id returned correct ride"
                );

            } else {

                fail(
                    "GET /api/rides/:id failed"
                );

                console.log(
                    response.raw
                );

            }

        } catch (error) {

            fail(
                "GET ride crashed: " +
                error.message
            );

        }

    }


    // ================================================================
    // 8. API COMPLETE LIFECYCLE
    // ================================================================

    if (apiRide) {

        section("8. VERIFY LIVE API RIDE LIFECYCLE");

        const apiLifecycle = [

            [
                "DRIVER_ASSIGNED",
                {
                    driverId: "API-TEST-DRIVER-001",
                    driverName: "API Stage 3 Driver"
                }
            ],

            [
                "DRIVER_ARRIVED",
                {}
            ],

            [
                "PICKED_UP",
                {}
            ],

            [
                "STARTED",
                {}
            ],

            [
                "COMPLETED",
                {}
            ]

        ];

        for (
            const [state, metadata]
            of apiLifecycle
        ) {

            try {

                const response =
                    await request(
                        "PATCH",
                        "/api/rides/" +
                        apiRide.id,
                        {
                            status: state,
                            ...metadata
                        }
                    );

                if (
                    response.status === 200 &&
                    response.body &&
                    response.body.success === true &&
                    response.body.ride &&
                    response.body.ride.status === state
                ) {

                    pass(
                        "API transitioned to " +
                        state
                    );

                } else {

                    fail(
                        "API failed transition to " +
                        state
                    );

                    console.log(
                        response.raw
                    );

                    break;
                }

            } catch (error) {

                fail(
                    "API transition crashed at " +
                    state +
                    ": " +
                    error.message
                );

                break;

            }

        }

    }


    // ================================================================
    // 9. VERIFY COMPLETED RIDE
    // ================================================================

    if (apiRide) {

        section("9. VERIFY FINAL API RIDE");

        try {

            const response =
                await request(
                    "GET",
                    "/api/rides/" +
                    apiRide.id
                );

            const ride =
                response.body &&
                response.body.ride;

            if (
                ride &&
                ride.status === "COMPLETED" &&
                ride.driverId ===
                    "API-TEST-DRIVER-001" &&
                ride.completedAt
            ) {

                pass(
                    "Completed ride persisted correctly"
                );

                console.log(
                    "  Ride:",
                    JSON.stringify(
                        ride,
                        null,
                        2
                    )
                );

            } else {

                fail(
                    "Final completed ride verification failed"
                );

                console.log(
                    JSON.stringify(
                        response.body,
                        null,
                        2
                    )
                );

            }

        } catch (error) {

            fail(
                "Final ride verification crashed: " +
                error.message
            );

        }

    }


    // ================================================================
    // 10. FRONTEND COMPATIBILITY CHECK
    // ================================================================

    section("10. VERIFY FRONTEND API COMPATIBILITY");

    const appCore =
        fs.existsSync(
            "frontend/js/app_core.js"
        )
            ? fs.readFileSync(
                "frontend/js/app_core.js",
                "utf8"
            )
            : "";

    const rewardBridge =
        fs.existsSync(
            "frontend/js/rides/completionRewardBridge.js"
        )
            ? fs.readFileSync(
                "frontend/js/rides/completionRewardBridge.js",
                "utf8"
            )
            : "";

    if (
        appCore.includes(
            "fetch('/api/rides'"
        )
    ) {

        pass(
            "Frontend creates rides through /api/rides"
        );

    } else {

        fail(
            "Frontend /api/rides POST integration not detected"
        );

    }

    if (
        appCore.includes(
            "PATCH"
        ) &&
        appCore.includes(
            "/api/rides/"
        )
    ) {

        pass(
            "Frontend has /api/rides/:id PATCH integration"
        );

    } else {

        fail(
            "Frontend ride PATCH integration not detected"
        );

    }

    if (
        rewardBridge.includes(
            "cablinkRideStateChanged"
        ) &&
        rewardBridge.includes(
            "COMPLETED"
        )
    ) {

        pass(
            "Completion reward bridge detects completed rides"
        );

    } else {

        fail(
            "Completion reward bridge integration not detected"
        );

    }


    // ================================================================
    // 11. FINAL REPORT
    // ================================================================

    section("🏁 STAGE 3 VERIFICATION RESULT");

    console.log("");
    console.log(
        "PASSED:",
        passed
    );

    console.log(
        "FAILED:",
        failed
    );

    console.log("");

    if (failed === 0) {

        console.log(`
🎉 STAGE 3 PASSED

The canonical ride system has successfully passed:

✓ File structure verification
✓ Canonical state machine verification
✓ Direct engine lifecycle
✓ Invalid transition protection
✓ Live API health check
✓ POST /api/rides
✓ GET /api/rides/:id
✓ Full API lifecycle
✓ COMPLETED persistence
✓ Frontend API compatibility checks

NEXT STEP:

Do NOT delete legacy ride files yet.

The next operation should be:

STAGE 4 — FRONTEND/BACKEND LIFECYCLE ALIGNMENT

Specifically align:

Frontend:
ARRIVING

with backend:
DRIVER_ARRIVED

Then connect:

Driver Controls
      ↓
Canonical API
      ↓
Canonical State Machine
      ↓
COMPLETED
      ↓
Completion Reward Bridge
      ↓
THB Reward
`);

    } else {

        console.log(`
⚠️ STAGE 3 REQUIRES ATTENTION

Some verification checks failed.

DO NOT delete legacy ride files.

Review the failures above before proceeding.
`);

    }

    console.log(
        "======================================================================"
    );

}

main().catch(error => {

    console.error(
        "\n❌ STAGE 3 VERIFICATION CRASHED:"
    );

    console.error(
        error
    );

    process.exit(1);

});

