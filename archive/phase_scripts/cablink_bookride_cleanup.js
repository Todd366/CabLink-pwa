const fs = require("fs");

console.log(`
=========================================
🚕 CABLINK BOOKRIDE CLEANUP ENGINE
=========================================
`);

const file="index.html";

if(!fs.existsSync(file)){
 console.log("❌ index.html missing");
 process.exit(1);
}

let code=fs.readFileSync(file,"utf8");

// backup
const backup="index_backup_before_bookride_cleanup.html";
fs.writeFileSync(backup,code);

console.log("✅ Backup created:",backup);


// Count bookRide overrides
const matches=[...code.matchAll(/window\.bookRide\s*=\s*async function\s*\(\)\s*\{/g)];

console.log("Detected bookRide overrides:",matches.length);


// Remove duplicate runtime blocks
let removed=0;

const markers=[
"// CABLINK_RIDE_RUNTIME_BRIDGE",
"// CABLINK_REAL_ONLY_MODE"
];

for(const marker of markers){

 const start=code.indexOf(marker);

 if(start!==-1){

   const scriptStart=code.lastIndexOf("<script>",start);
   const scriptEnd=code.indexOf("</script>",start);

   if(scriptStart!==-1 && scriptEnd!==-1){

      const block=code.slice(scriptStart,scriptEnd+9);

      if(block.includes("window.bookRide")){

        code=
        code.slice(0,scriptStart)+
        "\n<!-- Removed duplicate runtime block -->\n"+
        code.slice(scriptEnd+9);

        removed++;

        console.log("🧹 Removed duplicate:",marker);
      }
   }
 }
}


// Add single bridge marker
if(!code.includes("CABLINK_SINGLE_RIDE_BRIDGE")){

code += `

<script>

// =========================================
// CABLINK_SINGLE_RIDE_BRIDGE
// =========================================

console.log("🚕 Single ride bridge active");

</script>

`;

}


fs.writeFileSync(file,code);


console.log(`
=========================================
✅ CLEANUP COMPLETE

Backup:
${backup}

Removed blocks:
${removed}

Next:
npm run dev

=========================================
`);

