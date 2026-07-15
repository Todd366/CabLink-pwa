const fs=require("fs");

console.log("\n🚕 CABLINK v305 RUNTIME LOGIC CHECK\n");

const files=[
"index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"role.js",
"fix.js"
];


files.forEach(f=>{

if(!fs.existsSync(f)){
console.log("❌ Missing:",f);
return;
}

let data=fs.readFileSync(f,"utf8");

console.log("\nFILE:",f);

[
"bookRide",
"showScreen",
"STATE",
"role",
"driver",
"wallet",
"THB",
"firebase",
"localStorage",
"toast"
].forEach(term=>{

if(data.includes(term)){
console.log(" ✅",term);
}

});

});


console.log("\n=== ROLE.JS INSPECTION ===");

if(fs.existsSync("role.js")){

let role=fs.readFileSync("role.js","utf8");

[
"Founder",
"Driver",
"Rider",
"role",
"localStorage"
].forEach(x=>{

console.log(
role.includes(x)
?"✅ "+x
:"⚠️ "+x
);

});

}


console.log("\n=== HTML SCREENS ===");

let html=fs.readFileSync("index.html","utf8");

[
"home",
"rewards",
"driver",
"profile",
"more"
].forEach(x=>{

console.log(
html.includes(x)
?"✅ "+x+" screen"
:"⚠️ "+x
);

});


console.log("\n🔥 Runtime check complete");
console.log("No files modified.");
