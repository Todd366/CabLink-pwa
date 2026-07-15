

const fs=require("fs");

const file="backend/data/drivers_live.json";


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


// Driver goes online

function updateDriver(driver){

const db=load();

let existing=
db.drivers.find(
d=>d.id===driver.id
);


if(existing){

Object.assign(existing,driver);

}else{

db.drivers.push(driver);

}


save(db);

return driver;

}


// calculate rough distance

function distance(a,b){

const lat=
Math.abs(a.lat-b.lat);

const lng=
Math.abs(a.lng-b.lng);

return Number(
Math.sqrt(
lat*lat+lng*lng
).toFixed(2)
);

}


// find nearby drivers

function nearby(location){

const db=load();

return db.drivers
.filter(
d=>d.online===true
)
.map(
d=>({

...d,

distance:
distance(
d.location,
location
)

})
)
.sort(
(a,b)=>a.distance-b.distance
);

}


module.exports={
updateDriver,
nearby
};

