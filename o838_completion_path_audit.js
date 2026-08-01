const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.38 — COMPLETION PATH AUDIT
==============================================
`);

const files=[
"backend/routes/completion_api.js",
"backend/services/ride_completion_service.js",
"backend/canonical/ride_engine.js"
];

for(const file of files){

console.log("\n==============================");
console.log(file);
console.log("==============================");

if(!fs.existsSync(file)){
 console.log("MISSING");
 continue;
}

let d=fs.readFileSync(file,"utf8");

let lines=d.split("\n");

lines.forEach((line,i)=>{

if(
line.includes("completeRide") ||
line.includes("getRide") ||
line.includes("transition") ||
line.includes("update") ||
line.includes("COMPLETED") ||
line.includes("req.body")
){

console.log(
`${i+1}: ${line.trim()}`
);

}

});

}

console.log(`
==============================================
O.8.38 COMPLETE
==============================================
`);
