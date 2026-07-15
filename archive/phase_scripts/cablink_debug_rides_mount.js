const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDES MOUNT DEBUG
=========================================
`);

let server=fs.readFileSync(
"backend/server.js",
"utf8"
);

console.log("=== rides references ===");

server.split("\n")
.filter(x=>x.includes("rides"))
.forEach(x=>console.log(x));


console.log(`
=== route file check ===
`);

let route=fs.readFileSync(
"backend/routes/rides.js",
"utf8"
);

console.log(
route.slice(0,1500)
);


