

const http=require("http");


function post(path,data){

return new Promise(resolve=>{

const req=http.request({

hostname:"localhost",
port:3000,
path,
method:"POST",
headers:{
"Content-Type":"application/json"
}

},res=>{

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
"/api/orchestrator/create",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);


console.log(
"CREATED",
ride
);


let id=ride.ride.id;


console.log(
await post(
"/api/orchestrator/assign",
{
id,
driver:"DRIVER001"
}
)
);



console.log(
await post(
"/api/orchestrator/arrived",
{id}
)
);



console.log(
await post(
"/api/orchestrator/start",
{id}
)
);



console.log(
await post(
"/api/orchestrator/finish",
{
id,
fare:35
}
)
);



})();

