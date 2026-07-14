const fs=require("fs");

console.log(`
=========================================
🧠 CABLINK PILOT TRIAL RECORDER
=========================================
`);

fs.mkdirSync(
"pilot/trials",
{recursive:true}
);


fs.writeFileSync(
"pilot/trials/trial_recorder.js",
`
const store=require("../../database/production/store_engine");


function recordTrial(data){

let trial={

id:"TRIAL-"+Date.now(),

ride:data.ride,

driver:data.driver,

passenger:data.passenger,

pickup:data.pickup,

destination:data.destination,

duration:data.duration || null,

rating:data.rating || null,

issues:data.issues || [],

lesson:data.lesson || null,

created:new Date().toISOString()

};


store.save(
"pilot_trials",
trial
);


return trial;

}


function allTrials(){

return store.get("pilot_trials");

}


module.exports={
recordTrial,
allTrials
};

`
);


fs.writeFileSync(
"pilot/trials/run_trial_test.js",
`
const trials=require("./trial_recorder");


console.log(

trials.recordTrial({

ride:"RIDE-LIVE-001",

driver:"DRIVER-001",

passenger:"PASSENGER-001",

pickup:"Gaborone CBD",

destination:"Airport",

duration:"25 minutes",

rating:5,

issues:[],

lesson:"Pilot ride completed successfully"

})

);


console.log(
trials.allTrials()
);

`
);


console.log(`
=========================================

✅ PILOT TRIAL RECORDER CREATED

Added:

✅ Ride learning records
✅ Driver feedback
✅ Passenger feedback
✅ Lessons database
✅ ELOS-compatible trial storage

RUN:

node pilot/trials/run_trial_test.js

=========================================
`);

