
const ride=require("../state/ride_ui_state");


function render(){

return {

screen:"Driver Control",

online:true,

status:
ride.get().status,

actions:[

"Go Online",

"Accept Ride",

"Start Trip",

"Complete Trip"

]

};

}


module.exports={
render
};

