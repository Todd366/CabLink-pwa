const http = require("http");
const { spawn, execSync } = require("child_process");

const HOST = "127.0.0.1";
const PORT = 3000;

let backend = null;

console.log(`
==============================================
CABLINK O.8.47 — DETERMINISTIC RESTART SURVIVAL
==============================================
`);

function request(method, path, body = null, timeout = 5000) {

    return new Promise((resolve, reject) => {

        const hasBody =
            method !== "GET" &&
            method !== "HEAD" &&
            body !== null &&
            body !== undefined;

        const payload =
            hasBody
                ? JSON.stringify(body)
                : null;

        const headers = {};

        if (hasBody) {

            headers["Content-Type"] =
                "application/json";

            headers["Content-Length"] =
                Buffer.byteLength(payload);

        }

        const req = http.request({

            hostname: HOST,
            port: PORT,
            path,
            method,
            timeout,
            headers

        }, res => {

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
                            data
                                ? JSON.parse(data)
                                : {};

                    } catch {

                        parsed = data;

                    }

                    resolve({

                        status:
                            res.statusCode,

                        body:
                            parsed

                    });

                }
            );

        });

        req.on(
            "timeout",
            () => {

                req.destroy(
                    new Error(
                        `Request timeout: ${method} ${path}`
                    )
                );

            }
        );

        req.on(
            "error",
            reject
        );

        if (hasBody) {

            req.write(payload);

        }

        req.end();

    });

}


function killExistingCabLinkBackends() {

    console.log(`
1. CLEAN EXISTING BACKEND PROCESSES
`);

    try {

        execSync(
            "pkill -f 'node backend/server.js' || true",
            {
                cwd:
                    process.cwd(),

                stdio:
                    "inherit"
            }
        );

    } catch {}

}


function startBackend() {

    console.log(`
2. CONTROLLED BACKEND START
`);

    backend =
        spawn(
            "node",
            [
                "backend/server.js"
            ],
            {
                cwd:
                    process.cwd(),

                stdio:
                    [
                        "ignore",
                        "pipe",
                        "pipe"
                    ]
            }
        );


    backend.stdout.on(
        "data",
        data => {

            process.stdout.write(
                "[BACKEND] " +
                data.toString()
            );

        }
    );


    backend.stderr.on(
        "data",
        data => {

            process.stderr.write(
                "[BACKEND ERROR] " +
                data.toString()
            );

        }
    );


    backend.on(
        "exit",
        (code, signal) => {

            console.log(
                `[BACKEND] exited code=${code} signal=${signal}`
            );

        }
    );


    return backend;

}


function stopOwnedBackend() {

    return new Promise(
        resolve => {

            if (
                !backend ||
                backend.exitCode !== null
            ) {

                resolve();

                return;

            }


            console.log(
                "\n[BACKEND] Stopping owned backend..."
            );


            const child =
                backend;


            const timer =
                setTimeout(
                    () => {

                        try {

                            child.kill(
                                "SIGKILL"
                            );

                        } catch {}

                        resolve();

                    },
                    3000
                );


            child.once(
                "exit",
                () => {

                    clearTimeout(
                        timer
                    );

                    resolve();

                }
            );


            try {

                child.kill(
                    "SIGTERM"
                );

            } catch {

                clearTimeout(
                    timer
                );

                resolve();

            }

        }
    );

}


async function waitForHealth(
    label,
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
                    "/health",
                    null,
                    1000
                );


            if (
                result.status === 200 &&
                result.body &&
                result.body.status ===
                    "ONLINE"
            ) {

                console.log(
                    `${label}: ONLINE`
                );

                return true;

            }

        } catch (
            error
        ) {

            console.log(
                `${label} attempt ${i}: ${error.message}`
            );

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );

    }


    return false;

}


