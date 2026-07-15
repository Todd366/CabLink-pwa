const fs=require("fs");

console.log(`
=========================================
🚕 HTTPS GATE INSPECTOR
=========================================
`);

const code=fs.readFileSync(
"cablink_production_gate.js",
"utf8"
);

code.split("\n").forEach((line,i)=>{

if(
line.includes("HTTPS") ||
line.includes("https") ||
line.includes("secure") ||
line.includes("ssl") ||
line.includes("tls")
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

