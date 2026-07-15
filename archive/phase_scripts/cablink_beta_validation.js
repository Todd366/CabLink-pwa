const health=require("./beta/health/production_health");

console.log(`

=========================================
🚕 CABLINK BETA VALIDATION
=========================================

`);

let passed=
Object.values(health)
.filter(Boolean)
.length;


let total=
Object.keys(health).length;


console.log(
"Health:",
Math.round(passed/total*100)+"%"
);


require("./beta/tests/ride_tests");


console.log(`

=========================================
BETA FOUNDATION READY

=========================================

`);

