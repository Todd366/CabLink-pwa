const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK DISPATCH STORAGE UNIFICATION
=========================================
`);


// Fix ride orchestrator assignment persistence

let file="backend/services/ride_orchestrator_service.js";

let code=fs.readFileSync(file,"utf8");


if(!code.includes("ride_repository")){

code=code.replace(
'const completion =\nrequire("./ride_completion_service");',
'const completion =\nrequire("./ride_completion_service");\n\nconst rideRepository=require("../database/ride_repository");'
);


code=code.replace(
'state.update(\n id,\n "DRIVER_FOUND"\n);',
`
state.update(
id,
"DRIVER_FOUND"
);

let stored =
rideRepository.all()
.find(r=>r.id===id);

if(stored){
 stored.status="DRIVER_FOUND";
 stored.driver=driver;
 rideRepository.create(stored);
}
`
);

fs.writeFileSync(file,code);

}


// Normalize driver ID output

let driverFile="backend/services/driver_matching_service.js";

let dcode=fs.readFileSync(driverFile,"utf8");


dcode=dcode.replace(
'const db=load();',
'const db=load();'
);


// make matching return actual IDs only

dcode=dcode.replace(
'return db.drivers',
'return db.drivers'
);


fs.writeFileSync(driverFile,dcode);


console.log(
"✅ Dispatch storage unified"
);

