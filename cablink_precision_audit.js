const fs=require("fs");

console.log(`
==================================
🚕 CABLINK PRECISION AUDIT v1.0
==================================
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

let score=0;

for(const f of files){

 if(fs.existsSync(f)){
   console.log("✅",f);
   score++;
 }else{
   console.log("❌ MISSING",f);
 }
}


console.log("\n===== SCRIPT DUPLICATION =====");

let html=fs.readFileSync("index.html","utf8");

[
"role.js",
"fix.js",
"app.js",
"core.js",
"firebase.js",
"fare_engine.js"
].forEach(s=>{

 let count=(html.match(new RegExp(s,"g"))||[]).length;

 console.log(
 count>1?"⚠️":"✅",
 s,
 "count:",
 count
 );

});


console.log("\n===== CORE FUNCTIONS =====");

let scan=[
"bookRide",
"showScreen",
"connectWallet",
"calculateFare",
"updateFareDisplay",
"firebase",
"localStorage",
"STATE"
];

let all=files
.filter(f=>fs.existsSync(f))
.map(f=>fs.readFileSync(f,"utf8"))
.join("\n");


scan.forEach(x=>{
 console.log(
 all.includes(x)?"✅":"❌",
 x
 );
});


console.log("\n===== SECURITY CHECK =====");

let checks=[
"apiKey",
"password",
"privateKey",
"secret",
"admin"
];

checks.forEach(x=>{

console.log(
all.toLowerCase().includes(x.toLowerCase())
?"⚠️ FOUND "+x
:"✅ no "+x
);

});


console.log("\n===== RESULT =====");

let percent=Math.round(score/files.length*100);

console.log(
"System files:",
score+"/"+files.length
);

console.log(
"Architecture health:",
percent+"%"
);


console.log(`
==================================
Audit Complete
==================================
`);

