const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PRODUCTION URL FIX
=========================================
`);

const files=[
"frontend/api/cablink_api.js",
"frontend/api/task_api.js",
"frontend/services/economy_dashboard_api.js",
"frontend/config/app_config.js"
];


for(const file of files){

if(!fs.existsSync(file)){
 console.log("⚠️ Missing:",file);
 continue;
}

let code=fs.readFileSync(file,"utf8");


code=code.replace(
/["']http:\/\/localhost:3000["']/g,
"import.meta.env.VITE_CABLINK_API_URL || ''"
);


fs.writeFileSync(file,code);

console.log("✅ Updated:",file);

}


// vite config
const vite="vite.config.js";

if(fs.existsSync(vite)){

let code=fs.readFileSync(vite,"utf8");

code=code.replace(
"http://localhost:3000",
"process.env.CABLINK_API_URL || 'http://localhost:3000'"
);

fs.writeFileSync(vite,code);

console.log("✅ Updated vite proxy");

}


console.log(`
=========================================
COMPLETE

Frontend now supports:

Development:
localhost proxy

Production:
VITE_CABLINK_API_URL

=========================================
`);

