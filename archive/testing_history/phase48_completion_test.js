
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
"/api/ride/complete",
{

id:"RIDE-001",

driver:"DRIVER001",

passenger:"USER001",

fare:35

}

)
);


})();

