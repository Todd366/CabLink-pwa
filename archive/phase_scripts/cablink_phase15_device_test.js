
const devices=require("./backend/mobile/device_registry");
const trips=require("./backend/trips/trip_manager");
const matcher=require("./backend/matching/driver_matcher");


console.log({

driverDevice:
devices.register({

device:"ANDROID_DRIVER_01",

user:"DRIVER001",

role:"DRIVER",

platform:"ANDROID"

}),


passengerDevice:
devices.register({

device:"ANDROID_PASSENGER_01",

user:"PASSENGER001",

role:"PASSENGER",

platform:"ANDROID"

}),


match:
matcher.find(
[
{
id:"DRIVER001",
online:true,
latitude:-24.628,
longitude:25.923
}
],
{
latitude:-24.630,
longitude:25.925
}
),


trip:
trips.start({

ride:"RIDE001",

driver:"DRIVER001",

passenger:"PASSENGER001"

})

});

