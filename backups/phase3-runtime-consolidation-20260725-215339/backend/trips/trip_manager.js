
const trips={};


function start(data){

let trip={

id:"TRIP-"+Date.now(),

ride:data.ride,

driver:data.driver,

passenger:data.passenger,

status:"STARTED",

started:new Date().toISOString()

};


trips[trip.id]=trip;

return trip;

}


function update(id,status){

if(trips[id]){

trips[id].status=status;

}

return trips[id];

}


function all(){

return Object.values(trips);

}


module.exports={
start,
update,
all
};

