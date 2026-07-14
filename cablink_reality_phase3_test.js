
const firebase=require("./backend/firebase/firebase_adapter");
const device=require("./backend/devices/device_registry");
const broadcast=require("./backend/broadcast/ride_broadcast");
const ready=require("./backend/environment/readiness_check");


console.log({

firebase:
firebase.status(),

driverDevice:
device.register({

user:"DRIVER-001",

device:"ANDROID",

token:"TEST_TOKEN",

platform:"ANDROID"

}),


rideBroadcast:
broadcast.broadcast({

ride:"RIDE-001",

status:"DRIVER_FOUND"

}),


system:
ready.check()

});

