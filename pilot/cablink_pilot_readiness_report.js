
const health=require("../backend/monitoring/system_health");
const validator=require("../backend/validation/input_validator");
const logger=require("../backend/logs/system_logger");


let rideValidation=
validator.required(
{
passenger:"P001",
pickup:"CBD",
destination:"Airport"
},
[
"passenger",
"pickup",
"destination"
]
);


let log=
logger.write(
"BOOT",
{
module:"Pilot System"
}
);


console.log({

system:"CabLink Pilot Readiness",

validation:rideValidation,

health:health.check(),

log,

status:"READY FOR CONTROLLED FIELD TEST"

});

