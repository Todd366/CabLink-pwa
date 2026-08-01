const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.31 — API CONTRACT AUDIT
==============================================
`);

const files=[
"backend/routes/rides.js",
"backend/routes/completion_api.js",
"backend/routes/live_ride_api.js",
"backend/routes/canonical_reward_api.js",
"backend/server.js"
];


for(const file of files){

console.log("\nFILE:",file);

if(!fs.existsSync(file)){
 console.log("MISSING");
 continue;
}

let d=fs.readFileSync(file,"utf8");

let matches=d.match(
/router\.(post|get|patch|put)\([^\n]+/g
);

if(matches){
 matches.forEach(x=>console.log(x.trim()));
}

}


console.log(`
==============================================
O.8.31 COMPLETE
==============================================
`);
