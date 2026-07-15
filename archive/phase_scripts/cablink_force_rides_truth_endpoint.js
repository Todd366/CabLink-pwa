const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK FORCE RIDES TRUTH ENDPOINT
=========================================
`);

let file="backend/routes/rides.js";

let code=fs.readFileSync(file,"utf8");

fs.copyFileSync(
file,
file+".backup_truth_"+Date.now()
);


// replace GET route completely

let start=code.indexOf('router.get(');

let end=code.indexOf('router.patch(',start);


if(start!==-1 && end!==-1){

let replacement=`
router.get(
"/",
(req,res)=>{

const db=require("../storage/database");

let data=db.read();

console.log(
"📦 rides endpoint count:",
data.rides.length
);

res.json({

success:true,

count:data.rides.length,

rides:data.rides

});

}

);


`;

code=
code.substring(0,start)
+
replacement
+
code.substring(end);


fs.writeFileSync(file,code);

console.log(
"✅ GET /api/rides now reads directly from database truth"
);

}else{

console.log(
"❌ Could not locate GET route"
);

}

