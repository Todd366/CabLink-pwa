const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 8
PILOT DEPLOYMENT COMMAND CENTER
=========================================
`);

[
"deployment",
"pilot/devices",
"pilot/protocols",
"pilot/reports"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// SERVICE READINESS CHECK

fs.writeFileSync(
"deployment/service_readiness_check.js",
`
require("dotenv").config();


function check(){

return {

cloud_database:{
configured:
Boolean(process.env.DATABASE_URL),
status:
process.env.DATABASE_URL
?
"READY"
:
"WAITING"
},


authentication:{
configured:
Boolean(process.env.AUTH_API_KEY),
status:
process.env.AUTH_API_KEY
?
"READY"
:
"WAITING"
},


maps:{
configured:
Boolean(process.env.MAPS_API_KEY),
status:
process.env.MAPS_API_KEY
?
"READY"
:
"WAITING"
},


sms:{
configured:
Boolean(process.env.SMS_API_KEY),
status:
process.env.SMS_API_KEY
?
"READY"
:
"WAITING"
},


notifications:{
configured:
Boolean(process.env.FCM_SERVER_KEY),
status:
process.env.FCM_SERVER_KEY
?
"READY"
:
"WAITING"
}

};

}


module.exports={
check
};

`
);


// PILOT DEVICE REGISTRY

fs.writeFileSync(
"pilot/devices/device_registry.js",
`
const devices=[];


function register(data){

let device={

id:"DEVICE-"+Date.now(),

user:data.user,

role:data.role,

platform:data.platform,

status:"REGISTERED",

created:new Date().toISOString()

};


devices.push(device);

return device;

}


function all(){

return devices;

}


module.exports={
register,
all
};

`
);


// FIRST RIDE PROTOCOL

fs.writeFileSync(
"pilot/protocols/FIRST_RIDE_PROTOCOL.md",
`
# CabLink First Controlled Ride

## Before Ride

[ ] Driver account verified

[ ] Passenger account verified

[ ] GPS enabled

[ ] Notifications enabled

[ ] Internet connection checked


## Ride

[ ] Passenger requests ride

[ ] Driver receives alert

[ ] Driver accepts

[ ] GPS tracking active

[ ] Fare calculated

[ ] Payment recorded

[ ] THB reward created


## After Ride

[ ] Passenger rating

[ ] Driver rating

[ ] Issues recorded

[ ] Trial saved to ELOS

`
);


// GO LIVE AUDIT

fs.writeFileSync(
"deployment/go_live_audit.js",
`
const services=require("./service_readiness_check");
const devices=require("../pilot/devices/device_registry");


function audit(){

let serviceStatus=
services.check();


let ready=
Object.values(serviceStatus)
.every(x=>x.configured);


return {

system:"CabLink",

services:serviceStatus,

devices:
devices.all(),

production_ready:ready,

status:
ready
?
"READY_FOR_PILOT"
:
"WAITING_CONFIGURATION",

time:new Date().toISOString()

};

}


console.log(audit());


module.exports={
audit
};

`
);


// TEST

fs.writeFileSync(
"pilot/reports/run_pilot_audit.js",
`
const devices=require("../devices/device_registry");
const audit=require("../../deployment/go_live_audit");


devices.register({

user:"DRIVER-001",

role:"DRIVER",

platform:"ANDROID"

});


devices.register({

user:"PASSENGER-001",

role:"PASSENGER",

platform:"ANDROID"

});


audit.audit();

`
);


console.log(`
=========================================

✅ PHASE 8 CREATED

Added:

✅ Service readiness checker
✅ Device registry
✅ First ride protocol
✅ Go-live audit
✅ Pilot command center

RUN:

node deployment/go_live_audit.js

=========================================
`);

