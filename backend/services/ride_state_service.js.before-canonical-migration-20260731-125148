
const rides=require("../database/ride_repository");


function create(ride){

let item={
...ride,
id:ride.id || "RIDE-"+Date.now(),
status:ride.status || "SEARCHING",
created:new Date().toISOString()
};

return rides.create(item);

}


function update(id,status){

let ride=
rides.all().find(
r=>r.id===id
);

if(ride){

console.warn("[CABLINK] Legacy status mutation blocked");

}

return ride;

}


function get(id){

return rides.all().find(
r=>r.id===id
);

}


module.exports={
create,
update,
get
};
