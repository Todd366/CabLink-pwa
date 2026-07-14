
const sync=require("../sync/live_sync_engine");
const push=require("../push/push_engine");


function rideRequest(data){

let event={

type:"RIDE_REQUESTED",

ride:data.ride,

passenger:data.passenger,

pickup:data.pickup

};


return {

sync:
sync.broadcast(event),

notification:
push.notify(
"drivers",
"New ride available"
)

};

}


module.exports={
rideRequest
};

