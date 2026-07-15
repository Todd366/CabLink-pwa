const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SINGLE RIDE SOURCE OF TRUTH FIX
=========================================
`);


// Replace ride_state_service with repository-backed state

let file="backend/services/ride_state_service.js";

let code=fs.readFileSync(file,"utf8");

fs.copyFileSync(
file,
file+".backup_single_storage_"+Date.now()
);


code=`
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

ride.status=status;

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
`;


fs.writeFileSync(
file,
code
);


console.log(
"✅ Ride state now uses database repository"
);

