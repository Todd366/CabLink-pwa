const fs=require("fs");

console.log(`
=========================================
🚕 PHASE 33 ROUTE ORDER FIX
MOVE DRIVER API BEFORE SERVER START
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const mount=`
// Driver Dashboard Economy API
const driverDashboardAPI=require("./routes/driver_dashboard_api");
app.use("/api", driverDashboardAPI);
`;


// remove existing mount

code=code.replace(mount,"");


// insert before app.listen

const target="app.listen(PORT, function () {";


if(code.includes(target)){

code=code.replace(
target,
mount+"\n\n"+target
);

fs.writeFileSync(file,code);

console.log("✅ Driver dashboard route moved");

}else{

console.log("❌ app.listen not found");

}


console.log(`
=========================================

DONE

Restart backend:

pkill -f "node backend/server.js"

npm run backend

Test:

node frontend/testing/driver_economy_screen_test.js

=========================================
`);