async function run() {

    let rideId =
        null;


    try {


        // ======================================
        // 1. CLEAN
        // ======================================

        killExistingCabLinkBackends();


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1000
                )
        );


        // ======================================
        // 2. START
        // ======================================

        startBackend();


        // ======================================
        // 3. HEALTH
        // ======================================

        console.log(
            "\n3. INITIAL HEALTH"
        );


        if (
            !await waitForHealth(
                "INITIAL BACKEND"
            )
        ) {

            throw new Error(
                "Initial backend failed health check"
            );

        }


        // ======================================
        // 4. CREATE
        // ======================================

        console.log(
            "\n4. CREATE RIDE"
        );


        const create =
            await request(
                "POST",
                "/api/rides",
                {

                    pickup:
                        "BSTM HQ",

                    dropoff:
                        "Game City Mall",

                    fare:
                        20,

                    passenger:
                        "O847_SURVIVAL_TEST"

                }
            );


        console.log(
            create.status,
            create.body
        );


        if (
            create.status !== 201 ||
            !create.body.ride ||
            !create.body.ride.id
        ) {

            throw new Error(
                "Ride creation failed"
            );

        }


        rideId =
            create.body.ride.id;


        console.log(
            "RIDE ID:",
            rideId
        );


        // ======================================
        // 5. ACCEPT
        // ======================================

        console.log(
            "\n5. DRIVER ACCEPT"
        );


        const accept =
            await request(
                "PATCH",
                `/api/rides/${rideId}/accept`,
                {

                    driverId:
                        "O847_DRIVER",

                    driverName:
                        "O.8.47 Survival Driver"

                }
            );


        console.log(
            accept.status,
            accept.body
        );


        if (
            accept.body.ride?.status !==
            "DRIVER_ASSIGNED"
        ) {

            throw new Error(
                "Driver assignment failed"
            );

        }


        // ======================================
        // 6. LIFECYCLE
        // ======================================

        console.log(
            "\n6. CANONICAL LIFECYCLE"
        );


        const states = [

            "DRIVER_ARRIVED",

            "PICKED_UP",

            "STARTED"

        ];


        for (
            const state of states
        ) {


            const result =
                await request(
                    "PATCH",
                    `/api/rides/${rideId}`,
                    {
                        status:
                            state
                    }
                );


            console.log(
                state + ":",
                result.body.ride?.status ||
                result.body
            );


            if (
                result.body.ride?.status !==
                state
            ) {

                throw new Error(
                    `Lifecycle failed at ${state}`
                );

            }

        }


        // ======================================
        // 7. COMPLETE
        // ======================================

        console.log(
            "\n7. COMPLETE RIDE"
        );


        const complete =
            await request(
                "POST",
                "/api/ride/complete",
                {

                    id:
                        rideId,

                    driverId:
                        "O847_DRIVER"

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
        // 8. REWARD
        // ======================================

        console.log(
            "\n8. VERIFY REWARD"
        );


        const reward =
            await request(
                "POST",
                `/api/rewards/ride/${rideId}`
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
                "Exactly-once reward was not confirmed"
            );

        }


        // ======================================
        // 9. STOP
        // ======================================

        console.log(`
9. CONTROLLED BACKEND STOP
`);


        await stopOwnedBackend();


        backend =
            null;


        // ======================================
        // 10. RESTART
        // ======================================

        console.log(`
10. CONTROLLED BACKEND RESTART
`);


        startBackend();


        // ======================================
        // 11. RECOVERY
        // ======================================

        console.log(
            "\n11. WAIT FOR RECOVERY"
        );


        if (
            !await waitForHealth(
                "RESTARTED BACKEND"
            )
        ) {

            throw new Error(
                "Backend failed to recover after restart"
            );

        }


        // ======================================
        // 12. PERSISTENCE
        // ======================================

        console.log(
            "\n12. VERIFY RIDE PERSISTENCE"
        );


        const persisted =
            await request(
                "GET",
                `/api/rides/${rideId}`
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
                "COMPLETED ride did not survive restart"
            );

        }


        // ======================================
        // 13. EXACTLY ONCE
        // ======================================

        console.log(
            "\n13. VERIFY EXACTLY-ONCE AFTER RESTART"
        );


        const duplicate =
            await request(
                "POST",
                `/api/rewards/ride/${rideId}`
            );


        console.log(
            duplicate.status,
            duplicate.body
        );


        if (
            duplicate.body.status !==
            "ALREADY_REWARDED"
        ) {

            throw new Error(
                "Exactly-once reward protection failed after restart"
            );

        }


        // ======================================
        // PASS
        // ======================================

        console.log(`
==============================================
O.8.47 RESULT: PASS
==============================================

RIDE:
${rideId}

CANONICAL LIFECYCLE:
MATCHING
→ DRIVER_ASSIGNED
→ DRIVER_ARRIVED
→ PICKED_UP
→ STARTED
→ COMPLETED

RESTART:
SURVIVED

PERSISTED RIDE:
COMPLETED

PERSISTED REWARD:
ALREADY_REWARDED

EXACTLY-ONCE:
VERIFIED

BACKEND:
RECOVERED

STATE AUTHORITY:
CANONICAL

==============================================
O.8.47 COMPLETE
==============================================
`);


    } catch (
        error
    ) {


        console.error(`
==============================================
O.8.47 RESULT: FAIL
==============================================
`);


        console.error(
            error.stack ||
            error.message
        );


        process.exitCode =
            1;


    } finally {


        await stopOwnedBackend();


    }

}


run();
