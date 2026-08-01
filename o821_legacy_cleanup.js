const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.21 — LEGACY LIFECYCLE CLEANUP
==============================================
`);

const backupDir="backups/o821_auto";

if(!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir,{recursive:true});
}

function backup(file){

    if(fs.existsSync(file)){

        const dest =
        backupDir + "/" +
        file.replace(/[\/\\]/g,"_");

        fs.copyFileSync(file,dest);

        console.log("BACKUP:",file);
    }
}


function replace(file,oldText,newText){

    if(!fs.existsSync(file)) return;

    let data=fs.readFileSync(file,"utf8");

    if(data.includes(oldText)){

        backup(file);

        data=data.replace(oldText,newText);

        fs.writeFileSync(file,data);

        console.log("PATCHED:",file);

    }
}


// ==============================================
// 1. Update simulation lifecycle names
// ==============================================

replace(
"frontend/js/simulation_engine.js",
"DRIVER_ACCEPTED",
"DRIVER_ASSIGNED"
);


replace(
"frontend/js/simulation_engine.js",
"ARRIVING",
"DRIVER_ARRIVED"
);


// ==============================================
// 2. Check backend legacy engine usage
// ==============================================

console.log(`
==============================================
BACKEND LEGACY IMPORT AUDIT
==============================================
`);

function walk(dir){

    if(!fs.existsSync(dir)) return;

    for(const f of fs.readdirSync(dir)){

        const full=dir+"/"+f;

        if(fs.statSync(full).isDirectory()){
            walk(full);
            continue;
        }

        if(!full.endsWith(".js")) continue;

        const data=fs.readFileSync(full,"utf8");

        if(
            data.includes("rides/ride_engine") ||
            data.includes("ride_state_engine") ||
            data.includes("ride_status")
        ){

            console.log(
                "IMPORT/REFERENCE:",
                full
            );

        }

    }

}

walk("backend");


// ==============================================
// 3. Final lifecycle keyword audit
// ==============================================

console.log(`
==============================================
FINAL O.8.21 AUDIT
==============================================
`);

walk("frontend/js");

const checks=[
"DRIVER_ACCEPTED",
"ARRIVING",
"CABLINK_RIDE_STATE.set",
'ride.status="TRIP_COMPLETE"'
];

for(const c of checks){

console.log(
"CHECK:",
c
);

}


console.log(`
==============================================
O.8.21 COMPLETE
==============================================
`);

