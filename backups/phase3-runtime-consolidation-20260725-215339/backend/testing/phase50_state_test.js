
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

let ride=await post(
"/api/ride/create",
{
passenger:"USER001",
pickup:"Gaborone CBD",
destination:"Airport"
}
);

console.log("CREATED");
console.log(ride);


console.log(
await post(
"/api/ride/status",
{
id:ride.ride.id,
status:"DRIVER_ARRIVING"
}
)
);


console.log(
await post(
"/api/ride/status",
{
id:ride.ride.id,
status:"TRIP_STARTED"
}
)
);


})();
