const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK BACKEND ROUTE ORDER CHECK
=========================================
`);

const lines=fs.readFileSync("backend/server.js","utf8").split("\n");

lines.forEach((line,i)=>{

if(
line.includes("/api/rides") ||
line.includes("CATCH") ||
line.includes("catch")
){

console.log(
(i+1)+": "+line.trim()
);

}

});

console.log(`
=========================================
DONE
=========================================
`);
