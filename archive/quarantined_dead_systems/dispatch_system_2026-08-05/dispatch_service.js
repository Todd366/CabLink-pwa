

const fs=require("fs");

const file="backend/data/dispatch_requests.json";


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


// create passenger request

function createRequest(data){

const db=load();

const request={

id:"REQ-"+Date.now(),

passenger:data.passenger || "USER001",

pickup:data.pickup,

destination:data.destination,

status:"SEARCHING",

drivers:[],

created:new Date().toISOString()

};


db.requests.push(request);

save(db);

return request;

}


// attach matched drivers

function dispatch(id,drivers){

const db=load();

const request=
db.requests.find(
r=>r.id===id
);

if(!request) return null;


request.drivers=drivers;

request.status="DRIVER_FOUND";

save(db);

return request;

}


// driver accepts

function accept(id,driver){

const db=load();

const request=
db.requests.find(
r=>r.id===id
);

if(!request) return null;


request.driver=driver;

request.status="ACCEPTED";

request.acceptedAt=
new Date().toISOString();


save(db);

return request;

}


function list(){

return load().requests;

}


module.exports={
createRequest,
dispatch,
accept,
list
};

