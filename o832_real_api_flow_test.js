const http=require("http");

console.log(`
==============================================
CABLINK O.8.32 — REAL API FLOW TEST
==============================================
`);

function request(method,path,body){

return new Promise((resolve,reject)=>{

const payload=JSON.stringify(body||{});

const req=http.request(
{
hostname:"localhost",
port:3000,
path,
method,
headers:{
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(payload)
}
},
res=>{

let data="";

res.on("data",c=>data+=c);

res.on("end",()=>{

try{

resolve({
status:res.statusCode,
body:JSON.parse(data)
});

}catch{

resolve({
status:res.statusCode,
body:data
});

}

});

});

req.on("error",reject);

if(method!=="GET")
req.write(payload);

req.end();

});

}


async function run(){

console.log("1. CREATE RIDE");


let create=
await request(
"POST",
"/api/rides",
{
pickup:"BSTM HQ",
dropoff:"Game City Mall",
fare:20,
passenger:"O832_TEST"
}
);


console.log(create.status,create.body);


let rideId=
create.body.ride.id;


console.log(
"\nRIDE ID:",
rideId
);



console.log("\n2. DRIVER ACCEPT");


let accept=
await request(
"PATCH",
"/api/rides/"+rideId+"/accept",
{
driverId:"O832_DRIVER",
driverName:"Test Driver"
}
);


console.log(
accept.status,
accept.body
);



console.log("\n3. COMPLETE");


let complete=
await request(
"POST",
"/api/ride/complete",
{
id:rideId,
driverId:"O832_DRIVER"
}
);


console.log(
complete.status,
complete.body
);



console.log("\n4. REWARD");


let reward=
await request(
"POST",
"/api/rewards/ride/"+rideId
);


console.log(
reward.status,
reward.body
);



console.log(`
==============================================
O.8.32 COMPLETE
==============================================
`);

}


run();
