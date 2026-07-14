const fs=require("fs");

console.log(`
=====================================
🚕 CABLINK PRODUCTION FOUNDATION
=====================================
`);

const dirs=[
"config",
"logs",
"database",
"backend/controllers",
"backend/routes",
"backend/middleware",
"frontend/js/core",
"frontend/js/services",
"frontend/js/intelligence"
];


dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
console.log("✅",d);
});


const files={

"config/version.json":
JSON.stringify({
name:"CabLink",
version:"5.0.0",
stage:"beta-production",
ecosystem:"BSTM"
},null,2),

"logs/.gitkeep":"",

"database/README.md":
"CabLink database layer",

"backend/controllers/README.md":
"Business controllers",

"frontend/js/services/README.md":
"Frontend service layer"

};


for(let f in files){
fs.writeFileSync(f,files[f]);
console.log("✅",f);
}


console.log(`
Production foundation created
`);

