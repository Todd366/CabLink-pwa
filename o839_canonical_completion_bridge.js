const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.39 — CANONICAL COMPLETION BRIDGE
==============================================
`);

function backup(file,tag){

const dir="backups/"+tag;

fs.mkdirSync(dir,{recursive:true});

fs.copyFileSync(
file,
dir+"/"+file.split("/").pop()
);

console.log("BACKUP:",dir);

}


// ==========================================
// PATCH COMPLETION ROUTE
// ==========================================

const route =
"backend/routes/completion_api.js";

backup(
route,
"o839_completion_route"
);

let r=
fs.readFileSync(route,"utf8");


r=r.replace(
`completion.completeRide(
req.body
)`,
`completion.completeRide({

id:req.body.id,

driverId:req.body.driverId

})`
);


fs.writeFileSync(route,r);

console.log(
"completion_api patched"
);


// ==========================================
// PATCH COMPLETION SERVICE
// ==========================================

const service =
"backend/services/ride_completion_service.js";


backup(
service,
"o839_completion_service"
);


let s=
fs.readFileSync(service,"utf8");


// add canonical reward import

if(!s.includes("canonical_reward_service")){

s=s.replace(
`const wallet=require("../rewards/wallet_service");`,
`const wallet=require("../rewards/wallet_service");

const rewardService =
require("./canonical_reward_service");`
);

}


// replace legacy reward recording

s=s.replace(
`ledger.recordReward(
reward
);`,
`const canonicalReward =
rewardService.createRewardForCompletedRide(
completed.id
);`
);


// include canonical reward response

s=s.replace(
`reward

};`,
`reward:
canonicalReward

};`
);


fs.writeFileSync(service,s);


console.log(
"ride_completion_service patched"
);


console.log(`
==============================================
O.8.39 COMPLETE
==============================================
`);
