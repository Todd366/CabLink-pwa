const fs = require("fs");

console.log(`
==============================================
CABLINK O.8.20 — CANONICAL CLEANUP ENGINE
==============================================
`);

const backupDir="backups/o820_auto";

if(!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir,{recursive:true});
}

function backup(file){
    if(fs.existsSync(file)){
        const dest=backupDir+"/"+file.replace(/[\/\\]/g,"_");
        fs.copyFileSync(file,dest);
        console.log("BACKUP:",file);
    }
}

function patch(file,oldText,newText){
    if(!fs.existsSync(file)) return;

    let data=fs.readFileSync(file,"utf8");

    if(data.includes(oldText)){
        backup(file);
        data=data.replace(oldText,newText);
        fs.writeFileSync(file,data);
        console.log("PATCHED:",file);
    }
}


// ------------------------------------------------
// 1. Remove driver frontend state authority
// ------------------------------------------------

patch(
"frontend/js/driver/driverDispatchBridge.js",

`window.CABLINK_RIDE_STATE.set(
"ACCEPTED"
);`,

`console.log(
"[CABLINK] Driver assignment confirmed by canonical backend"
);`
);


// ------------------------------------------------
// 2. Disable old frontend ride engine authority
// ------------------------------------------------

if(fs.existsSync("frontend/js/ride_engine.js")){

backup("frontend/js/ride_engine.js");

fs.writeFileSync(
"frontend/js/ride_engine.js",

`/*
 CABLINK O.8.20

 LEGACY ENGINE DISABLED

 Backend canonical engine:
 backend/canonical/ride_engine.js

 This file is retained only for compatibility.
*/

window.CABLINK_LEGACY_RIDE_ENGINE = {
 disabled:true,
 reason:
 "Backend canonical lifecycle is authoritative"
};
`
);

console.log(
"DISABLED: frontend/js/ride_engine.js"
);

}


// ------------------------------------------------
// 3. Disable operations_core direct status mutation
// ------------------------------------------------

if(fs.existsSync("frontend/js/operations_core.js")){

let file="frontend/js/operations_core.js";
let data=fs.readFileSync(file,"utf8");

if(data.includes('ride.status="TRIP_COMPLETE"')){

backup(file);

data=data.replace(
'ride.status="TRIP_COMPLETE"',
'console.warn("[CABLINK] Legacy TRIP_COMPLETE mutation blocked")'
);

fs.writeFileSync(file,data);

console.log(
"PATCHED:",
file
);

}

}


// ------------------------------------------------
// 4. Audit
// ------------------------------------------------

console.log(`
==============================================
POST CLEANUP AUDIT
==============================================
`);

const targets=[
"frontend/js",
"backend"
];

for(const dir of targets){

if(!fs.existsSync(dir)) continue;

function walk(p){

for(const f of fs.readdirSync(p)){

let full=p+"/"+f;

if(fs.statSync(full).isDirectory()){
walk(full);
continue;
}

if(!full.match(/\.(js)$/)) continue;

let data=fs.readFileSync(full,"utf8");

if(
data.includes("CABLINK_RIDE_STATE.set") ||
data.includes('ride.status="TRIP_COMPLETE"') ||
data.includes("DRIVER_ACCEPTED") ||
data.includes("ARRIVING")
){

console.log("REVIEW:",full);

}

}

}

walk(dir);

}

console.log(`
==============================================
O.8.20 CLEANUP COMPLETE
==============================================
`);
