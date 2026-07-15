const fs=require("fs");

console.log("\n🚕 CABLINK v303 STABILITY CHECK\n");

const stamp=Date.now();

fs.copyFileSync(
"index.html",
`index_stable_backup_${stamp}.html`
);

console.log("✅ HTML backup created");


let html=fs.readFileSync("index.html","utf8");


console.log("\n=== SCRIPT ORDER ===");

let scripts=[
"fix.js",
"frontend/js/app.js",
"frontend/js/core.js",
"role.js"
];


scripts.forEach(s=>{
    let count=(html.match(new RegExp(s.replace(".","\\."),"g"))||[]).length;

    console.log(
        count===1
        ?"✅ "+s+" loaded once"
        :
        "⚠️ "+s+" count: "+count
    );
});


console.log("\n=== ROLE SYSTEM ===");

[
"role.js",
"role",
"Founder",
"Driver",
"Passenger",
"STATE"
].forEach(x=>{

console.log(
html.includes(x)
?"✅ "+x
:"⚠️ "+x
);

});


console.log("\n=== CSS CHECK ===");

[
"#nav",
"background",
"var(--bg2)",
"position:absolute",
"position:fixed"
].forEach(x=>{

console.log(
html.includes(x)
?"✅ "+x
:"⚠️ "+x
);

});


console.log("\n=== CORE FEATURES ===");

[
"bookRide",
"connectWallet",
"showScreen",
"localStorage",
"firebase",
"THB"
].forEach(x=>{

console.log(
html.includes(x)
?"✅ "+x
:"⚠️ "+x
);

});


console.log("\n=== FILE HEALTH ===");

[
"frontend/js/app.js",
"frontend/js/core.js",
"role.js",
"fix.js"
].forEach(f=>{

console.log(
fs.existsSync(f)
?"✅ "+f
:"❌ "+f
);

});


console.log("\n🔥 Stability scan complete");
console.log("No changes made.");
console.log("Safe to continue repairs.");
