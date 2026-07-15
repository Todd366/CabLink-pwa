const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK APP RUNTIME INSPECTOR
=========================================
`);

let files=[
"frontend/App.jsx",
"frontend/main.jsx"
];


files.forEach(file=>{

if(!fs.existsSync(file)){
console.log("❌ Missing:",file);
return;
}

console.log("\n==============================");
console.log(file);
console.log("==============================");

let data=fs.readFileSync(file,"utf8");

console.log(data.substring(0,5000));

});


console.log(`
=========================================
END INSPECTION
=========================================
`);

