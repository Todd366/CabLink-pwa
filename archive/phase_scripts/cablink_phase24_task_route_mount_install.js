const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 24
TASK API SERVER MOUNT
BSTM DELIVERY CONNECTION
=========================================
`);


// locate server

const server="backend/server.js";

if(!fs.existsSync(server)){
console.log("❌ backend/server.js missing");
process.exit(1);
}


// backup

fs.copyFileSync(
server,
"backend/server_before_task_mount.bak"
);


// ecosystem route

const routeLine=
`
// BSTM Marketplace Task Bridge
const ecosystemTasks=require("./routes/ecosystem_tasks");
app.use("/api/ecosystem", ecosystemTasks);
`;

let code=fs.readFileSync(server,"utf8");


if(!code.includes("ecosystemTasks")){

code += routeLine;

fs.writeFileSync(
server,
code
);

console.log("✅ Task API mounted");

}else{

console.log("ℹ️ Task API already mounted");

}


// driver task button UI

fs.writeFileSync(
"frontend/components/bstm_delivery_button.js",
`

function button(){

return {

title:"BSTM Delivery",

action:"OPEN_TASKS",

description:
"Accept marketplace deliveries through CabLink"

};

}


module.exports={
button
};

`
);


// verification

fs.writeFileSync(
"backend/testing/phase24_verification.js",
`

const bridge=require("../ecosystem/marketplace_bridge");

console.log(

bridge.receiveOrder({

customer:"TEST_USER",

vendor:"BSTM_STORE",

customerAddress:"Gaborone"

})

);

`
);


console.log(`
=========================================

✅ PHASE 24 CREATED

Added:

✅ Express task route mounting
✅ Driver delivery button foundation
✅ API connection point
✅ Server backup created

RUN:

node backend/testing/phase24_verification.js

NEXT:

Phase 25:
Real driver dashboard integration + delivery earnings

=========================================
`);

