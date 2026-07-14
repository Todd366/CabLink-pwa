const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL RELEASE ENGINE v1
=========================================
`);


let result={
frontend:false,
backend:false,
ride:false,
finance:false,
rewards:false,
fare:false,
api:false
};



function exists(f){
return fs.existsSync(f);
}



console.log(`
=========================================
1. FILE SYSTEM CHECK
=========================================
`);


const files=[

"index.html",
"manifest.json",
"sw.js",

"fare_engine.js",

"frontend/js/ride_engine.js",
"frontend/js/operations_core.js",
"frontend/js/financial_intelligence.js",
"frontend/js/simulation_engine.js",

"backend/server.js",

"backend/services/ride_service.js",
"backend/services/driver_service.js",
"backend/services/payment_service.js",
"backend/services/reward_service.js"

];


let missing=[];


files.forEach(f=>{

if(exists(f)){
console.log("✅",f);
}else{
console.log("❌",f);
missing.push(f);
}

});


result.frontend=
exists("index.html") &&
exists("manifest.json");


result.backend=
exists("backend/server.js");



console.log(`
=========================================
2. INTELLIGENCE TEST
=========================================
`);



global.window={};

global.document={
addEventListener:function(){},
getElementById:function(){return null},
querySelectorAll:function(){return []}
};



try{

require("./fare_engine.js");

let fare=
window.calculateFare(
10,
"standard",
1
);


console.log(
"Fare Engine:",
fare
);


if(fare.total){
result.fare=true;
}


}catch(e){

console.log(
"Fare Engine Error",
e.message
);

}



try{

require("./frontend/js/ride_engine.js");


let ride=
window.CABLINK_RIDE.create({

customer:"TEST",

pickup:"Gaborone",

dropoff:"Airport",

fare:68

});


console.log(
"Ride Created:",
ride.id
);


if(ride.id){
result.ride=true;
}


}catch(e){

console.log(
"Ride Error",
e.message
);

}



try{

require("./frontend/js/financial_intelligence.js");


let money=
window.CABLINK_FINANCE.calculate(68);


console.log(
"Finance:",
money
);


if(money.platformRevenue){
result.finance=true;
}


}catch(e){

console.log(
"Finance Error",
e.message
);

}



try{

require("./frontend/js/operations_core.js");


let reward=
require("./backend/services/reward_service")
.create(
"USER001",
"RIDE001"
);


console.log(
"THB Reward:",
reward
);


if(reward.token==="THB"){
result.rewards=true;
}


}catch(e){

console.log(
"Reward Error",
e.message
);

}



console.log(`
=========================================
3. API CHECK
=========================================
`);


let server=
fs.readFileSync(
"backend/server.js",
"utf8"
);


if(server.includes("/api/")){
console.log("✅ API routes detected");
result.api=true;
}else{
console.log("❌ API routes missing");
}



console.log(`
=========================================
FINAL CABLINK STATUS
=========================================
`);


let passed=
Object.values(result)
.filter(x=>x)
.length;


let total=
Object.keys(result).length;


let score=
Math.round(
(passed/total)*100
);



Object.entries(result).forEach(([k,v])=>{

console.log(
v?"✅":"❌",
k
);

});



console.log(`
=========================================

CABLINK RELEASE SCORE:

${score}%

=========================================
`);



let report=`
CABLINK FINAL RELEASE REPORT

Score: ${score}%

Components:

${JSON.stringify(result,null,2)}

Date:
${new Date().toISOString()}
`;


fs.writeFileSync(
"CABLINK_FINAL_RELEASE_REPORT.txt",
report
);


console.log(
"📄 CABLINK_FINAL_RELEASE_REPORT.txt created"
);

