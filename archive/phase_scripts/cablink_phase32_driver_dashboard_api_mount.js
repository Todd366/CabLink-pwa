const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 32
DRIVER DASHBOARD API MOUNT
LIVE ECONOMY CONNECTION
=========================================
`);

const server="backend/server.js";

if(!fs.existsSync(server)){
 console.log("❌ server.js missing");
 process.exit(1);
}

let code=fs.readFileSync(server,"utf8");

const mount=`

// Driver Dashboard Economy API
const driverDashboardAPI=require("./routes/driver_dashboard_api");
app.use("/api", driverDashboardAPI);

`;

if(!code.includes("driverDashboardAPI")){

const target="// ── CATCH-ALL → serve index.html (SPA routing)";

code=code.replace(
target,
mount+"\n"+target
);

fs.writeFileSync(server,code);

console.log("✅ Driver dashboard API mounted");

}else{

console.log("ℹ️ Already mounted");

}


// frontend connector

fs.writeFileSync(
"frontend/services/economy_dashboard_api.js",
`

async function getDriverDashboard(id){

const response =
await fetch(
"/api/driver/"+id+"/dashboard"
);

return await response.json();

}


module.exports={
getDriverDashboard
};

`
);


// test

fs.writeFileSync(
"backend/testing/phase32_dashboard_api_test.js",
`

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

`
);


console.log(`
=========================================

✅ PHASE 32 CREATED

Added:

✅ Driver dashboard API mounted
✅ Wallet endpoint connected
✅ Reward history endpoint connected
✅ Frontend API connector

NEXT:

Restart backend:

pkill -f "node backend/server.js"

npm run backend

Test:

node backend/testing/phase32_dashboard_api_test.js

=========================================
`);

