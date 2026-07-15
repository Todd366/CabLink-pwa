const fs=require("fs");

const lines=fs.readFileSync("index.html","utf8").split("\n");

console.log(`
=========================================
🚕 CABLINK BOOKING FUNCTION TRACE
=========================================
`);

for(let i=950;i<=1070;i++){

if(lines[i]){

console.log(
(i+1)+": "+lines[i].trim().slice(0,180)
);

}

}

console.log(`
=========================================
TRACE COMPLETE
=========================================
`);

