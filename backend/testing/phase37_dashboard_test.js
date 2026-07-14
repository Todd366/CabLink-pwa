

const http=require("http");


http.get(
"http://localhost:3000/api/driver/DRIVER001/economy",
res=>{

let data="";

res.on(
"data",
c=>data+=c
);

res.on(
"end",
()=>{

console.log(
JSON.parse(data)
);

});

});


