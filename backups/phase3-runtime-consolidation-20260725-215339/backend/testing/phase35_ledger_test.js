

const ledger=
require("../services/economy_ledger_service");


const ride={

id:"RIDE-"+Date.now(),

driver:"DRIVER001",

fare:30,

status:"COMPLETED"

};


console.log(
"RIDE LEDGER:"
);

console.log(
ledger.recordRide(ride)
);


console.log(
"REWARD LEDGER:"
);


console.log(

ledger.recordReward({

driver:"DRIVER001",

amount:1,

currency:"THB",

ride:ride.id

})

);


console.log(
"DRIVER HISTORY:"
);


console.log(
ledger.driverHistory(
"DRIVER001"
)
);

