const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.24 — SERVICE WRAPPER FINALIZATION
==============================================
`);

const backupDir="backups/o824_auto";

if(!fs.existsSync(backupDir)){
 fs.mkdirSync(backupDir,{recursive:true});
}

function disable(file,name){

 if(!fs.existsSync(file)) return;

 fs.copyFileSync(
  file,
  backupDir+"/"+file.replace(/[\/\\]/g,"_")
 );

 fs.writeFileSync(
 file,
`/*
 CABLINK O.8.24

 LEGACY SERVICE WRAPPER

 Canonical lifecycle:
 backend/canonical/ride_engine.js

 This module no longer owns ride status.
*/

module.exports={
 disabled:true,
 canonical:
 "backend/canonical/ride_engine.js",
 name:
 "${name}"
};
`
 );

 console.log("CONVERTED:",file);

}


disable(
"backend/services/rideService.js",
"legacy ride service"
);


disable(
"backend/services/ride_economy_service.js",
"legacy ride economy service"
);


console.log(`
==============================================
O.8.24 COMPLETE
==============================================
`);
