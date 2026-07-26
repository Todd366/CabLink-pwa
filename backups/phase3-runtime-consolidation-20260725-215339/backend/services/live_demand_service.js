

const fs=require("fs");

const file=
"backend/data/live_demand.json";


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


// create demand event

function addRequest(location){

const db=load();


let area=
db.areas.find(
a=>a.location===location
);


if(!area){

area={
location,
activeRequests:0,
completedRequests:0,
score:0
};

db.areas.push(area);

}


area.activeRequests++;

calculate(area);

save(db);

return area;

}


// complete request

function completeRequest(location){

const db=load();


const area=
db.areas.find(
a=>a.location===location
);


if(area){

area.activeRequests=
Math.max(
0,
area.activeRequests-1
);

area.completedRequests++;

calculate(area);

save(db);

}


return area;

}


function calculate(area){

area.score=
Math.min(
100,
(area.activeRequests*10)
+
(area.completedRequests*2)
);

}


function hotspots(){

const db=load();

return db.areas.sort(
(a,b)=>b.score-a.score
);

}


module.exports={
addRequest,
completeRequest,
hotspots
};

