const http = require("http");
const { spawn } = require("child_process");

const HOST = "127.0.0.1";
const PORT = 3000;

let backend = null;

console.log(`
==============================================
CABLINK O.8.45 — DETERMINISTIC RESTART SURVIVAL
==============================================
`);

function request(method, path, body, timeout = 5000) {
    return new Promise((resolve, reject) => {

        const payload = JSON.stringify(body || {});

        const req = http.request({
            hostname: HOST,
            port: PORT,
            path,
            method,
            timeout,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload)
            }
        }, res => {

            let data = "";

            res.on("data", chunk => {
                data += chunk;
            });

            res.on("end", () => {

                let parsed;

                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }

                resolve({
                    status: res.statusCode,
                    body: parsed
                });

            });

        });

        req.on("timeout", () => {
            req.destroy(
                new Error(
                    `Request timeout: ${method} ${path}`
                )
            );
        });

        req.on("error", reject);

        if (method !== "GET") {
            req.write(payload);
        }

        req.end();

    });
}


function startBackend() {

    console.log(
        "\n[BACKEND] Starting backend..."
    );

    backend = spawn(
        "node",
        ["backend/server.js"],
        {
            cwd: process.cwd(),
            stdio: ["ignore", "pipe", "pipe"]
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


function stopBackend() {

    return new Promise(resolve => {

        if (!backend || backend.killed) {
            resolve();
            return;
        }

        console.log(
            "\n[BACKEND] Stopping controlled backend..."
        );

        const child = backend;

        const timer = setTimeout(() => {

            try {
                child.kill("SIGKILL");
            } catch {}

            resolve();

        }, 3000);

        child.once("exit", () => {

            clearTimeout(timer);

            resolve();

        });

        try {
            child.kill("SIGTERM");
        } catch {
            clearTimeout(timer);
            resolve();
        }

    });
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
                result.body.status === "ONLINE"
            ) {

                console.log(
                    `${label}: ONLINE`
                );

                return true;

            }

        } catch {}

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

    let rideId = null;

    try {

        // ======================================
        // 1. START BACKEND
        // ======================================

        console.log(
            "\n1. CONTROLLED BACKEND START"
        );

        startBackend();


        // ======================================
        // 2. WAIT FOR HEALTH
        // ======================================

        console.log(
            "\n2. WAIT FOR INITIAL HEALTH"
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
        // 3. CREATE
        // ======================================

        console.log(
            "\n3. CREATE RIDE"
        );

        const create =
            await request(
                "POST",
                "/api/rides",
                {
                    pickup: "BSTM HQ",
                    dropoff: "Game City Mall",
                    fare: 20,
                    passenger:
                        "O845_SURVIVAL_TEST"
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


        // ======================================
        // 4. ACCEPT
        // ======================================

        console.log(
            "\n4. DRIVER ACCEPT"
        );

        const accept =
            await request(
                "PATCH",
                `/api/rides/${rideId}/accept`,
                {
                    driverId:
                        "O845_DRIVER",

                    driverName:
                        "O.8.45 Survival Driver"
                }
            );

        console.log(
            accept.status,
            accept.body.ride?.status ||
            accept.body
        );


        // ======================================
        // 5. LIFECYCLE
        // ======================================

        console.log(
            "\n5. CANONICAL LIFECYCLE"
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
                        status: state
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
        // 6. COMPLETE
        // ======================================

        console.log(
            "\n6. COMPLETE"
        );

        const complete =
            await request(
                "POST",
                "/api/ride/complete",
                {
                    id: rideId,
                    driverId:
                        "O845_DRIVER"
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
        // 7. VERIFY REWARD
        // ======================================

        console.log(
            "\n7. VERIFY CANONICAL REWARD"
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
                "Expected ALREADY_REWARDED"
            );

        }


        // ======================================
        // 8. STOP BACKEND
        // ======================================

        console.log(`
8. CONTROLLED BACKEND STOP
`);

        await stopBackend();

        backend = null;

        console.log(
            "BACKEND STOPPED"
        );


        // ======================================
        // 9. RESTART BACKEND
        // ======================================

        console.log(`
9. CONTROLLED BACKEND RESTART
`);

        startBackend();


        // ======================================
        // 10. WAIT FOR RECOVERY
        // ======================================

        console.log(
            "\n10. WAIT FOR RECOVERY"
        );

        if (
            !await waitForHealth(
                "RESTARTED BACKEND"
            )
        ) {

            throw new Error(
                "Backend failed to recover"
            );

        }


        // ======================================
        // 11. VERIFY PERSISTED RIDE
        // ======================================

        console.log(
            "\n11. VERIFY RIDE PERSISTENCE"
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
                "COMPLETED state did not survive restart"
            );

        }


        // ======================================
        // 12. VERIFY EXACTLY-ONCE
        // ======================================

        console.log(
            "\n12. VERIFY EXACTLY-ONCE REWARD"
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
                "Exactly-once reward semantics failed"
            );

        }


        // ======================================
        // FINAL
        // ======================================

        console.log(`
==============================================
O.8.45 RESULT: PASS
==============================================

RIDE:
${rideId}

LIFECYCLE:
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
RECOVERED AFTER CONTROLLED RESTART

==============================================
O.8.45 COMPLETE
==============================================
`);

    } catch (error) {

        console.error(`
==============================================
O.8.45 RESULT: FAIL
==============================================
`);

        console.error(
            error.stack ||
            error.message
        );

        process.exitCode = 1;

    } finally {

        await stopBackend();

    }

}


run();
