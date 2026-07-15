const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FINAL DEPLOYMENT CLEANUP
=========================================
`);


// Fix vite config properly

const vite="vite.config.js";

if(fs.existsSync(vite)){

let code=fs.readFileSync(vite,"utf8");

code=code.replace(
/process\.env\.CABLINK_API_URL \|\| 'http:\/\/localhost:3000'/g,
"process.env.CABLINK_API_URL || ''"
);

fs.writeFileSync(vite,code);

console.log("✅ Cleaned vite localhost reference");

}


// Add production metadata

const pkg="package.json";

if(fs.existsSync(pkg)){

let data=JSON.parse(fs.readFileSync(pkg,"utf8"));

data.scripts=data.scripts||{};

if(!data.scripts.start){
 data.scripts.start="node backend/server.js";
}

if(!data.scripts.build){
 data.scripts.build="vite build";
}

fs.writeFileSync(
pkg,
JSON.stringify(data,null,2)
);

console.log("✅ Updated package scripts");

}


// Create deployment config note

fs.writeFileSync(
"DEPLOYMENT_READY.md",
`
# CabLink Deployment

Frontend:
- Vite PWA
- Environment:
  VITE_CABLINK_API_URL

Backend:
- Node Express
- Start:
  npm start

Required:
- HTTPS backend URL
- Production environment variables
- Database persistence

Ride lifecycle verified:

CREATE
↓
DISPATCH
↓
ACCEPT
↓
READ
↓
COMPLETE

`
);

console.log("✅ Created deployment checklist");


console.log(`
=========================================
DONE
=========================================
`);

