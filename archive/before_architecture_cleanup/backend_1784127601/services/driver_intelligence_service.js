

const fs=require("fs");

const file="backend/data/drivers.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


// scoring algorithm

function score(driver,distance){

let ratingScore =
(driver.rating/5)*40;


let acceptanceScore =
(driver.acceptance/100)*30;


let experienceScore =
Math.min(driver.completed/200,1)*20;


let distanceScore =
Math.max(10-distance*2,0);


return Math.round(
ratingScore+
acceptanceScore+
experienceScore+
distanceScore
);

}


function rank(drivers,distance){

return drivers
.filter(d=>d.online)
.map(d=>({

...d,

dispatchScore:
score(d,distance)

}))
.sort(
(a,b)=>
b.dispatchScore-a.dispatchScore
);

}


function best(distance){

const db=load();

return rank(
db.drivers,
distance
)[0];

}


module.exports={
rank,
best
};

