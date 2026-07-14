

const rides=[];

function requestRide(data){

let ride={

id:"RIDE-"+Date.now(),

passenger:data.passenger,

pickup:data.pickup,

destination:data.destination,

status:"REQUESTED",

driver:null

};

rides.push(ride);

return ride;

}


function assignDriver(id,driver){

let ride=rides.find(r=>r.id===id);

if(ride){

ride.driver=driver;

ride.status="DRIVER_ASSIGNED";

}

return ride;

}


function completeRide(id){

let ride=rides.find(r=>r.id===id);

if(ride){

ride.status="COMPLETED";

}

return ride;

}


module.exports={
requestRide,
assignDriver,
completeRide
};

