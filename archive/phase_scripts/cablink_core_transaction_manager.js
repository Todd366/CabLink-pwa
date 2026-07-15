const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK CORE TRANSACTION MANAGER
=========================================
`);

const rideEngine=require("./backend/rides/ride_engine");
const fareEngine=require("./backend/fare/fare_engine");
const payment=require("./backend/payments/payment_transaction_layer");
const store=require("./database/production/store_engine");
const reward=require("./backend/rewards/thb_transaction_layer");


function completeCabLinkRide(data){

// 1. Create ride

let ride=rideEngine.requestRide({

passenger:data.passenger,

pickup:data.pickup,

destination:data.destination

});


// 2. Assign driver

rideEngine.assignDriver(
ride.id,
data.driver
);


// 3. Calculate fare

let fare=fareEngine.calculate(
data.distance,
data.time
);


// 4. Complete ride

rideEngine.completeRide(
ride.id
);

ride.fare=fare;
ride.status="COMPLETED";


// 5. Persist ride

store.save(
"rides",
ride
);


// 6. Persist payment record

let transaction=
payment.createTransaction({

amount:fare,

provider:data.paymentProvider || "CASH",

status:"RECORDED"

});


// 7. Prepare THB reward

let thb=
reward.createTHBTransaction({

wallet:data.wallet || null,

amount:1

});


// 8. Final evidence

let result={

ride,

transaction,

reward:thb,

timestamp:new Date().toISOString()

};


fs.writeFileSync(

"beta/pilot/reports/LAST_COMPLETED_RIDE.json",

JSON.stringify(result,null,2)

);


return result;

}



let test=
completeCabLinkRide({

passenger:"PASSENGER-001",

driver:"DRIVER-001",

pickup:"Gaborone",

destination:"Airport",

distance:5,

time:15,

paymentProvider:"PILOT_CASH",

wallet:null

});


console.log(test);


console.log(`
=========================================

✅ CABLINK TRANSACTION LOOP CONNECTED

Flow:

Ride
 ↓
Fare
 ↓
Database
 ↓
Payment Record
 ↓
THB Reward Preparation
 ↓
Evidence Report

=========================================
`);

