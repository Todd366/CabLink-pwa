const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.27 — REWARD PIPELINE VERIFICATION
==============================================
`);

const checks=[

[
"backend/services/canonical_reward_service.js",
[
"ALREADY_REWARDED",
"REWARD_CREATED",
"THB_REWARD"
]
],

[
"backend/routes/canonical_reward_api.js",
[
"REWARD_CREATED",
"ALREADY_REWARDED"
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


let failed=false;


for(const [file,items] of checks){

console.log("\nFILE:",file);

if(!fs.existsSync(file)){
 console.log("MISSING FILE");
 failed=true;
 continue;
}


let data=fs.readFileSync(file,"utf8");


for(const item of items){

let ok=data.includes(item);

console.log(
item,
ok?"PASS":"FAIL"
);

if(!ok) failed=true;

}

}


console.log(`

==============================================
RESULT
==============================================
`);

console.log(
failed
?"PIPELINE NEEDS FIXES"
:"REWARD PIPELINE STRUCTURE PASS"
);


console.log(`
==============================================
O.8.27 COMPLETE
==============================================
`);

