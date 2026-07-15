const http=require("http");

function request(method,path,data){

return new Promise((resolve,reject)=>{

const req=http.request(
{
hostname:"localhost",
port:3000,
path,
method,
headers:{
"Content-Type":"application/json"
}
},
res=>{

let body="";

res.on("data",c=>body+=c);

res.on("end",()=>{

console.log("\n",method,path);
console.log("STATUS:",res.statusCode);
console.log(body);

resolve();

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
🚕 CABLINK RIDE TRUTH TEST
=========================================
`);

await request(
"POST",
"/api/rides",
{
pickup:"Gaborone Mall",
dropoff:"Airport",
fare:50
}
);


await request(
"GET",
"/api/rides"
);


console.log(`
=========================================
TEST COMPLETE
=========================================
`);

}

run();

