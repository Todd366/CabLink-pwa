
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

