const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");

console.log(`
==============================================
CABLINK O.8.42 — PERSISTENCE & RESTART INTEGRITY
==============================================
`);

const results = [];

function pass(name, detail=""){
    results.push({name, pass:true});
    console.log(`PASS  ${name}${detail ? " — "+detail : ""}`);
}

function fail(name, detail=""){
    results.push({name, pass:false});
    console.log(`FAIL  ${name}${detail ? " — "+detail : ""}`);
}

function request(method, path, body){

    return new Promise((resolve,reject)=>{

        const payload = JSON.stringify(body || {});

        const req = http.request({
            hostname:"localhost",
            port:3000,
            path,
            method,
            headers:{
                "Content-Type":"application/json",
                "Content-Length":Buffer.byteLength(payload)
            }
        }, res => {

            let data="";

            res.on("data", chunk => data += chunk);

            res.on("end", ()=>{

                let parsed;

                try{
                    parsed = JSON.parse(data);
                }catch{
                    parsed = data;
                }

                resolve({
                    status:res.statusCode,
                    body:parsed
                });

            });

        });

        req.on("error",reject);

        if(method !== "GET"){
            req.write(payload);
        }

        req.end();

    });

}


function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}


function loadCanonicalRepository(){

    delete require.cache[
        require.resolve("./backend/canonical/ride_repository")
    ];

    return require(
        "./backend/canonical/ride_repository"
    );

}


async function run(){

    let rideId = null;
    let rewardId = null;
    let rewardCountBefore = null;
    let rewardCountAfter = null;

    // ============================================================
    // 1. CREATE RIDE
    // ============================================================

    console.log(`
==============================================
1. CREATE TEST RIDE
==============================================
`);

    const create = await request(
        "POST",
        "/api/rides",
        {
            pickup:"BSTM HQ",
            dropoff:"Game City Mall",
            fare:20,
            passenger:"O842_PERSISTENCE_TEST"
        }
    );

    if(
        create.status === 201 &&
        create.body &&
        create.body.ride &&
        create.body.ride.id
    ){

        rideId = create.body.ride.id;

        pass(
            "Ride creation",
            rideId
        );

    }else{

        fail(
            "Ride creation",
            JSON.stringify(create.body)
        );

        process.exit(1);

    }


    // ============================================================
    // 2. ACCEPT RIDE
    // ============================================================

    console.log(`
==============================================
2. ACCEPT RIDE
==============================================
`);

    const accept = await request(
        "PATCH",
        "/api/rides/"+rideId+"/accept",
        {
            driverId:"O842_DRIVER",
            driverName:"Persistence Test Driver"
        }
    );

    if(
        accept.status === 200 &&
        accept.body &&
        accept.body.ride &&
        accept.body.ride.status === "DRIVER_ASSIGNED"
    ){

        pass(
            "Driver assignment",
            "DRIVER_ASSIGNED"
        );

    }else{

        fail(
            "Driver assignment",
            JSON.stringify(accept.body)
        );

    }


    // ============================================================
    // 3. CANONICAL LIFECYCLE
    // ============================================================

    console.log(`
==============================================
3. CANONICAL LIFECYCLE
==============================================
`);

    const states = [
        "DRIVER_ARRIVED",
        "PICKED_UP",
        "STARTED"
    ];

    for(const status of states){

        const result = await request(
            "PATCH",
            "/api/rides/"+rideId,
            {status}
        );

        if(
            result.status === 200 &&
            result.body &&
            result.body.ride &&
            result.body.ride.status === status
        ){

            pass(
                "Canonical transition",
                status
            );

        }else{

            fail(
                "Canonical transition",
                status+" "+JSON.stringify(result.body)
            );

        }

    }


    // ============================================================
    // 4. COMPLETE RIDE
    // ============================================================

    console.log(`
==============================================
4. COMPLETE RIDE
==============================================
`);

    const complete = await request(
        "POST",
        "/api/ride/complete",
        {
            id:rideId,
            driverId:"O842_DRIVER"
        }
    );

    if(
        complete.status === 200 &&
        complete.body &&
        complete.body.result &&
        complete.body.result.ride &&
        complete.body.result.ride.status === "COMPLETED"
    ){

        pass(
            "Canonical completion",
            "COMPLETED"
        );

    }else{

        fail(
            "Canonical completion",
            JSON.stringify(complete.body)
        );

    }


    // ============================================================
    // 5. REWARD CREATED
    // ============================================================

    console.log(`
==============================================
5. REWARD CREATION
==============================================
`);

    const reward = await request(
        "POST",
        "/api/rewards/ride/"+rideId
    );

    if(
        reward.status === 200 &&
        reward.body &&
        reward.body.status === "ALREADY_REWARDED"
    ){

        pass(
            "Exactly-once reward",
            "completion already created reward"
        );

    }else if(
        reward.status === 201 &&
        reward.body &&
        reward.body.status === "REWARD_CREATED"
    ){

        pass(
            "Exactly-once reward",
            "reward created"
        );

    }else{

        fail(
            "Reward creation",
            JSON.stringify(reward.body)
        );

    }


    if(
        reward.body &&
        reward.body.reward &&
        reward.body.reward.id
    ){

        rewardId =
            reward.body.reward.id;

    }


    // ============================================================
    // 6. READ CANONICAL STATE BEFORE RESTART
    // ============================================================

    console.log(`
==============================================
6. PRE-RESTART CANONICAL STATE
==============================================
`);

    let repo =
        loadCanonicalRepository();

    let before =
        repo.get(rideId);

    if(
        before &&
        before.status === "COMPLETED" &&
        before.completedAt
    ){

        pass(
            "Pre-restart ride persistence",
            "COMPLETED + completedAt"
        );

    }else{

        fail(
            "Pre-restart ride persistence",
            JSON.stringify(before)
        );

    }


    // ============================================================
    // 7. RESTART BACKEND
    // ============================================================

    console.log(`
==============================================
7. BACKEND RESTART
==============================================
`);

    console.log(
        "Restart test requires backend process restart."
    );

    console.log(
        "Please stop the current backend with CTRL+C,"
    );

    console.log(
        "then restart it with: npm start"
    );

    console.log(`
==============================================
O.8.42 CHECKPOINT
==============================================
`);

    console.log(
        "Ride ID:",
        rideId
    );

    console.log(
        "Reward ID:",
        rewardId || "unknown"
    );

    console.log(`
After restart, run:

node o842_persistence_restart_verify.js ${rideId}

`);

}


run().catch(error=>{

console.error(
"FATAL:",
error
);

process.exit(1);

});

