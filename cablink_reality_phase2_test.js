
const cloud=require("./backend/providers/cloud_database_connector");
const maps=require("./backend/providers/maps_connector");
const ride=require("./backend/rides/ride_lifecycle");
const gps=require("./backend/location/location_stream");


console.log({

cloud:
cloud.connect(),

maps:
maps.status(),

route:
maps.route(
"Gaborone CBD",
"Airport"
),

ride:
ride.create({
passenger:"P001",
pickup:"CBD",
destination:"Airport"
}),

location:
gps.publish(
"D001",
{
lat:-24.628,
lng:25.923
}
)

});

