const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDE IDENTITY SYNC FIX
=========================================
`);

let file="backend/services/ride_state_service.js";

let code=fs.readFileSync(file,"utf8");

if(code.includes("CABLINK_RIDE_IDENTITY_FIX")){
 console.log("✅ Already patched");
 process.exit(0);
}


fs.copyFileSync(
 file,
 file+".backup_identity_"+Date.now()
);


// Add marker

code=code.replace(
'const fs=require("fs");',
'// CABLINK_RIDE_IDENTITY_FIX\nconst fs=require("fs");'
);


// replace create function ID generation

code=code.replace(
'id:"RIDE-"+Date.now(),',
'id:ride.id || "RIDE-"+Date.now(),'
);


// make status preserve incoming state

code=code.replace(
'status:"SEARCHING",',
'status:ride.status || "SEARCHING",'
);


fs.writeFileSync(
file,
code
);


console.log(
"✅ Ride state now preserves orchestrator identity"
);

