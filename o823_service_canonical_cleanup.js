const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.23 — SERVICE CANONICAL MIGRATION
==============================================
`);

const backupDir="backups/o823_auto";

if(!fs.existsSync(backupDir)){
 fs.mkdirSync(backupDir,{recursive:true});
}

function backup(file){
 if(fs.existsSync(file)){
  fs.copyFileSync(
   file,
   backupDir+"/"+file.replace(/[\/\\]/g,"_")
  );
  console.log("BACKUP:",file);
 }
}

function patch(file,old,newText){

 if(!fs.existsSync(file)) return;

 let d=fs.readFileSync(file,"utf8");

 if(d.includes(old)){
  backup(file);
  d=d.replace(old,newText);
  fs.writeFileSync(file,d);
  console.log("PATCHED:",file);
 }
}


// Remove direct status mutations

[
"backend/services/live_ride_service.js",
"backend/services/ride_economy_service.js",
"backend/services/ride_orchestrator_service.js",
"backend/services/rideService.js",
"backend/database/ride_repository.js"

].forEach(file=>{

 patch(
 file,
 'ride.status="DRIVER_FOUND";',
 'console.warn("[CABLINK] Legacy DRIVER_FOUND mutation blocked");'
 );

 patch(
 file,
 'ride.status="COMPLETED";',
 'console.warn("[CABLINK] Legacy COMPLETED mutation blocked");'
 );

 patch(
 file,
 'ride.status=status;',
 'console.warn("[CABLINK] Legacy status mutation blocked");'
 );

});

console.log(`
==============================================
O.8.23 COMPLETE
==============================================
`);
