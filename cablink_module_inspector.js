const modules=[
"./backend/auth/auth_engine",
"./backend/rides/ride_engine",
"./backend/fare/fare_engine",
"./backend/matching/matching_engine",
"./backend/payments/payment_engine",
"./backend/rides/settlement_engine"
];

console.log(`
=========================================
🚕 CABLINK MODULE EXPORT INSPECTOR
=========================================
`);

modules.forEach(m=>{

try{

let mod=require(m);

console.log("\nMODULE:",m);

console.log(
"EXPORTS:",
Object.keys(mod)
);

}catch(e){

console.log(
"\nFAILED:",
m,
e.message
);

}

});

