

const http=require("http");


function post(path,data){

return new Promise(resolve=>{

const req=http.request(
{
hostname:"localhost",
port:3000,
path,
method:"POST",
headers:{
"Content-Type":"application/json"
}
},
res=>{

let body="";

res.on("data",c=>body+=c);

res.on("end",()=>resolve(JSON.parse(body)));

});

req.write(JSON.stringify(data));
req.end();

});

}


(async()=>{


let ride=
await post(
"/api/dispatch/request",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);


console.log("REQUEST:");
console.log(ride);


let matched=
await post(
"/api/dispatch/match",
{
id:ride.request.id,
drivers:[
{
id:"DRIVER001",
distance:0.5
}
]
}
);


console.log("MATCHED:");
console.log(matched);


let accepted=
await post(
"/api/dispatch/accept",
{
id:ride.request.id,
driver:"DRIVER001"
}
);


console.log("ACCEPTED:");
console.log(accepted);


})();

