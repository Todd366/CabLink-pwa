'use strict';

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 3000;

let rideId = null;

console.log(`
============================================================
CABLINK O.8.53 — REAL END-TO-END CANONICAL RIDE TEST
============================================================
REAL BACKEND
REAL DATABASE
REAL API
NO REPLACEMENT BACKEND
NO DESTRUCTIVE CHANGES
============================================================
`);

function request(method, path, body = null, timeout = 5000) {

    return new Promise((resolve, reject) => {

        const payload =
            body !== null &&
            body !== undefined
                ? JSON.stringify(body)
                : null;

        const headers = {};

        if (payload) {

            headers['Content-Type'] =
                'application/json';

            headers['Content-Length'] =
                Buffer.byteLength(payload);

        }

        const req =
            http.request(
                {
                    hostname: HOST,
                    port: PORT,
                    path,
                    method,
                    timeout,
                    headers
                },
                res => {

                    let data = '';

                    res.on(
                        'data',
                        chunk =>
                            data += chunk
                    );

                    res.on(
                        'end',
                        () => {

                            let parsed;

                            try {

                                parsed =
                                    data
                                        ? JSON.parse(data)
                                        : {};

                            } catch {

                                parsed =
                                    data;

                            }

                            resolve({

                                status:
                                    res.statusCode,

                                body:
                                    parsed

                            });

                        }
                    );

                }
            );

        req.on(
            'timeout',
            () => {

                req.destroy(
                    new Error(
                        `Timeout: ${method} ${path}`
                    )
                );

            }
        );

        req.on(
            'error',
            reject
        );

        if (payload) {

            req.write(
                payload
            );

        }

        req.end();

    });

}


function pass(label, value) {

    console.log(
        `PASS: ${label}`,
        value !== undefined
            ? value
            : ''
    );

}


function fail(label, value) {

    console.error(
        `FAIL: ${label}`,
        value !== undefined
            ? value
            : ''
    );

    throw new Error(label);

}


