
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
"/api/notifications/create",
{
ride:"RIDE-001",
user:"USER001",
driver:"DRIVER001",
type:"DRIVER_ARRIVED",
message:"Your driver has arrived"
}
)
);


let req=http.get(
"http://localhost:3000/api/ride/RIDE-001/timeline",
res=>{

let d="";

res.on("data",c=>d+=c);

res.on("end",()=>console.log(JSON.parse(d)));

});

})();
