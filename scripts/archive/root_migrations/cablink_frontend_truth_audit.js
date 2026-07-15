const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FRONTEND TRUTH AUDIT
=========================================
`);

const files=[
"frontend/index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"frontend/js/role.js",
"frontend/js/fix.js"
];

const patterns=[
"simulateRide",
"Math.random",
"drivers nearby",
"ETA",
"localStorage",
"REQUESTING",
"CANCEL",
"ride",
"/api/rides",
"/api/drivers",
"window."
];

files.forEach(file=>{

if(!fs.existsSync(file)){
console.log("Missing:",file);
return;
}

const text=fs.readFileSync(file,"utf8");

console.log("\nFILE:",file);

patterns.forEach(p=>{

let count=(text.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;

if(count){
console.log(
" ",
p,
":",
count
);
}

});

});

console.log(`
=========================================
AUDIT COMPLETE
=========================================
`);

