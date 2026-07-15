

const repo=require("../database/rideRepository");


function createRide(data){

return repo.create({

id:"CL-"+Date.now(),

pickup:data.pickup,

dropoff:data.dropoff,

fare:data.fare||20,

status:"SEARCHING",

driverId:null,

createdAt:new Date().toISOString()

});

}


function acceptRide(id,driverId){

return repo.update(
id,
{
status:"ACCEPTED",
driverId
}
);

}


function completeRide(id){

return repo.update(
id,
{
status:"COMPLETED",
completedAt:new Date().toISOString()
}
);

}


module.exports={
createRide,
acceptRide,
completeRide
};

