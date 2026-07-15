const http=require("http");

console.log(`
=========================================
🚕 CABLINK LAUNCH VERIFICATION
=========================================
`);

function check(path){

return new Promise(resolve=>{

http.get(
{
hostname:"localhost",
port:3000,
path
},
res=>{

let data="";

res.on("data",c=>data+=c);

res.on("end",()=>{

console.log("✅",path,res.statusCode,data.slice(0,150));

resolve();

});

}).on("error",e=>{

console.log("❌",path,e.message);

resolve();

});

});

}


(async()=>{

await check("/api/health");
await check("/api/rides");

console.log(`
=========================================
CABLINK BACKEND ONLINE
=========================================
`);

})();
