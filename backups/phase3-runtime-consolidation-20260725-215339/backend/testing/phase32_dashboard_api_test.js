

const http=require("http");

http.get(
"http://localhost:3000/api/driver/DRIVER001/dashboard",
res=>{

let data="";

res.on(
"data",
chunk=>data+=chunk
);

res.on(
"end",
()=>{

console.log(
JSON.parse(data)
);

});

});

