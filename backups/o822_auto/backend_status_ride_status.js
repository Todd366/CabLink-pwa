
const states=[

"REQUESTED",

"MATCHING",

"DRIVER_ACCEPTED",

"DRIVER_ARRIVING",

"PASSENGER_PICKED_UP",

"IN_PROGRESS",

"COMPLETED",

"REWARD_RELEASED"

];


function change(current,next){

return {

from:current,

to:next,

valid:
states.includes(next),

time:new Date().toISOString()

};

}


function available(){

return states;

}


module.exports={
change,
available
};

