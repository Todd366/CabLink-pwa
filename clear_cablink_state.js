console.log(`
=========================================
🚕 CABLINK STATE RESET TOOL
=========================================
`);

const keys=[
"cl6_state",
"cablink_state",
"rideState",
"activeRide",
"currentRide"
];

console.log("Browser storage keys to remove:");

keys.forEach(k=>{
 console.log("❌",k);
});

console.log(`
Open CabLink browser console and run:

${keys.map(k=>`localStorage.removeItem("${k}")`).join("\n")}

Then refresh the app.
`);

