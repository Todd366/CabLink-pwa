
const fs=require("fs");

const file="backend/data/ride_events.json";


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


function add(event){

const db=load();

const item={

id:"EVENT-"+Date.now(),

...event,

time:new Date().toISOString()

};


db.events.push(item);

save(db);

return item;

}


function history(ride){

const db=load();

return db.events.filter(
e=>e.ride===ride
);

}


module.exports={
add,
history
};