async function run() {

    try {

        // ====================================================
        // 1. BACKEND HEALTH
        // ====================================================

        console.log(`
============================================================
1. BACKEND HEALTH
============================================================
`);

        const health =
            await request(
                'GET',
                '/health'
            );

        console.log(
            health.status,
            health.body
        );

        if (
            health.status !== 200
        ) {

            fail(
                'Backend health check failed'
            );

        }

        pass(
            'Canonical backend ONLINE'
        );


        // ====================================================
        // 2. CREATE PASSENGER RIDE
        // ====================================================

        console.log(`
============================================================
2. PASSENGER — CREATE RIDE
============================================================
`);

        const create =
            await request(
                'POST',
                '/api/rides',
                {

                    pickup:
                        'BSTM HQ',

                    dropoff:
                        'Game City Mall',

                    vehicle:
                        'standard',

                    fare:
                        20,

                    passenger:
                        'O853_REAL_E2E_PASSENGER'

                }
            );

        console.log(
            create.status,
            create.body
        );

        if (
            create.status !== 200 &&
            create.status !== 201
        ) {

            fail(
                'Ride creation failed'
            );

        }

        rideId =
            create.body.ride?.id ||
            create.body.id;

        if (
            !rideId
        ) {

            fail(
                'Ride ID was not returned'
            );

        }

        pass(
            'Ride created',
            rideId
        );


        // ====================================================
        // 3. VERIFY RIDE
        // ====================================================

        console.log(`
============================================================
3. VERIFY CREATED RIDE
============================================================
`);

        const createdRide =
            await request(
                'GET',
                `/api/rides/${rideId}`
            );

        console.log(
            createdRide.status,
            createdRide.body
        );

        if (
            createdRide.status !== 200
        ) {

            fail(
                'Created ride could not be retrieved'
            );

        }

        pass(
            'Ride persisted and retrievable'
        );


        // ====================================================
        // 4. DRIVER ONLINE
        // ====================================================

        console.log(`
============================================================
4. DRIVER — GO ONLINE
============================================================
`);

        const driverOnline =
            await request(
                'POST',
                '/api/drivers/online',
                {

                    driverId:
                        'O853_DRIVER',

                    driverName:
                        'O.8.53 Test Driver',

                    vehicle:
                        'standard',

                    lat:
                        -24.6541,

                    lng:
                        25.9087

                }
            );

        console.log(
            driverOnline.status,
            driverOnline.body
        );

        if (
            driverOnline.status >= 200 &&
            driverOnline.status < 300
        ) {

            pass(
                'Driver online API available'
            );

        } else {

            console.log(
                'INFO: Driver online endpoint not available at this path.'
            );

            console.log(
                'The canonical backend may use a different driver-registration route.'
            );

        }


        // ====================================================
        // 5. CHECK RIDE LIST
        // ====================================================

        console.log(`
============================================================
5. DRIVER — CHECK RIDE AVAILABILITY
============================================================
`);

        const rides =
            await request(
                'GET',
                '/api/rides'
            );

        console.log(
            rides.status,
            rides.body
        );

        if (
            rides.status !== 200
        ) {

            fail(
                'Ride list unavailable'
            );

        }

        const rideList =
            rides.body.rides ||
            [];

        const listedRide =
            rideList.find(
                r =>
                    r.id ===
                    rideId
            );

        if (
            listedRide
        ) {

            pass(
                'Created ride visible in ride list',
                listedRide.status
            );

        } else {

            console.log(
                'INFO: Created ride not found in summary list.'
            );

        }


        // ====================================================
        // 6. DRIVER ACCEPT
        // ====================================================

        console.log(`
============================================================
6. DRIVER — ACCEPT RIDE
============================================================
`);

        const accept =
            await request(
                'PATCH',
                `/api/rides/${rideId}/accept`,
                {

                    driverId:
                        'O853_DRIVER',

                    driverName:
                        'O.8.53 Test Driver'

                }
            );

        console.log(
            accept.status,
            accept.body
        );

        if (
            accept.status >= 200 &&
            accept.status < 300
        ) {

            pass(
                'Driver accepted ride'
            );

        } else {

            console.log(
                'INFO: Canonical accept route not available at expected path.'
            );

            console.log(
                'The actual backend route contract must be resolved before UI driver acceptance is wired.'
            );

        }


        // ====================================================
        // 7. READ CURRENT STATE
        // ====================================================

        console.log(`
============================================================
7. READ CURRENT CANONICAL STATE
============================================================
`);

        const current =
            await request(
                'GET',
                `/api/rides/${rideId}`
            );

        console.log(
            current.status,
            current.body
        );

        const currentRide =
            current.body.ride ||
            current.body;

        console.log(
            'CURRENT STATUS:',
            currentRide.status
        );


        // ====================================================
        // 8. CANONICAL LIFECYCLE
        // ====================================================

        console.log(`
============================================================
8. CANONICAL LIFECYCLE
============================================================
`);

        const lifecycle = [

            'DRIVER_ARRIVED',

            'PICKED_UP',

            'STARTED'

        ];

        for (
            const state
            of lifecycle
        ) {

            const transition =
                await request(
                    'PATCH',
                    `/api/rides/${rideId}`,
                    {
                        status:
                            state
                    }
                );

            console.log(
                state,
                '→',
                transition.status,
                transition.body
            );

            const resultingRide =
                transition.body.ride ||
                transition.body;

            if (
                resultingRide.status ===
                state
            ) {

                pass(
                    `Lifecycle reached ${state}`
                );

            } else {

                console.log(
                    `INFO: ${state} was not accepted by current API.`
                );

                break;

            }

        }


        // ====================================================
        // 9. COMPLETE
        // ====================================================

        console.log(`
============================================================
9. COMPLETE RIDE
============================================================
`);

        const complete =
            await request(
                'POST',
                '/api/ride/complete',
                {

                    id:
                        rideId,

                    driverId:
                        'O853_DRIVER'

                }
            );

        console.log(
            complete.status,
            complete.body
        );

        if (
            complete.status >= 200 &&
            complete.status < 300
        ) {

            pass(
                'Completion endpoint responded'
            );

        } else {

            console.log(
                'INFO: Completion endpoint not available at expected path.'
            );

        }


        // ====================================================
        // 10. FINAL RIDE STATE
        // ====================================================

        console.log(`
============================================================
10. FINAL CANONICAL RIDE STATE
============================================================
`);

        const finalRideResponse =
            await request(
                'GET',
                `/api/rides/${rideId}`
            );

        console.log(
            finalRideResponse.status,
            finalRideResponse.body
        );

        const finalRide =
            finalRideResponse.body.ride ||
            finalRideResponse.body;

        console.log(
            'FINAL STATUS:',
            finalRide.status
        );


        // ====================================================
        // 11. REWARD
        // ====================================================

        console.log(`
============================================================
11. REWARD TEST
============================================================
`);

        const reward =
            await request(
                'POST',
                `/api/rewards/ride/${rideId}`
            );

        console.log(
            reward.status,
            reward.body
        );

        if (
            reward.status >= 200 &&
            reward.status < 300
        ) {

            pass(
                'Reward endpoint responded'
            );

        } else {

            console.log(
                'INFO: Reward endpoint not available at expected path.'
            );

        }


        // ====================================================
        // 12. DUPLICATE REWARD
        // ====================================================

        console.log(`
============================================================
12. EXACTLY-ONCE REWARD TEST
============================================================
`);

        const duplicate =
            await request(
                'POST',
                `/api/rewards/ride/${rideId}`
            );

        console.log(
            duplicate.status,
            duplicate.body
        );

        if (
            duplicate.body?.status ===
            'ALREADY_REWARDED'
        ) {

            pass(
                'Exactly-once reward protection confirmed'
            );

        } else {

            console.log(
                'INFO: Exactly-once reward result not confirmed by current endpoint.'
            );

        }


        // ====================================================
        // FINAL
        // ====================================================

        console.log(`
============================================================
O.8.53 RESULT
============================================================
`);

        console.log(
            'TEST RIDE:',
            rideId
        );

        console.log(
            'FINAL STATUS:',
            finalRide.status
        );

        console.log(`
IMPORTANT:

This test does NOT replace or modify the backend.

It records exactly which parts of the canonical
ride lifecycle are currently exposed by the real API.

NEXT:

If all critical endpoints respond:
→ proceed to frontend UI integration.

If some endpoints are missing:
→ connect the existing backend services/routes.

Do NOT create a second backend.
Do NOT replace the canonical repository.
`);

        console.log(`
============================================================
O.8.53 COMPLETE
============================================================
`);

    } catch (
        error
    ) {

        console.error(`
============================================================
O.8.53 RESULT: TEST STOPPED
============================================================
`);

        console.error(
            error.stack ||
            error.message
        );

        process.exitCode =
            1;

    }

}

run();

