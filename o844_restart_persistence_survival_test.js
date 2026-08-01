const http = require("http");
const { spawn } = require("child_process");

console.log(`
==============================================
CABLINK O.8.44 — RESTART PERSISTENCE SURVIVAL
==============================================
`);

const HOST = "127.0.0.1";
const PORT = 3000;

function request(method, path, body) {

    return new Promise((resolve, reject) => {

        const payload =
            JSON.stringify(body || {});

        const req = http.request(
            {
                hostname: HOST,
                port: PORT,
                path,
                method,
                headers: {
                    "Content-Type":
                        "application/json",

                    "Content-Length":
                        Buffer.byteLength(payload)
                }
            },

            res => {

                let data = "";

                res.on(
                    "data",
                    chunk => data += chunk
                );

                res.on(
                    "end",
                    () => {

                        let parsed;

                        try {
                            parsed =
                                JSON.parse(data);
                        } catch {
                            parsed = data;
                        }

                        resolve({
                            status:
                                res.statusCode,

                            body: parsed
                        });

                    }
                );

            }
        );

        req.on(
            "error",
            reject
        );

        if (method !== "GET") {
            req.write(payload);
        }

        req.end();

    });

}


async function waitForHealth(
    attempts = 20
) {

    for (
        let i = 1;
        i <= attempts;
        i++
    ) {

        try {

            const result =
                await request(
                    "GET",
                    "/health"
                );

            if (
                result.status === 200 &&
                result.body.status === "ONLINE"
            ) {

                return true;

            }

        } catch {}

        await new Promise(
            resolve =>
                setTimeout(resolve, 500)
        );

    }

    return false;

}


function startBackend() {

    return spawn(
        "node",
        ["backend/server.js"],
        {
            cwd: process.cwd(),
            stdio: [
                "ignore",
                "pipe",
                "pipe"
            ]
        }
    );

}


