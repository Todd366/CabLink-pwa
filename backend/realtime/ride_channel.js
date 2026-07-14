
const socket=require("../socket/socket_manager");


function passengerJoin(ride,user){

return socket.join(
user,
"ride-"+ride
);

}


function driverJoin(ride,user){

return socket.join(
user,
"ride-"+ride
);

}


function sendUpdate(ride,data){

return socket.broadcast(
"ride-"+ride,
data
);

}


module.exports={
passengerJoin,
driverJoin,
sendUpdate
};

