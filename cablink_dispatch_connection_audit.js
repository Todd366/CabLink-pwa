const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DISPATCH CONNECTION AUDIT
=========================================
`);

const files=[
"backend/routes/dispatch_api.js",
"backend/routes/matching_api.js",
"backend/routes/live_ride_api.js",
"backend/services/dispatch_service.js",
"backend/services/driver_matching_service.js",
"backend/services/live_ride_service.js",
"backend/services/ride_state_service.js",
"backend/server.js",
"frontend/js/driver/driverModeBridge.js",
"frontend/js/rides/rideController.js",
"frontend/js/services/cablinkAPI.js"
];


let found=0;


for(const f of files){

if(fs.existsSync(f)){

let size=fs.statSync(f).size;

console.log(
"✅",
f,
size+" bytes"
);

found++;

}else{

console.log(
"⚠️ missing",
f
);

}

}


console.log(`
-----------------------------------------
FOUND:
${found}/${files.length}

`);

console.log(`
Searching dispatch keywords...
`);


const search=[
"dispatch",
"match",
"driver",
"accept",
"request",
"ride"
];


for(const f of files){

if(!fs.existsSync(f)) continue;

const text=fs.readFileSync(f,"utf8");

console.log("\nFILE:",f);

search.forEach(word=>{

let count=(text.match(new RegExp(word,"gi"))||[]).length;

if(count)
console.log(
" ",
word,
":",
count
);

});

}


console.log(`
=========================================
AUDIT COMPLETE
=========================================
`);

