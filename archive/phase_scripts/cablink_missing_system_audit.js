const fs=require("fs");


console.log(`
=========================================
🚕 CABLINK PRODUCTION GAP AUDIT
=========================================
`);


const checks={


"GPS Module":
"frontend/js/gps/location_engine.js",

"Realtime Tracking":
"frontend/js/realtime/tracking_engine.js",

"Location Backend":
"backend/services/location/location_service.js",

"Realtime Backend":
"backend/services/realtime/realtime_service.js",

"Notifications":
"backend/services/notifications/notification_service.js",

"Location Database":
"database/schema/location.json",

"Notification Database":
"database/schema/notifications.json",

"Admin Space":
"admin"

};



let pass=0;


Object.entries(checks).forEach(([name,file])=>{

if(fs.existsSync(file)){

console.log("✅",name);
pass++;

}else{

console.log("❌",name);

}

});


let score=Math.round(
(pass/Object.keys(checks).length)*100
);


console.log(`

=========================================

PRODUCTION INFRASTRUCTURE SCORE

${score}%

=========================================

`);

fs.writeFileSync(
"CABLINK_REAL_WORLD_AUDIT.txt",
"Score: "+score+"%"
);


