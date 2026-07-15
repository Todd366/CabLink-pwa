
const db=require("./backend/production/database_adapter");
const realtime=require("./backend/realtime/realtime_bridge");
const push=require("./backend/notifications/push_bridge");
const gps=require("./backend/location/location_service");
const dispatch=require("./backend/dispatch/dispatch_engine");


realtime.register(
"rides",
data=>console.log(
"RIDE EVENT:",
data
)
);


console.log({

database:
db.provider(),

device:
push.registerDevice(
"DRIVER-001",
"DEVICE_TOKEN"
),

location:
gps.update(
"DRIVER-001",
{
latitude:-24.628,
longitude:25.923
}
),

dispatch:
dispatch.select(
[
{
id:"D1",
online:true,
distance:2,
rating:4.8
},
{
id:"D2",
online:true,
distance:10,
rating:5
}
],
{
pickup:"CBD"
}
)

});


console.log(
realtime.emit(
"rides",
{
type:"RIDE_REQUESTED"
}
)
);

