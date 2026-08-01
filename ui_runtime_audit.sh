#!/data/data/com.termux/files/usr/bin/bash

echo "============================================================"
echo "CABLINK UI RUNTIME AUDIT"
echo "============================================================"

echo
echo "=== GLOBAL FUNCTION AVAILABILITY ==="

node <<'NODE'
const fs=require("fs");

let files=[
"index.html",
"fix.js",
"role.js",
"fare_engine.js",
"frontend/js/app_core.js",
"frontend/js/rides/rideStateMachine.js",
"frontend/js/rides/passengerRideStatus.js",
"frontend/js/driver/driverLifecycleControls.js",
"frontend/js/rides/completionRewardBridge.js"
];

let all="";

for(let f of files){
 if(fs.existsSync(f)){
   all+=fs.readFileSync(f,"utf8")+"\n";
 }
}

let funcs=[
"bookRide",
"cancelRide",
"toggleDriverMode",
"connectWallet",
"claimReward",
"claimDaily",
"openSOS",
"showScreen",
"detectLocation",
"toggleChat",
"sendChat",
"submitRating"
];

for(let fn of funcs){

 if(
 all.includes("function "+fn) ||
 all.includes("window."+fn)
 )
 console.log("✅",fn);
 else
 console.log("❌",fn);

}

NODE


echo
echo "=== API CONNECTION REFERENCES ==="

grep -RIn "/api/rides" frontend index.html role.js fix.js fare_engine.js \
| head -30


echo
echo "=== CONSOLE ERROR SEARCH ==="

grep -RIn "console.error\|throw new Error" frontend index.html \
| head -30


echo
echo "=== SERVICE WORKER ==="

grep -n "serviceWorker" index.html sw.js || true


echo
echo "============================================================"
echo "RUNTIME AUDIT COMPLETE"
echo "============================================================"

