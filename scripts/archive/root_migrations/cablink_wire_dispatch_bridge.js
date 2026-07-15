const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DISPATCH BRIDGE WIRING
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


// Add import

const importLine=
"const rideDispatch = require('./services/ride_dispatch_bridge');";

if(!code.includes(importLine)){

code=code.replace(
"const rideService = require('./services/rideService');",
"const rideService = require('./services/rideService');\n"+importLine
);

console.log("✅ Added dispatch bridge import");

}
else{

console.log("✅ Dispatch import already exists");

}


// Add dispatch call after ride creation

const target=
"const ride = rideService.createRide(b);";

const inject=
`const ride = rideService.createRide(b);

  rideDispatch.dispatchRide(ride);`;


if(code.includes(target) && !code.includes("rideDispatch.dispatchRide(ride)")){

code=code.replace(
target,
inject
);

console.log("✅ Connected ride creation to dispatch");

}
else{

console.log("✅ Dispatch call already connected");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
VERIFYING
=========================================
`);

