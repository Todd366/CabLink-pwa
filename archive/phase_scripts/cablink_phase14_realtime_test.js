
const channel=require("./backend/realtime/ride_channel");


console.log({

passenger:
channel.passengerJoin(
"RIDE001",
"PASSENGER001"
),


driver:
channel.driverJoin(
"RIDE001",
"DRIVER001"
),


update:
channel.sendUpdate(
"RIDE001",
{
type:"DRIVER_LOCATION",
lat:-24.628,
lng:25.923
}
)

});

