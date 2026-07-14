const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL INTELLIGENCE AUDIT v1
=========================================
`);

const files=[
"index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"frontend/js/firebase.js",
"fix.js",
"role.js",
"fare_engine.js",
"backend/server.js",
"manifest.json",
"sw.js"
];


let health=0;

files.forEach(f=>{
 if(fs.existsSync(f)){
   console.log("✅",f);
   health++;
 }else{
   console.log("❌ Missing",f);
 }
});


console.log(`
=========================================
SYSTEM CAPABILITY CHECK
=========================================
`);


let all="";

files.forEach(f=>{
 if(fs.existsSync(f)){
  all+=fs.readFileSync(f,"utf8");
 }
});


const systems={

"Ride Booking":
[
"bookRide"
],

"Navigation":
[
"showScreen"
],

"Wallet":
[
"wallet"
],

"THB Rewards":
[
"THB"
],

"Firebase":
[
"firebase"
],

"Driver System":
[
"driver"
],

"Fare Intelligence":
[
"calculateFare",
"FARE_CONFIG"
],

"Storage":
[
"localStorage"
],

"State Engine":
[
"STATE"
],

"Backend API":
[
"/api/"
]

};


for(let s in systems){

let ok=systems[s].some(x=>all.includes(x));

console.log(
ok?"✅":"❌",
s
);

}



console.log(`
=========================================
SECURITY REVIEW
=========================================
`);


[
"privateKey",
"password",
"secret"
].forEach(x=>{

console.log(
all.toLowerCase().includes(x)
?"⚠️ "+x+" detected"
:"✅ "+x+" clear"
);

});



console.log(`
=========================================
FARE ENGINE TEST
=========================================
`);


global.window={};

global.document={
addEventListener:function(){},
getElementById:function(){return null},
querySelectorAll:function(){return []}
};


require("./fare_engine.js");


[5,10,20].forEach(km=>{

let f=window.calculateFare(km,"standard",1);


console.log(`
Distance: ${km}km
Fare: P${f.total}
ETA: ${f.eta} minutes
Fuel: P${f.fuel}
Maintenance: P${f.maint}
`);

});


console.log(`
=========================================
FINAL SCORE
=========================================
`);

console.log(
"Core files:",
health+"/"+files.length
);


console.log(
"Readiness:",
Math.round((health/files.length)*100)+"%"
);


console.log(`
=========================================
Audit Complete
=========================================
`);

