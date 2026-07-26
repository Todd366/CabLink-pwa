
const ledger=require("./economy_ledger_service");
const wallet=require("../rewards/wallet_service");


function completeRide(ride){

const completed={

...ride,

status:"COMPLETED",

completedAt:new Date().toISOString()

};


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

