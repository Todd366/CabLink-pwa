const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK STATE CREATE ORDER FIX
=========================================
`);

let file="backend/services/ride_state_service.js";

let code=fs.readFileSync(file,"utf8");

fs.copyFileSync(
file,
file+".backup_create_order_"+Date.now()
);


let start=code.indexOf("function create(ride){");

let end=code.indexOf("\n\n\nfunction update",start);


if(start===-1 || end===-1){
 console.log("❌ create function boundaries not found");
 process.exit(1);
}


let replacement=`function create(ride){

const db=load();

const item={

...ride,

id:ride.id || "RIDE-"+Date.now(),

status:ride.status || "SEARCHING",

created:new Date().toISOString()

};


db.rides.push(item);

save(db);

return item;

}`;

code=
code.substring(0,start)
+
replacement
+
code.substring(end);


fs.writeFileSync(file,code);


console.log(
"✅ ride_state_service.create repaired"
);

