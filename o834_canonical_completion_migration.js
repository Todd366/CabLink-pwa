const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.34 — CANONICAL COMPLETION MIGRATION
==============================================
`);

const file =
"backend/services/ride_completion_service.js";

const backupDir =
"backups/o834_auto";

if(!fs.existsSync(backupDir)){
 fs.mkdirSync(backupDir,{recursive:true});
}

fs.copyFileSync(
 file,
 backupDir+"/ride_completion_service.js"
);

let d=fs.readFileSync(file,"utf8");

if(!d.includes('require("../canonical/ride_engine")')){

d=d.replace(
'const wallet=require("../rewards/wallet_service");',
`const wallet=require("../rewards/wallet_service");

const engine =
require("../canonical/ride_engine");

const rewardService =
require("./canonical_reward_service");`
);

}

const oldBlock =
`const completed={

...ride,

status:"COMPLETED",

completedAt:new Date().toISOString()

};`;

const newBlock =
`let completed = ride;

const canonicalRide =
engine.getRide(ride.id);

if(canonicalRide){

const transition =
engine.transition(
 ride.id,
 engine.STATES.COMPLETED,
 {
  driverId:
   ride.driverId ||
   ride.driver
 }
);

if(!transition.success){

return {
 success:false,
 error:"Canonical completion failed",
 details:transition
};

}

completed =
engine.getRide(ride.id);

}else{

completed={
 ...ride,
 status:"COMPLETED",
 completedAt:new Date().toISOString()
};

}`;

if(d.includes(oldBlock)){
 d=d.replace(oldBlock,newBlock);
 console.log("Completion logic migrated");
}else{
 console.log("Completion block already migrated or not found");
}


fs.writeFileSync(file,d);

console.log(`
BACKUP:
${backupDir}/ride_completion_service.js

==============================================
O.8.34 COMPLETE
==============================================
`);
