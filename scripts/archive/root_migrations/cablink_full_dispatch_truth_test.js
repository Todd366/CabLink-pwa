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

res.on("end",()=>resolve(JSON.parse(body)));

});

req.on("error",reject);

if(data) req.write(JSON.stringify(data));

req.end();

});

}


async function run(){

console.log(`
=========================================
🚕 CABLINK END TO END DISPATCH TEST
=========================================
`);


const created=await request(
"POST",
"/api/rides",
{
pickup:"BSTM HQ",
dropoff:"Airport",
fare:60
}
);

const id=created.ride.id;

console.log("1. CREATED:",id);



const accepted=await request(
"PATCH",
"/api/rides/"+id+"/accept",
{
driverId:"DRIVER-TEST-001"
}
);

console.log("2. ACCEPTED:");
console.log(JSON.stringify(accepted.ride,null,2));



const current=await request(
"GET",
"/api/rides/"+id
);

console.log("3. CURRENT:");
console.log(JSON.stringify(current,null,2));



const completed=await request(
"PATCH",
"/api/rides/"+id+"/complete"
);

console.log("4. COMPLETED:");
console.log(JSON.stringify(completed.ride,null,2));


console.log(`
=========================================
✅ END TO END TEST COMPLETE
=========================================
`);

}

run();
