const fs=require("fs");

console.log(`
==============================================
CABLINK O.8.37 — COMPLETION CANONICAL FIX
==============================================
`);

const file=
"backend/services/ride_completion_service.js";


let d=fs.readFileSync(file,"utf8");


const backup=
"backups/o837_completion_fix";


fs.mkdirSync(
backup,
{recursive:true}
);


fs.copyFileSync(
file,
backup+"/ride_completion_service.js"
);


if(!d.includes("engine.getRide(ride.id)")){

console.log(
"Canonical lookup missing"
);

}else{

console.log(
"Canonical lookup already present"
);

}


d=d.replace(
`let canonicalRide =
engine.getRide(ride.id);`,
`let canonicalRide =
engine.getRide(
    ride.id
);

if(!canonicalRide){

return {

success:false,

error:"Canonical ride not found",

rideId:ride.id

};

}`
);


fs.writeFileSync(
file,
d
);


console.log(`
BACKUP:
${backup}/ride_completion_service.js

==============================================
O.8.37 COMPLETE
==============================================
`);
