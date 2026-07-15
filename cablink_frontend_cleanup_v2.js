const fs=require("fs");

const file="frontend/index.html";

if(!fs.existsSync(file)){
    console.log("❌ frontend/index.html not found");
    process.exit(1);
}

fs.mkdirSync("archive/frontend_cleanup",{recursive:true});

const backup="archive/frontend_cleanup/index_before_cleanup_"+Date.now()+".html";

fs.copyFileSync(file,backup);

let html=fs.readFileSync(file,"utf8");

console.log("✅ Backup:",backup);


/* --------------------------------------------------
Remove Simulate Ride button
---------------------------------------------------*/

html=html.replace(
/\s*<button[^>]*id=["']simBtn["'][\s\S]*?<\/button>\s*/m,
"\n"
);


/* --------------------------------------------------
Remove simBtn enable/disable
---------------------------------------------------*/

html=html.replace(
/.*document\.getElementById\(['"]simBtn['"]\)\.disabled\s*=\s*true;.*\n?/g,
""
);

html=html.replace(
/.*document\.getElementById\(['"]simBtn['"]\)\.disabled\s*=\s*false;.*\n?/g,
""
);


/* --------------------------------------------------
Disable simulateRide()
---------------------------------------------------*/

html=html.replace(
/function\s+simulateRide\s*\([^)]*\)\s*\{[\s\S]*?\n\}/,
`function simulateRide(){
    console.log("Simulation removed.");
}`
);


/* --------------------------------------------------
Remove demo wording
---------------------------------------------------*/

html=html.replace(/Book or simulate a ride first/g,"Book a ride first");

html=html.replace(/Simulate ride \(test mode\)/g,"");

html=html.replace(/Request ride · Earn 1 THB/g,"Request Ride");


fs.writeFileSync(file,html);

console.log("");

console.log("======================================");
console.log("✅ FRONTEND CLEANUP COMPLETE");
console.log("======================================");
