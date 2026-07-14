
const ride=require("../state/ride_ui_state");


function render(){

return {

screen:"Passenger Ride",

title:"CabLink",

status:
ride.get().status,

driver:
ride.get().driver || "Searching...",

map:"ACTIVE",

actions:[

"Request Ride",

"Track Driver",

"Contact Driver",

"Complete Ride"

]

};

}


module.exports={
render
};

