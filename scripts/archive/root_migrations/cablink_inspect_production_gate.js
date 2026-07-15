const fs=require("fs");

console.log(`
=========================================
🚕 INSPECT PRODUCTION GATE
=========================================
`);

const file="cablink_production_gate.js";

const lines=fs.readFileSync(file,"utf8").split("\n");

lines.forEach((line,i)=>{

if(
line.includes("localhost") ||
line.includes("https") ||
line.includes("compatible") ||
line.includes("checks") ||
line.includes("return")
){

console.log(
(i+1)+": "+line
);

}

});

console.log(`
=========================================
DONE
=========================================
`);

