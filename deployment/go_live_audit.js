
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

