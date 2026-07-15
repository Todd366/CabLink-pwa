const fs=require("fs");

const file="frontend/js/app.js";

console.log(`
=========================================
🚕 CABLINK BOOKRIDE BACKEND CONNECTOR
=========================================
`);

if(!fs.existsSync(file)){
 console.log("❌ app.js missing");
 process.exit(1);
}

let code=fs.readFileSync(file,"utf8");


if(code.includes("CABLINK_BOOKING_BACKEND_CONNECTED")){
 console.log("✅ Already connected");
 process.exit(0);
}


fs.copyFileSync(
 file,
 file+".backup_booking_"+Date.now()
);


let marker="window.bookRide = function() {";


let index=code.indexOf(marker);


if(index===-1){
 console.log("❌ bookRide function not found");
 process.exit(1);
}


let insert=`

// =========================================
// CABLINK_BOOKING_BACKEND_CONNECTED
// =========================================

sendRideToBackend({

pickup:
document.getElementById("pickup")?.value ||
"BSTM HQ, Mmopane",

dropoff:
document.getElementById("dropoff")?.value ||
"Game City Mall",

fare:
Number(
document.getElementById("fare")?.value ||
20
),

vehicle:
window.STATE?.vehicle ||
"standard"

});


`;


let position=index+marker.length;


code=
code.slice(0,position)
+
insert
+
code.slice(position);


fs.writeFileSync(file,code);


console.log("✅ bookRide connected to backend");
console.log("✅ Backup created");
console.log("=========================================");
