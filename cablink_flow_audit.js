const fs=require("fs");

console.log(`
==================================
🚕 CABLINK RIDE FLOW AUDIT
==================================
`);

const files=[
"index.html",
"frontend/js/app.js",
"frontend/js/core.js",
"fix.js",
"fare_engine.js",
"backend/server.js"
];


let data="";

files.forEach(f=>{
if(fs.existsSync(f)){
data+=fs.readFileSync(f,"utf8")+"\n";
}
});


const systems={

"Pickup location":
[
"pickup",
"location",
"origin"
],

"Destination":
[
"dropoff",
"destination"
],

"Ride booking":
[
"bookRide",
"rides/book"
],

"Driver matching":
[
"driver",
"match",
"available"
],

"Trip status":
[
"status",
"accepted",
"completed"
],

"Payment":
[
"payment",
"wallet",
"transaction"
],

"THB rewards":
[
"THB",
"reward",
"token"
],

"Fare calculation":
[
"calculateFare",
"fare"
]

};


for(let s in systems){

let found=systems[s].filter(x=>data.includes(x));

console.log(
found.length?
"✅":"❌",
s,
found.join(", ")
);

}


console.log(`
==================================
Flow audit complete
==================================
`);
