const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK OLD RIDE CONTROL SCANNER
=========================================
`);

const files=[
"index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"fix.js"
];


const keywords=[
"acceptRide",
"completeRide",
"simulate",
"fake",
"Math.random",
"driver",
"assign"
];


for(const file of files){

if(!fs.existsSync(file)) continue;

console.log("\nFILE:",file);

const lines=fs.readFileSync(file,"utf8").split("\n");

lines.forEach((line,i)=>{

for(const k of keywords){

if(line.includes(k)){

console.log(
"LINE",
i+1,
"=>",
line.trim().slice(0,120)
);

break;

}

}

});

}


console.log(`
=========================================
SCAN COMPLETE

Next:
Replace old handlers with truth bridge.
=========================================
`);

