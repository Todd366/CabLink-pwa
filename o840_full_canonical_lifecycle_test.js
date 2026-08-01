const http=require("http");

console.log(`
==============================================
CABLINK O.8.40 — FULL CANONICAL LIFECYCLE TEST
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

resolve({
status:res.statusCode,
body:JSON.parse(data)
});

});

});

req.on("error",reject);

if(method!=="GET")
req.write(payload);

req.end();

});

}


async function run(){

let create=
await request(
"POST",
"/api/rides",
{
pickup:"BSTM HQ",
dropoff:"Game City Mall",
fare:20,
passenger:"O840_TEST"
}
);


let id=create.body.ride.id;

console.log(
"CREATE:",
create.body.ride.status
);


await request(
"PATCH",
"/api/rides/"+id+"/accept",
{
driverId:"O840_DRIVER",
driverName:"Driver"
}
);

console.log(
"ACCEPT: DRIVER_ASSIGNED"
);



const states=[
"DRIVER_ARRIVED",
"PICKED_UP",
"STARTED"
];


for(const status of states){

let result=
await request(
"PATCH",
"/api/rides/"+id,
{
status
}
);

console.log(
status,
result.body.ride?.status ||
result.body
);

}


let complete=
await request(
"POST",
"/api/ride/complete",
{
id,
driverId:"O840_DRIVER"
}
);


console.log(
"COMPLETE:",
complete.body
);


let reward=
await request(
"POST",
"/api/rewards/ride/"+id
);


console.log(
"REWARD:",
reward.status,
reward.body
);


console.log(`
==============================================
O.8.40 COMPLETE
==============================================
`);

}

run();
