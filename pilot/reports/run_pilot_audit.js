
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

