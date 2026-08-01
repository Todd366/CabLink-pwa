

const fs=require("fs");

const file="backend/data/live_rides.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function save(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


function create(data){

const db=load();

const ride={

id:"RIDE-"+Date.now(),

passenger:data.passenger,

driver:null,

pickup:data.pickup,

destination:data.destination,

status:"SEARCHING",

created:new Date().toISOString()

};


db.rides.push(ride);

save(db);

return ride;

}



function update(id,status){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);


if(!ride) return null;


ride.status=status;

ride.updated=
new Date().toISOString();


save(db);

return ride;

}



function assignDriver(id,driver){

const db=load();

const ride=db.rides.find(
r=>r.id===id
);


if(!ride) return null;


ride.driver=driver;

ride.status="DRIVER_FOUND";

save(db);

return ride;

}



function get(id){

const db=load();

return db.rides.find(
r=>r.id===id
);

}


module.exports={
create,
update,
assignDriver,
get
};