async function run() {

    let backend = null;

    try {

        // ======================================
        // 1. HEALTH CHECK
        // ======================================

        console.log(
            "\n1. INITIAL BACKEND HEALTH"
        );

        let health =
            await request(
                "GET",
                "/health"
            );

        console.log(
            health.status,
            health.body
        );

        if (
            health.status !== 200 ||
            health.body.status !== "ONLINE"
        ) {

            throw new Error(
                "Backend is not healthy"
            );

        }


        // ======================================
        // 2. CREATE RIDE
        // ======================================

        console.log(
            "\n2. CREATE RIDE"
        );

        let create =
            await request(
                "POST",
                "/api/rides",
                {
                    pickup:
                        "BSTM HQ",

                    dropoff:
                        "Game City Mall",

                    fare: 20,

                    passenger:
                        "O844_SURVIVAL_TEST"
                }
            );

        console.log(
            create.status,
            create.body
        );

        if (
            !create.body.ride ||
            !create.body.ride.id
        ) {

            throw new Error(
                "Ride creation failed"
            );

        }

        const rideId =
            create.body.ride.id;


        console.log(
            "RIDE ID:",
            rideId
        );


        // ======================================
        // 3. ACCEPT
        // ======================================

        console.log(
            "\n3. DRIVER ACCEPT"
        );

        let accept =
            await request(
                "PATCH",
                "/api/rides/" +
                rideId +
                "/accept",

                {
                    driverId:
                        "O844_DRIVER",

                    driverName:
                        "O.8.44 Survival Driver"
                }
            );

        console.log(
            accept.status,
            accept.body
        );


        // ======================================
        // 4. FULL LIFECYCLE
        // ======================================

        console.log(
            "\n4. CANONICAL LIFECYCLE"
        );

        const states = [
            "DRIVER_ARRIVED",
            "PICKED_UP",
            "STARTED"
        ];

        for (
            const state of states
        ) {

            let result =
                await request(
                    "PATCH",
                    "/api/rides/" +
                    rideId,

                    {
                        status: state
                    }
                );

            console.log(
                state + ":",
                result.body.ride?.status ||
                result.body
            );

        }


        // ======================================
        // 5. COMPLETE
        // ======================================

        console.log(
            "\n5. COMPLETE RIDE"
        );

        let complete =
            await request(
                "POST",
                "/api/ride/complete",

                {
                    id:
                        rideId,

                    driverId:
                        "O844_DRIVER"
                }
            );

        console.log(
            complete.status,
            complete.body
        );


        if (
            complete.body.result?.ride?.status !==
            "COMPLETED"
        ) {

            throw new Error(
                "Ride did not reach COMPLETED"
            );

        }


        // ======================================
        // 6. VERIFY REWARD CREATED
        // ======================================

        console.log(
            "\n6. VERIFY REWARD"
        );

        let reward =
            await request(
                "POST",
                "/api/rewards/ride/" +
                rideId
            );

        console.log(
            reward.status,
            reward.body
        );


        if (
            reward.body.status !==
            "ALREADY_REWARDED"
        ) {

            throw new Error(
                "Expected existing reward after completion"
            );

        }


        // ======================================
        // 7. RESTART BACKEND
        // ======================================

        console.log(`
7. CONTROLLED BACKEND RESTART
`);

        const restart =
            spawn(
                "pkill",
                [
                    "-f",
                    "node backend/server.js"
                ],
                {
                    cwd:
                        process.cwd()
                }
            );

        await new Promise(
            resolve =>
                restart.on(
                    "close",
                    resolve
                )
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1000
                )
        );


        backend =
            startBackend();


        backend.stdout.on(
            "data",
            data =>
                process.stdout.write(
                    "[BACKEND] " +
                    data
                )
        );

        backend.stderr.on(
            "data",
            data =>
                process.stderr.write(
                    "[BACKEND ERROR] " +
                    data
                )
        );


        // ======================================
        // 8. WAIT FOR API
        // ======================================

        console.log(
            "\n8. WAIT FOR BACKEND"
        );

        const online =
            await waitForHealth();

        console.log(
            "BACKEND ONLINE:",
            online
        );


        if (!online) {

            throw new Error(
                "Backend failed to recover"
            );

        }


        // ======================================
        // 9. VERIFY RIDE PERSISTENCE
        // ======================================

        console.log(
            "\n9. VERIFY RIDE AFTER RESTART"
        );

        let persisted =
            await request(
                "GET",
                "/api/rides/" +
                rideId
            );

        console.log(
            persisted.status,
            persisted.body
        );


        const persistedRide =
            persisted.body.ride ||
            persisted.body;


        if (
            persistedRide.status !==
            "COMPLETED"
        ) {

            throw new Error(
                "Ride state did not survive restart"
            );

        }


        // ======================================
        // 10. VERIFY EXACTLY-ONCE REWARD
        // ======================================

        console.log(
            "\n10. VERIFY REWARD AFTER RESTART"
        );

        let duplicateReward =
            await request(
                "POST",
                "/api/rewards/ride/" +
                rideId
            );

        console.log(
            duplicateReward.status,
            duplicateReward.body
        );


        if (
            duplicateReward.body.status !==
            "ALREADY_REWARDED"
        ) {

            throw new Error(
                "Exactly-once reward protection failed"
            );

        }


        console.log(`
==============================================
O.8.44 RESULT: PASS
==============================================

CANONICAL RIDE STATE SURVIVED RESTART

RIDE:
${rideId}

FINAL STATE:
COMPLETED

REWARD:
ALREADY_REWARDED

EXACTLY-ONCE SEMANTICS:
PERSISTED

BACKEND:
ONLINE AFTER RESTART

==============================================
O.8.44 COMPLETE
==============================================
`);

    } catch (error) {

        console.error(`
==============================================
O.8.44 RESULT: FAIL
==============================================
`);

        console.error(
            error.message
        );

        process.exitCode = 1;

    }

}


run();
