
const gps=require("../gps/gps_service");
const maps=require("../maps/map_provider");
const status=require("../status/ride_status");


console.log({

map:
maps.provider(),


route:
maps.route(
"Gaborone CBD",
"Airport"
),


driverLocation:
gps.update(
"DRIVER_PHONE",
{
latitude:-24.628,
longitude:25.923,
accuracy:5
}
),


rideFlow:
status.change(
"DRIVER_ACCEPTED",
"DRIVER_ARRIVING"
)

});

