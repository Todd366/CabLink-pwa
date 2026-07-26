
const fs=require("fs");

const file="backend/data/driver_positions.json";

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


function update(driver){

const db=load();

let item=db.positions.find(
p=>p.driver===driver.driver
);


if(item){

Object.assign(item,driver);

}else{

db.positions.push(driver);

}

save(db);

return driver;

}


function distance(a,b){

const lat=Math.abs(a.lat-b.lat);
const lng=Math.abs(a.lng-b.lng);

return Number(
(Math.sqrt(lat*lat+lng*lng)*111)
.toFixed(2)
);

}


function calculate(driver,pickup){

const db=load();

const item=db.positions.find(
p=>p.driver===driver
);


if(!item) return null;


const km=distance(
item.location,
pickup
);


return {

driver,

distanceKm:km,

etaMinutes:Math.max(
1,
Math.ceil(km/0.5)
)

};

}


module.exports={
update,
calculate
};

