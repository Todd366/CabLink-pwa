const http = require("http");

console.log(`
==============================================
CABLINK O.8.30 — API INTEGRATION TEST
==============================================
`);

function request(method, path, body){

return new Promise((resolve,reject)=>{

const data =
JSON.stringify(body || {});

const req=http.request(
{
hostname:"localhost",
port:3000,
path,
method,
headers:{
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(data)
}
},
res=>{

let output="";

res.on(
"data",
chunk=>output+=chunk
);

res.on(
"end",
()=>{

try{

resolve({
status:res.statusCode,
body:JSON.parse(output)
});

}catch{

resolve({
status:res.statusCode,
body:output
});

}

});

});

req.on(
"error",
reject
);

if(method!=="GET")
req.write(data);

req.end();

});

}


async function run(){

console.log("1. CREATE RIDE");

let create =
await request(
"POST",
"/api/rides",
{
pickup:"BSTM HQ",
dropoff:"Game City Mall",
fare:20,
passenger:"API_TEST"
}
);

console.log(
create.status,
create.body
);


console.log(`
2. DRIVER ACCEPT
`);

let rideId =
create.body.id ||
create.body.ride?.id;


if(!rideId){

console.log(
"NO RIDE ID RETURNED"
);

return;

}


let accept =
await request(
"POST",
"/api/rides/"+rideId+"/accept",
{
driverId:"API_DRIVER_001",
driverName:"API Driver"
}
);

console.log(
accept.status,
accept.body
);


console.log(`
3. COMPLETE RIDE
`);

let complete =
await request(
"POST",
"/api/rides/"+rideId+"/complete",
{
driverId:"API_DRIVER_001"
}
);

console.log(
complete.status,
complete.body
);


console.log(`
4. CREATE REWARD
`);

let reward =
await request(
"POST",
"/api/rewards/create",
{
rideId
}
);

console.log(
reward.status,
reward.body
);


console.log(`
==============================================
O.8.30 COMPLETE
==============================================
`);

}


run();
