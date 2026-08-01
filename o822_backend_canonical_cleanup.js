const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.22 — BACKEND CANONICAL ISOLATION
==============================================
`);

const backupDir="backups/o822_auto";

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


function disable(file,name){

    if(!fs.existsSync(file)) return;

    backup(file);

    fs.writeFileSync(
        file,
`/*
 CABLINK O.8.22

 LEGACY MODULE DISABLED

 Canonical authority:
 backend/canonical/ride_engine.js

 This file remains only as compatibility placeholder.

 Disabled:
 ${name}
*/

module.exports={
 disabled:true,
 canonical:
 "backend/canonical/ride_engine.js"
};
`
    );

    console.log("DISABLED:",file);
}


[
["backend/rides/ride_engine.js",
 "legacy backend ride engine"],

["backend/rides/ride_state_engine.js",
 "legacy ride state engine"],

["backend/status/ride_status.js",
 "legacy status registry"]

].forEach(x=>disable(x[0],x[1]));



function patch(file,pattern,replacement){

    if(!fs.existsSync(file)) return;

    let data=fs.readFileSync(file,"utf8");

    if(data.includes(pattern)){

        backup(file);

        data=data.replace(
            pattern,
            replacement
        );

        fs.writeFileSync(file,data);

        console.log("PATCHED:",file);
    }
}


// Block obvious direct status mutation

[
"backend/services/ride_service.js",
"backend/services/live_ride_service.js",
"backend/services/rideService.js",
"backend/services/ride_state_service.js",
"backend/services/economy_ledger_service.js"

].forEach(file=>{

    patch(
        file,
        'ride.status=status;',
        'console.warn("[CABLINK] Legacy status mutation blocked");'
    );

    patch(
        file,
        'ride.status="COMPLETED";',
        'console.warn("[CABLINK] Legacy completion mutation blocked");'
    );

});



console.log(`
==============================================
O.8.22 AUDIT
==============================================
`);

function scan(dir){

if(!fs.existsSync(dir)) return;

for(const f of fs.readdirSync(dir)){

const full=dir+"/"+f;

if(fs.statSync(full).isDirectory()){
scan(full);
continue;
}

if(!full.endsWith(".js")) continue;

const d=fs.readFileSync(full,"utf8");

if(
d.includes("DRIVER_ACCEPTED") ||
d.includes("ARRIVING") ||
d.includes('ride.status=')
){

console.log("REVIEW:",full);

}

}

}

scan("backend");


console.log(`
==============================================
O.8.22 COMPLETE
==============================================
`);

