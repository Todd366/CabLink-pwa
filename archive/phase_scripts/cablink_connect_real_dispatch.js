const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REAL DISPATCH CONNECTION FIX
=========================================
`);

let file="backend/routes/rides.js";

let code=fs.readFileSync(file,"utf8");

if(code.includes("ride_orchestrator_service")){
console.log("✅ Already connected");
process.exit(0);
}


// backup

fs.copyFileSync(
file,
file+".backup_dispatch_"+Date.now()
);


// replace imports

code=code.replace(
'const rides=require("../database/ride_repository");',
'const rides=require("../database/ride_repository");\nconst orchestrator=require("../services/ride_orchestrator_service");'
);


// remove repository create line and replace with orchestrator

code=code.replace(
'rides.create(ride);',
`
let liveRide=
orchestrator.createRide(ride);

ride.id=liveRide.id;
`
);


// replace matching assignment section

code=code.replace(
`
let assigned=
orchestrator.assignDriver(
ride.id,
nearest
);
`,
`
let assigned=
orchestrator.assignDriver(
ride.id,
nearest
);

ride=assigned;
`
);


fs.writeFileSync(
file,
code
);


console.log(
"✅ Passenger → Orchestrator → Matching bridge installed"
);

