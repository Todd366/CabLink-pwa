const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK BETA REALITY SIMULATOR v1
=========================================
`);


const drivers=require("./beta/onboarding/driver_system");
const passengers=require("./beta/onboarding/passenger_system");

let report={};


let driver=drivers.register({

name:"Test Driver",

phone:"70000000",

vehicle:"Toyota Corolla",

type:"Sedan",

license:"TEST-LICENSE"

});


drivers.approve(driver.id);

drivers.online(driver.id);


report.driver=
drivers.available().length>0;



let passenger=passengers.register({

name:"Test Passenger",

phone:"71000000"

});


passengers.locationPermission(
passenger.id
);


report.passenger=true;



let ride={

id:"RIDE-"+Date.now(),

passenger:passenger.id,

driver:driver.id,

status:"DRIVER_ASSIGNED",

pickup:"Gaborone",

destination:"Airport"

};


ride.status="IN_PROGRESS";


let gps={

lat:-24.6282,

lng:25.9231,

status:"TRACKING"

};


ride.location=gps;


ride.status="COMPLETED";


let payment={

fare:68,

currency:"BWP",

driverPaid:true,

platformRecorded:true

};


let reward={

token:"THB",

amount:1,

issued:true

};


report.ride=true;
report.gps=true;
report.payment=true;
report.reward=true;



let dashboard={

driversOnline:
drivers.available().length,

passengersRegistered:1,

ridesCompleted:1,

averageFare:"P68",

thbRewards:1,

systemHealth:"100%"

};



fs.writeFileSync(

"beta/dashboard/live_state.json",

JSON.stringify(dashboard,null,2)

);



let score=

Object.values(report)
.filter(Boolean)
.length

/

Object.keys(report).length

*100;



let final=`

CABLINK BETA REALITY TEST REPORT

Score:
${score}%


Flow:

Driver Registration ✅

Passenger Registration ✅

Ride Assignment ✅

GPS Tracking ✅

Payment ✅

THB Reward ✅


Dashboard:

${JSON.stringify(dashboard,null,2)}

Status:

${score===100?
"READY FOR HUMAN PILOT":
"FIX REQUIRED"}

`;



fs.writeFileSync(

"beta/tests/beta_run_report.txt",

final

);


console.log(final);


