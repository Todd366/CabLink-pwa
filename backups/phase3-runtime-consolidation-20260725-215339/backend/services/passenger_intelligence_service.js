
const fs=require("fs");

const file="backend/data/passengers.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function profile(id){

const db=load();

return db.passengers.find(
p=>p.id===id
);

}


function updateRide(id,fare,thb){

const db=load();

const user=db.passengers.find(
p=>p.id===id
);

if(user){

user.rides++;
user.completed++;
user.spent+=fare;
user.thbEarned+=thb;

}

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return user;

}


module.exports={
profile,
updateRide
};
