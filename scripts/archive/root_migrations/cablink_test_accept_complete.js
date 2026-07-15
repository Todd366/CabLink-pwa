const http=require("http");

function req(method,path,data){

return new Promise((resolve,reject)=>{

const r=http.request({
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

console.log("\n"+method,path);
console.log("STATUS:",res.statusCode);
console.log(body);

resolve();

});

});

r.on("error",reject);

if(data) r.write(JSON.stringify(data));

r.end();

});

}


async function run(){

console.log(`
=========================================
🚕 CABLINK ACCEPT COMPLETE TEST
=========================================
`);


await req(
"PATCH",
"/api/rides/CL-1784116228491/accept",
{
driverId:"DRIVER-001"
}
);


await req(
"PATCH",
"/api/rides/CL-1784116228491/complete"
);


await req(
"GET",
"/api/rides"
);


console.log(`
=========================================
DONE
=========================================
`);

}

run();
