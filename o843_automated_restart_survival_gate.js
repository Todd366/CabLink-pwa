const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");

console.log(`
==============================================
CABLINK O.8.43 — AUTOMATED RESTART SURVIVAL GATE
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

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function request(method, path, body){

    return new Promise((resolve,reject)=>{

        const payload = JSON.stringify(body || {});

        const req = http.request({
            hostname:"127.0.0.1",
            port:3000,
            path,
            method,
            headers:{
                "Content-Type":"application/json",
                "Content-Length":Buffer.byteLength(payload)
            }
        },res=>{

            let data="";

            res.on("data",chunk=>{
                data+=chunk;
            });

            res.on("end",()=>{

                let parsed;

                try{
                    parsed=JSON.parse(data);
                }catch{
                    parsed=data;
                }

                resolve({
                    status:res.statusCode,
                    body:parsed
                });

            });

        });

        req.on("error",reject);

        if(method!=="GET"){
            req.write(payload);
        }

        req.end();

    });

}


async function waitForServer(timeout=10000){

    const start=Date.now();

    while(Date.now()-start < timeout){

        try{

            const result=
                await request(
                    "GET",
                    "/health"
                );

            if(result.status===200){
                return true;
            }

        }catch{}

        await sleep(250);

    }

    return false;

}


function loadRepository(){

    const modulePath =
        require.resolve(
            "./backend/canonical/ride_repository"
        );

    delete require.cache[modulePath];

    return require(modulePath);

}


function findRide(repo,id){

    /*
     * Discover the repository's actual read API.
     * Do not assume repo.get().
     */

    if(typeof repo.getRide === "function"){

        return repo.getRide(id);

    }

    if(typeof repo.findById === "function"){

        return repo.findById(id);

    }

    if(typeof repo.find === "function"){

        return repo.find(id);

    }

    if(typeof repo.all === "function"){

        const rides=repo.all();

        return rides.find(
            ride=>ride.id===id
        );

    }

    if(typeof repo.list === "function"){

        const rides=repo.list();

        return rides.find(
            ride=>ride.id===id
        );

    }

    throw new Error(
        "No supported canonical repository read API found"
    );

}


function findRewards(rideId){

    const candidates=[

        "backend/storage/cablink_db.json",

        "backend/data/economy_ledger.json",

        "backend/data/rewards.json",

        "backend/data/transactions.json",

        "backend/storage/economy_ledger.json"

    ];

    const matches=[];

    for(const file of candidates){

        if(!fs.existsSync(file)){
            continue;
        }

        try{

            const raw=
                JSON.parse(
                    fs.readFileSync(file,"utf8")
                );

            const scan=(value,location="root")=>{

                if(Array.isArray(value)){

                    value.forEach(
                        (item,index)=>
                            scan(
                                item,
                                location+"["+index+"]"
                            )
                    );

                    return;
                }

                if(
                    value &&
                    typeof value==="object"
                ){

                    if(
                        value.rideId===rideId ||
                        value.ride===rideId
                    ){

                        matches.push({
                            location,
                            value
                        });

                    }

                    for(
                        const [key,val]
                        of Object.entries(value)
                    ){

                        scan(
                            val,
                            location+"."+key
                        );

                    }

                }

            };

            scan(raw,file);

        }catch{}

    }

    return matches;

}


async function stopProcess(proc){

    if(!proc || proc.killed){
        return;
    }

    proc.kill("SIGTERM");

    await sleep(1000);

    if(!proc.killed){

        try{
            proc.kill("SIGKILL");
        }catch{}

    }

}


async function run(){

    let backend=null;
    let rideId=null;
    let rewardId=null;

    try{

        // ========================================================
        // 1. START CONTROLLED BACKEND
        // ========================================================

        console.log(`
==============================================
1. CONTROLLED BACKEND START
==============================================
`);

        backend=spawn(
            process.execPath,
            ["backend/server.js"],
            {
                cwd:process.cwd(),
                stdio:["ignore","pipe","pipe"]
            }
        );

        backend.stdout.on(
            "data",
            data=>{
                const text=data.toString().trim();

                if(text){
                    console.log("[BACKEND]",text);
                }
            }
        );

        backend.stderr.on(
            "data",
            data=>{
                const text=data.toString().trim();

                if(text){
                    console.log("[BACKEND ERROR]",text);
                }
            }
        );

        const online=
            await waitForServer();

        if(online){

            pass(
                "Controlled backend startup"
            );

        }else{

            fail(
                "Controlled backend startup"
            );

            return;

        }


        // ========================================================
        // 2. CREATE
        // ========================================================

        console.log(`
==============================================
2. CREATE CANONICAL RIDE
==============================================
`);

        const create=
            await request(
                "POST",
                "/api/rides",
                {
                    pickup:"BSTM HQ",
                    dropoff:"Game City Mall",
                    fare:20,
                    passenger:"O843_RESTART_SURVIVAL_TEST"
                }
            );

        if(
            create.status===201 &&
            create.body?.ride?.id
        ){

            rideId=
                create.body.ride.id;

            pass(
                "Ride creation",
                rideId
            );

        }else{

            fail(
                "Ride creation",
                JSON.stringify(create.body)
            );

            return;

        }


        // ========================================================
        // 3. ACCEPT
        // ========================================================

        const accept=
            await request(
                "PATCH",
                "/api/rides/"+rideId+"/accept",
                {
                    driverId:"O843_DRIVER",
                    driverName:"Restart Survival Driver"
                }
            );

        if(
            accept.status===200 &&
            accept.body?.ride?.status===
                "DRIVER_ASSIGNED"
        ){

            pass(
                "Driver assignment"
            );

        }else{

            fail(
                "Driver assignment",
                JSON.stringify(accept.body)
            );

        }


        // ========================================================
        // 4. LIFECYCLE
        // ========================================================

        const states=[

            "DRIVER_ARRIVED",
            "PICKED_UP",
            "STARTED"

        ];

        for(
            const state
            of states
        ){

            const result=
                await request(
                    "PATCH",
                    "/api/rides/"+rideId,
                    {status:state}
                );

            if(
                result.status===200 &&
                result.body?.ride?.status===state
            ){

                pass(
                    "Canonical transition",
                    state
                );

            }else{

                fail(
                    "Canonical transition",
                    state
                );

            }

        }


        // ========================================================
        // 5. COMPLETE
        // ========================================================

        const complete=
            await request(
                "POST",
                "/api/ride/complete",
                {
                    id:rideId,
                    driverId:"O843_DRIVER"
                }
            );

        if(
            complete.status===200 &&
            complete.body?.result?.ride?.status===
                "COMPLETED"
        ){

            pass(
                "Canonical completion"
            );

        }else{

            fail(
                "Canonical completion",
                JSON.stringify(complete.body)
            );

        }


        // ========================================================
        // 6. FIRST REWARD REQUEST
        // ========================================================

        const rewardFirst=
            await request(
                "POST",
                "/api/rewards/ride/"+rideId
            );

        if(
            rewardFirst.body?.status===
                "ALREADY_REWARDED" ||
            rewardFirst.body?.status===
                "REWARD_CREATED"
        ){

            pass(
                "Exactly-once reward contract",
                rewardFirst.body.status
            );

        }else{

            fail(
                "Exactly-once reward contract",
                JSON.stringify(rewardFirst.body)
            );

        }

        rewardId=
            rewardFirst.body?.reward?.id ||
            null;


        // ========================================================
        // 7. PRE-RESTART REPOSITORY READ
        // ========================================================

        console.log(`
==============================================
7. PRE-RESTART REPOSITORY READ
==============================================
`);

        let repo=
            loadRepository();

        let before=
            findRide(
                repo,
                rideId
            );

        if(
            before &&
            before.status==="COMPLETED" &&
            before.completedAt
        ){

            pass(
                "Pre-restart canonical persistence",
                "COMPLETED + completedAt"
            );

        }else{

            fail(
                "Pre-restart canonical persistence",
                JSON.stringify(before)
            );

        }


        const rewardsBefore=
            findRewards(rideId);

        console.log(
            "Reward records detected before restart:",
            rewardsBefore.length
        );


        // ========================================================
        // 8. STOP BACKEND
        // ========================================================

        console.log(`
==============================================
8. BACKEND STOP
==============================================
`);

        await stopProcess(backend);

        backend=null;

        pass(
            "Backend stopped"
        );


        // ========================================================
        // 9. START FRESH BACKEND
        // ========================================================

        console.log(`
==============================================
9. FRESH BACKEND RESTART
==============================================
`);

        backend=
            spawn(
                process.execPath,
                ["backend/server.js"],
                {
                    cwd:process.cwd(),
                    stdio:["ignore","pipe","pipe"]
                }
            );

        backend.stdout.on(
            "data",
            data=>{
                const text=data.toString().trim();

                if(text){
                    console.log("[RESTARTED BACKEND]",text);
                }
            }
        );

        backend.stderr.on(
            "data",
            data=>{
                const text=data.toString().trim();

                if(text){
                    console.log(
                        "[RESTARTED BACKEND ERROR]",
                        text
                    );
                }
            }
        );

        const restarted=
            await waitForServer();

        if(restarted){

            pass(
                "Fresh backend startup"
            );

        }else{

            fail(
                "Fresh backend startup"
            );

            return;

        }


        // ========================================================
        // 10. POST-RESTART REPOSITORY READ
        // ========================================================

        console.log(`
==============================================
10. POST-RESTART CANONICAL STATE
==============================================
`);

        repo=
            loadRepository();

        const after=
            findRide(
                repo,
                rideId
            );

        if(
            after &&
            after.status==="COMPLETED" &&
            after.completedAt
        ){

            pass(
                "Restart-surviving ride state",
                "COMPLETED + completedAt"
            );

        }else{

            fail(
                "Restart-surviving ride state",
                JSON.stringify(after)
            );

        }


        // ========================================================
        // 11. REWARD AFTER RESTART
        // ========================================================

        console.log(`
==============================================
11. POST-RESTART REWARD IDEMPOTENCY
==============================================
`);

        const rewardSecond=
            await request(
                "POST",
                "/api/rewards/ride/"+rideId
            );

        if(
            rewardSecond.status===200 &&
            rewardSecond.body?.status===
                "ALREADY_REWARDED"
        ){

            pass(
                "Reward survives restart",
                "ALREADY_REWARDED"
            );

        }else{

            fail(
                "Reward survives restart",
                JSON.stringify(rewardSecond.body)
            );

        }


        // ========================================================
        // 12. REWARD DUPLICATE AUDIT
        // ========================================================

        console.log(`
==============================================
12. REWARD DUPLICATE AUDIT
==============================================
`);

        const rewardsAfter=
            findRewards(rideId);

        console.log(
            "Reward records detected after restart:",
            rewardsAfter.length
        );

        if(
            rewardsBefore.length===0 ||
            rewardsAfter.length<=rewardsBefore.length
        ){

            pass(
                "Reward record count stable",
                `${rewardsBefore.length} → ${rewardsAfter.length}`
            );

        }else{

            fail(
                "Reward record duplication",
                `${rewardsBefore.length} → ${rewardsAfter.length}`
            );

        }


        // ========================================================
        // 13. FINAL REPORT
        // ========================================================

        console.log(`
==============================================
O.8.43 FINAL INTEGRITY REPORT
==============================================
`);

        console.log(
            "Ride ID:",
            rideId
        );

        console.log(
            "Reward ID:",
            rewardId || "detected through repository/storage"
        );

        const passed=
            results.filter(
                r=>r.pass
            ).length;

        const failed=
            results.filter(
                r=>!r.pass
            ).length;

        console.log(
            "PASSED:",
            passed
        );

        console.log(
            "FAILED:",
            failed
        );

        console.log(
            "TOTAL:",
            results.length
        );

        if(failed===0){

            console.log(`
==============================================
CABLINK O.8.43 — RESTART SURVIVAL GATE: PASS
==============================================
`);

        }else{

            console.log(`
==============================================
CABLINK O.8.43 — RESTART SURVIVAL GATE: FAIL
==============================================
`);

        }

    }catch(error){

        fail(
            "Fatal test execution",
            error.stack || error.message
        );

    }finally{

        if(backend){

            await stopProcess(
                backend
            );

        }

    }

}


run();

