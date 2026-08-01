const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.25 — EVENT FLOW AUDIT
==============================================
`);

const checks=[
[
"backend/routes/rides.js",
[
"acceptRide",
"transition",
"COMPLETED"
]
],

[
"backend/canonical/ride_engine.js",
[
"DRIVER_ASSIGNED",
"COMPLETED",
"acceptRide"
]
],

[
"backend/services/canonical_reward_service.js",
[
"THB_REWARD",
"ALREADY_REWARDED",
"REWARD_CREATED"
]
],

[
"frontend/js/rides/completionRewardBridge.js",
[
"cablinkRideStateChanged",
"cablinkRewardCreated",
"CABLINK_REWARD.calculate"
]
]

];


for(const item of checks){

const file=item[0];

console.log("\nFILE:",file);

if(!fs.existsSync(file)){
 console.log("MISSING");
 continue;
}

const data=fs.readFileSync(file,"utf8");

for(const key of item[1]){

console.log(
 key,
 data.includes(key)
 ? "OK"
 : "MISSING"
);

}

}


console.log(`
==============================================
O.8.25 COMPLETE
==============================================
`);
