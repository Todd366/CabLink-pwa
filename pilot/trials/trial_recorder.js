
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

