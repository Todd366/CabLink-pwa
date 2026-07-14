
const analytics=require("./backend/analytics/pilot_analytics");
const fraud=require("./backend/security/fraud_engine");
const device=require("./backend/security/device_registry");


console.log({

device:
device.register({

user:"DRIVER-001",
device:"PHONE-001",
platform:"ANDROID"

}),


analytics:
analytics.calculate({

rides:10,
drivers:2,
passengers:8,
revenue:350,
rewards:10

}),


fraud:
fraud.checkRide({

id:"RIDE-001",
driver:"DRIVER-001",
distance:5

})

});

