
const ledger=require("./economy_ledger_service");
const wallet=require("../rewards/wallet_service");

const engine =
require("../canonical/ride_engine");

const rewardService =
require("./canonical_reward_service");


function completeRide(ride){

let completed = ride;

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

}


// calculate reward

const reward={

driver:ride.driver,

amount:1,

currency:"THB",

ride:ride.id

};


// wallet

if(wallet.add){

wallet.add(
ride.driver,
reward.amount
);

}


// ledger

ledger.recordRide(
completed
);

ledger.recordReward(
reward
);


return {

ride:completed,

fare:{

amount:ride.fare,

currency:"BWP"

},

reward

};

}


module.exports={
completeRide
};

