const fs=require("fs");

console.log("\n🔥 CABLINK CURRENT STATE AUDIT\n");

function check(file){
    return fs.existsSync(file) ? "✅" : "❌";
}

console.log("FILES:");
[
"index.html",
"fix.js",
"role.js",
"frontend/js/app.js",
"frontend/js/core.js",
"manifest.json",
"sw.js",
"package.json"
].forEach(f=>{
    console.log(check(f),f);
});


console.log("\nSCRIPTS LOADED:");

let html=fs.readFileSync("index.html","utf8");

[
"fix.js",
"role.js",
"frontend/js/app.js",
"frontend/js/core.js"
].forEach(s=>{
    console.log(
        html.includes(s) ? "✅ "+s : "❌ "+s
    );
});


console.log("\nFEATURE CHECK:");

[
["Wallet","THoBoCoin"],
["Driver Mode","driver"],
["Booking","bookRide"],
["Profile","profile"],
["Navigation","#nav"],
["Firebase","firebase"],
["Contract","0xaf2f749ea89b3aa9a2d2028dba4004cb3c615628"]
].forEach(x=>{
    console.log(
        html.includes(x[1])
        ? "✅ "+x[0]
        : "⚠️ "+x[0]
    );
});


console.log("\nRECENT BACKUPS:");
fs.readdirSync(".")
.filter(x=>x.includes("backup")||x.includes("old")||x.includes("bak"))
.slice(-10)
.forEach(x=>console.log("•",x));


console.log("\n🔥 Audit Complete\n");
