const fs=require("fs");

console.log(`
=========================================
🚕 PHASE 33 API CLIENT FIX
BROWSER + NODE SUPPORT
=========================================
`);

const file="frontend/services/economy_dashboard_api.js";

if(!fs.existsSync(file)){
 console.log("❌ economy_dashboard_api.js missing");
 process.exit(1);
}


fs.writeFileSync(
file,
`

const BASE_URL =
typeof window === "undefined"
?
"http://localhost:3000"
:
"";


async function getDriverDashboard(id){

const response =
await fetch(
BASE_URL +
"/api/driver/" +
id +
"/dashboard"
);

return await response.json();

}


module.exports={
getDriverDashboard
};

`
);


console.log(`
=========================================

✅ PHASE 33 API FIX COMPLETE

Supports:

✅ Browser PWA
✅ Node testing
✅ Local backend

RUN:

node frontend/testing/driver_economy_screen_test.js

=========================================
`);

