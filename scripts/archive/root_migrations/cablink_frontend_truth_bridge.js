const fs=require("fs");

const file="frontend/index.html";

let s=fs.readFileSync(file,"utf8");

if(s.includes("CABLINK_TRUTH_BRIDGE")){
console.log("✅ Bridge already installed");
process.exit();
}

const inject=`

<script type="module">

/*

🚕 CABLINK_TRUTH_BRIDGE

Connect UI events to real backend.

*/

import {
requestRealRide
} from "./js/rides/rideController.js";


window.requestRealCabLinkRide =
async function(data){

console.log(
"Sending REAL ride request",
data
);

const ride=
await requestRealRide(data);


console.log(
"Backend ride:",
ride
);


return ride;

};


</script>

`;

s=s.replace(
"</body>",
inject+"</body>"
);

fs.writeFileSync(file,s);

console.log("✅ Truth bridge installed");

