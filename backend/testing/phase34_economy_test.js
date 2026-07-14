

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

let accepted=
await post(
"/api/economy/ride/accept",
{
driver:"DRIVER001",
ride:{
fare:25
}
}
);


console.log("ACCEPTED:");
console.log(accepted);


let completed=
await post(
"/api/economy/ride/complete",
{
id:accepted.ride.id
}
);


console.log("COMPLETED:");
console.log(completed);


})();

