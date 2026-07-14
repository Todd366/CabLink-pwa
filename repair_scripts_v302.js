const fs=require("fs");

console.log("\n🔥 CabLink v302 Script Architecture Repair\n");

const file="index.html";

let html=fs.readFileSync(file,"utf8");

fs.writeFileSync(
`index_before_script_repair_${Date.now()}.html`,
html
);

console.log("✅ Backup created");


function removeScripts(src){
    const regex=new RegExp(
      `<script[^>]+src=["']${src}["'][^>]*></script>`,
      "g"
    );

    html=html.replace(regex,"");
}


function addScript(src){

    const tag=`<script src="${src}?v=${Date.now()}"></script>\n`;

    html += "\n"+tag;

    console.log("Added:",src);
}


// remove old duplicates
[
"frontend/js/app.js",
"frontend/js/core.js",
"role.js"
].forEach(removeScripts);


// add in correct order
addScript("frontend/js/app.js");
addScript("frontend/js/core.js");
addScript("role.js");


// save

fs.writeFileSync(file,html);


console.log("\n===== VERIFY =====");

const check=fs.readFileSync(file,"utf8");

[
"frontend/js/app.js",
"frontend/js/core.js",
"role.js"
].forEach(x=>{
 console.log(
 check.includes(x)
 ?"✅ "+x
 :"❌ "+x
 );
});


console.log("\n🔥 Repair complete");
console.log("Now restart server and HARD refresh browser");
