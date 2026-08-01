

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
"/api/demand/request",
{
location:"Gaborone CBD"
}
)
);


console.log(
await post(
"/api/demand/request",
{
location:"Airport"
}
)
);


console.log(
await post(
"/api/demand/request",
{
location:"Gaborone CBD"
}
)
);


http.get(
"http://localhost:3000/api/driver/hotspots",
res=>{

let d="";

res.on("data",c=>d+=c);

res.on("end",()=>{

console.log(
JSON.parse(d)
);

});

});


})();

