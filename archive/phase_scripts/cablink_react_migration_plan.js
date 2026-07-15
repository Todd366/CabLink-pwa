const fs=require("fs");
const path=require("path");

console.log(`
=========================================
🚕 CABLINK REACT MIGRATION PLANNER
=========================================
`);

function files(dir){

    if(!fs.existsSync(dir))
        return [];

    return fs.readdirSync(dir)
    .filter(f=>fs.statSync(path.join(dir,f)).isFile())
    .sort();

}

const groups=[
["pages","frontend/pages"],
["screens","frontend/screens"],
["components","frontend/components"],
["services","frontend/services"],
["state","frontend/state"],
["maps","frontend/maps"],
["mobile","frontend/mobile"],
["api","frontend/api"],
["js","frontend/js"]
];

const report={};

groups.forEach(([name,dir])=>{

    report[name]=files(dir);

});

fs.writeFileSync(
"CABLINK_REACT_MIGRATION_PLAN.json",
JSON.stringify(report,null,2)
);

console.log("\n=========== MIGRATION ORDER ===========\n");

let phase=1;

groups.forEach(([name])=>{

    console.log(`Phase ${phase++} : ${name.toUpperCase()}`);

    report[name].forEach(f=>{
        console.log("   •",f);
    });

    console.log("");

});

console.log(`
=========================================
Saved:

CABLINK_REACT_MIGRATION_PLAN.json
=========================================
`);
