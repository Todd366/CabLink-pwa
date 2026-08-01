

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


console.log(
await post(
"/api/driver/location",
{
id:"DRIVER001",
online:true,
location:{
lat:-24.6282,
lng:25.9231
}
}
)
);


console.log(
await post(
"/api/matching/drivers",
{
location:{
lat:-24.6300,
lng:25.9250
}
}
)
);


})();

