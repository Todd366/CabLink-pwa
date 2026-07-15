const fs=require("fs");

const file="frontend/index.html";

const s=fs.readFileSync(file,"utf8");

console.log(`
=========================================
🚕 CABLINK BOOKING WIRING SCANNER
=========================================
`);

const patterns=[
"Request ride",
"bookRide",
"function book",
"onclick",
"createRide",
"/api/rides",
"simulateRide"
];

patterns.forEach(p=>{

console.log("\nSEARCH:",p);

let index=s.indexOf(p);

if(index===-1){

console.log("❌ Not found");
return;

}

console.log(
"Found around position:",
index
);

console.log(
s.substring(
Math.max(0,index-150),
index+250
)
);

});


console.log(`
=========================================
DONE
=========================================
`);

