const fs=require("fs");

const file="index.html";

let code=fs.readFileSync(file,"utf8");

const backup="index_backup_before_driver_override_remove.html";
fs.writeFileSync(backup,code);

console.log("Backup:",backup);


const startMarker="// CABLINK_DRIVER_REALITY_PATCH";
const endMarker="// CABLINK_DISABLE_FAKE_DRIVER_ENGINE";

const start=code.indexOf(startMarker);
const end=code.indexOf(endMarker);

if(start===-1){
 console.log("❌ Driver reality patch not found");
 process.exit();
}

if(end===-1){
 console.log("❌ End marker not found");
 process.exit();
}

const before=code.lastIndexOf("<script>",start);
const after=code.indexOf("</script>",end);

if(before===-1 || after===-1){
 console.log("❌ Script boundaries missing");
 process.exit();
}


code =
code.slice(0,before) +
"\n<!-- Removed CABLINK_DRIVER_REALITY_PATCH override -->\n" +
code.slice(after+9);


fs.writeFileSync(file,code);

console.log(`
=================================
✅ DRIVER OVERRIDE REMOVED

Old override deleted.
Original toggleDriverMode restored.

Next:
restart Vite
test driver online mode
=================================
`);
