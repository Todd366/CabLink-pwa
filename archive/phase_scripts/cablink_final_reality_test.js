
require("dotenv").config();

const ride=require("./backend/rides/ride_engine");
const gps=require("./backend/maps/gps_engine");
const sms=require("./backend/sms/sms_engine");
const security=require("./backend/security/security_engine");
const cloud=require("./backend/cloud/production_adapter");


let r=
ride.createRide({

passenger:"PILOT-PASSENGER",
pickup:"Gaborone CBD",
destination:"Airport"

});


ride.updateRide(
r.id,
"COMPLETED"
);


console.log({

ride:r,

gps:
gps.route(
"Gaborone",
"Airport"
),

sms:
sms.sendOTP("+26770000000"),

security:
security.audit(),

cloud:
cloud.connect()

});

