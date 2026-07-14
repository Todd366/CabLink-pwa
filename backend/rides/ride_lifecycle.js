
const rides={};


function create(data){

let ride={

id:"RIDE-"+Date.now(),

passenger:data.passenger,

pickup:data.pickup,

destination:data.destination,

status:"REQUESTED",

created:new Date().toISOString()

};


rides[ride.id]=ride;

return ride;

}


function update(id,status){

if(rides[id]){

rides[id].status=status;

}

return rides[id];

}


function all(){

return Object.values(rides);

}


module.exports={
create,
update,
all
};

