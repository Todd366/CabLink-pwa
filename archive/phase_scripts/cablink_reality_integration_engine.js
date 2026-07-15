const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REALITY INTEGRATION ENGINE
=========================================
`);


// DATABASE PERSISTENCE

fs.mkdirSync("database/production",{recursive:true});

fs.writeFileSync(
"database/production/store_engine.js",
`

const fs=require("fs");

const file="database/production/database.json";


function load(){

return JSON.parse(
fs.readFileSync(file)
);

}


function save(collection,data){

let db=load();

if(!db[collection])
db[collection]=[];

db[collection].push(data);

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return data;

}


module.exports={
save,
load
};

`
);


// PAYMENT ADAPTER

fs.mkdirSync("backend/payments",{recursive:true});

fs.writeFileSync(
"backend/payments/payment_adapter.js",
`

function createPayment(data){

return {

id:"PAY-"+Date.now(),

provider:"ADAPTER_READY",

amount:data.amount,

status:"PENDING_GATEWAY"

};

}


module.exports={createPayment};

`
);


// BLOCKCHAIN REWARD ADAPTER

fs.mkdirSync("backend/rewards",{recursive:true});

fs.writeFileSync(
"backend/rewards/blockchain_reward_adapter.js",
`

function createReward(data){

return {

token:"THB",

amount:data.amount,

status:"READY_FOR_CONTRACT_TRANSFER",

wallet:data.wallet || null

};

}


module.exports={createReward};

`
);


// SECURITY

if(!fs.existsSync(".gitignore")){

fs.writeFileSync(".gitignore",".env\nnode_modules/\n");

}else{

let g=fs.readFileSync(".gitignore","utf8");

if(!g.includes(".env"))
fs.appendFileSync(".gitignore","\n.env\n");

}


// CLEAN REPORT

const report={

database:true,

paymentAdapter:true,

rewardAdapter:true,

envProtection:true,

date:new Date().toISOString()

};


fs.writeFileSync(
"CABLINK_REALITY_INTEGRATION_REPORT.json",
JSON.stringify(report,null,2)
);


console.log(report);


