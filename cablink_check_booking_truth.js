const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK BOOKING TRUTH SCANNER
=========================================
`);

const code=fs.readFileSync("index.html","utf8");

const checks=[
"fetch('/api/rides'",
"fetch(\"/api/rides\"",
"generateRideId",
"STATE.rideId",
"rideId ="
];


for(const c of checks){

if(code.includes(c)){
console.log("FOUND:",c);
}else{
console.log("MISSING:",c);
}

}


console.log(`
=========================================
SCAN COMPLETE
=========================================
`);

