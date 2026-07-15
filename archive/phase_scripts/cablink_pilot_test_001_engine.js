const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PILOT TEST 001
CONTROLLED HUMAN RIDE SIMULATION
=========================================
`);

const dirs=[
"beta/pilot",
"beta/pilot/rides",
"beta/pilot/feedback",
"beta/pilot/reports"
];

dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
});


// PILOT PARTICIPANTS

const driver={
id:"DRIVER-001",
name:"Pilot Driver",
status:"ONLINE",
location:{
lat:-24.6200,
lng:25.9100
}
};


const passenger={
id:"PASSENGER-001",
name:"Pilot Passenger",
status:"READY",
location:{
lat:-24.6282,
lng:25.9231
}
};


// RIDE EVENT

const ride={

id:"PILOT-RIDE-001",

driver:driver.id,

passenger:passenger.id,

pickup:"Gaborone Pilot Zone",

destination:"Airport",

status:"COMPLETED",

distanceKm:5,

durationMinutes:15,

fare:35,

reward:{

token:"THB",

amount:1,

status:"RECORDED"

},

timestamp:new Date().toISOString()

};


fs.writeFileSync(

"beta/pilot/rides/PILOT-RIDE-001.json",

JSON.stringify(ride,null,2)

);


// FEEDBACK FORM

const feedback={

rideId:ride.id,

driverRating:null,

passengerRating:null,

issues:[],

comments:"Awaiting human feedback",

timestamp:new Date().toISOString()

};


fs.writeFileSync(

"beta/pilot/feedback/PILOT-RIDE-001.json",

JSON.stringify(feedback,null,2)

);


// PILOT REPORT

const report={

pilot:"CabLink Pilot Test 001",

participants:2,

ridesCompleted:1,

systemFlow:[

"Driver online",

"Passenger request",

"Driver assigned",

"Ride completed",

"Fare generated",

"Reward recorded"

],

status:"WAITING FOR HUMAN VALIDATION",

nextStep:
"Collect first real driver/passenger ride data"

};


fs.writeFileSync(

"beta/pilot/reports/PILOT_TEST_001_REPORT.json",

JSON.stringify(report,null,2)

);


console.log(report);


