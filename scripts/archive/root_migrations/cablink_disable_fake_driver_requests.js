const fs=require("fs");

console.log(`
=========================================
🚕 DISABLE FAKE DRIVER REQUEST ENGINE
=========================================
`);

let file="index.html";

let code=fs.readFileSync(file,"utf8");


if(code.includes("CABLINK_DISABLE_FAKE_DRIVER_ENGINE")){
 console.log("Already patched");
 process.exit(0);
}


fs.copyFileSync(
file,
file+".backup_fake_driver_"+Date.now()
);


let patch=`

<script>

// =========================================
// CABLINK_DISABLE_FAKE_DRIVER_ENGINE
// =========================================

window.addDriverRequest=function(){

console.log(
"🛑 Fake driver request blocked"
);

};


console.log(
"🚕 Fake request engine disabled"
);

</script>

`;


code=code.replace(
"</body>",
patch+"</body>"
);


fs.writeFileSync(file,code);


console.log(
"✅ Fake driver requests disabled"
);

