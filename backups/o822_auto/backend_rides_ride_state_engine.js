
const states=[

"REQUESTED",
"DRIVER_FOUND",
"DRIVER_ACCEPTED",
"ARRIVING",
"PASSENGER_PICKED",
"TRIP_STARTED",
"COMPLETED",
"SETTLED"

];


function update(ride,state){

if(!states.includes(state)){

throw new Error("INVALID_RIDE_STATE");

}


return {

...ride,

state,

updated:new Date().toISOString()

};

}


module.exports={
states,
update
};
