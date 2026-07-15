const fs=require("fs");

const file="frontend/index.html";

const text=fs.readFileSync(file,"utf8");

const patterns=[
"simulateRide",
"addDriverRequest",
"Math.random",
"drivers nearby",
"ETA"
];

fs.mkdirSync("archive/frontend_cleanup",{recursive:true});

fs.writeFileSync(
"archive/frontend_cleanup/index_before_truth_migration.html",
text
);

console.log(`
=========================================
🚕 CABLINK FAKE LOGIC EXTRACTION REPORT
=========================================
`);

patterns.forEach(p=>{

let positions=[];
let index=text.indexOf(p);

while(index!==-1){
positions.push(index);
index=text.indexOf(p,index+1);
}

console.log(
p,
"found:",
positions.length,
"times"
);

});

console.log(`
Backup created:
archive/frontend_cleanup/index_before_truth_migration.html

Next step:
Separate UI from state engine.
`);

