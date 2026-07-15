const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FAKE RIDE ID TRACE
=========================================
`);

const lines=fs.readFileSync("index.html","utf8").split("\n");

lines.forEach((line,i)=>{

if(
line.includes("generateRideId") ||
line.includes("rideId") ||
line.includes("STATE.rideId")
){

console.log(
"LINE",
i+1,
"=>",
line.trim().slice(0,150)
);

}

});


console.log(`
=========================================
TRACE COMPLETE
=========================================
`);

