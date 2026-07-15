const fs = require("fs");
const path = require("path");

console.log(`
=========================================
🚕 CABLINK ARCHITECTURE CLEANUP ENGINE
=========================================
`);

const folders = [
  "backend/routes",
  "backend/services",
  "backend/database",
  "backend/models",
  "backend/middleware",
  "frontend/components",
  "frontend/services",
  "frontend/pages",
  "tests",
  "docs",
  "archive"
];

for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder,{recursive:true});
    console.log("✅ Created:",folder);
  } else {
    console.log("✔ Exists:",folder);
  }
}


// Files that are historical experiments
const archivePatterns = [
  /^cablink_phase.*\.js$/,
  /^index_.*backup.*\.html$/,
  /^index.*\.bak.*$/,
  /^.*_backup.*$/,
  /^.*\.old$/
];


const rootFiles = fs.readdirSync(".").filter(f=>{
  return fs.statSync(f).isFile();
});


for(const file of rootFiles){

  if(archivePatterns.some(p=>p.test(file))){

    const target=path.join("archive",file);

    if(!fs.existsSync(target)){
      fs.renameSync(file,target);
      console.log("📦 Archived:",file);
    }

  }

}


// Create architecture report

let report = `
CABLINK ARCHITECTURE MAP
========================

Created:
- backend/routes
- backend/services
- backend/database
- frontend/components
- frontend/services
- tests
- docs
- archive

Next migration targets:

1. server.js
   -> only server startup

2. ride routes
   -> backend/routes/rides.js

3. ride business logic
   -> backend/services/rideService.js

4. storage
   -> backend/database/rideRepository.js

`;

fs.writeFileSync(
"CABLINK_ARCHITECTURE_REPORT.md",
report
);

console.log(`
=========================================
✅ ARCHITECTURE FOUNDATION COMPLETE
=========================================

Created:
CABLINK_ARCHITECTURE_REPORT.md

No production logic deleted.
No active code changed.

Next step:
Move ride lifecycle into one truth engine.
`);

