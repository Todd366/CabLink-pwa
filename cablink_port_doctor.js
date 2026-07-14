const {execSync}=require("child_process");
const fs=require("fs");

console.log(`
====================================
🚕 CABLINK PORT DOCTOR
====================================
`);

function run(cmd){
    try{
        return execSync(cmd,{encoding:"utf8"});
    }catch(e){
        return "";
    }
}

console.log("Searching for process using port 3000...\n");

let out=
run("ss -ltnp 2>/dev/null") ||
run("netstat -ltnp 2>/dev/null") ||
run("lsof -i :3000 2>/dev/null");

console.log(out||"No port information available.");

console.log("\nStopping possible node servers...");

[
"pkill -9 -f backend/server.js",
"pkill -9 -f serve",
"pkill -9 node"
].forEach(c=>{
    run(c);
});

console.log("Done.");

console.log("\nTrying port 3000...");

let port=3000;

try{

run("node backend/server.js &");

console.log("✅ Backend started on port",port);

}catch(e){

console.log("Port busy. Using 3001.");

let server=
fs.readFileSync("backend/server.js","utf8");

server=server.replace(
/const\s+PORT\s*=\s*process\.env\.PORT\s*\|\|\s*\d+/,
"const PORT=process.env.PORT||3001"
);

fs.writeFileSync("backend/server.js",server);

console.log("✅ Changed default port to 3001");

}

console.log(`
====================================
PORT DOCTOR COMPLETE
====================================
`);
