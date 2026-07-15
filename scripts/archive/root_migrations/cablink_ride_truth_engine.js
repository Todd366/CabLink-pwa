const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDE TRUTH ENGINE INSTALLER
=========================================
`);

function write(file,data){

fs.mkdirSync(require("path").dirname(file),{recursive:true});

fs.writeFileSync(file,data);

console.log("✅ Created:",file);

}


// Repository

write("backend/database/rideRepository.js",`

const fs=require("fs");

const file="backend/database/rides.json";


function load(){

if(!fs.existsSync(file)){
fs.writeFileSync(file,"[]");
}

return JSON.parse(fs.readFileSync(file));

}


function save(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


module.exports={

all(){

return load();

},


create(ride){

let rides=load();

rides.push(ride);

save(rides);

return ride;

},


update(id,data){

let rides=load();

let ride=rides.find(r=>r.id===id);

if(!ride) return null;


Object.assign(
ride,
data,
{
updatedAt:new Date().toISOString()
}
);

save(rides);

return ride;

}

};

`);


// Service

write("backend/services/rideService.js",`

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

`);


console.log(`
=========================================
✅ RIDE TRUTH ENGINE CREATED
=========================================

Created:

backend/database/rideRepository.js

backend/services/rideService.js


Functions:

✅ createRide()
✅ acceptRide()
✅ completeRide()

Next:
Connect API routes.
`);

