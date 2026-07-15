const http=require("http");

function request(method,path,data){

return new Promise((resolve,reject)=>{

const req=http.request({
hostname:"localhost",
port:3000,
path,
method,
headers:{
"Content-Type":"application/json"
}
},res=>{

let body="";

res.on("data",c=>body+=c);

res.on("end",()=>{

resolve(JSON.parse(body));

});

});

req.on("error",reject);

if(data)
req.write(JSON.stringify(data));

req.end();

});

}


async function run(){

console.log(`
=========================================
🚕 CABLINK FULL RIDE LIFECYCLE TEST
=========================================
`);


const created=await request(
"POST",
"/api/rides",
{
pickup:"Gaborone Mall",
dropoff:"Airport",
fare:50
}
);


const id=created.ride.id;

console.log("Created:",id);


const accepted=await request(
"PATCH",
"/api/rides/"+id+"/accept",
{
driverId:"DRIVER-001"
}
);


console.log("Accepted:");
console.log(JSON.stringify(accepted,null,2));


const completed=await request(
"PATCH",
"/api/rides/"+id+"/complete"
);


console.log("Completed:");
console.log(JSON.stringify(completed,null,2));


const rides=await request(
"GET",
"/api/rides"
);


console.log("Final rides:");
console.log(JSON.stringify(rides,null,2));


console.log(`
=========================================
✅ LIFECYCLE TEST COMPLETE
=========================================
`);

}

run();
