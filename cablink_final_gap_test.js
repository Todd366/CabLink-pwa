
const notify=require("./backend/notifications/notification_center");
const match=require("./backend/matching/driver_matching_engine");
const gps=require("./backend/tracking/location_session");
const realtime=require("./backend/realtime/channel_manager");
const ext=require("./backend/extensions/extension_registry");
const audit=require("./backend/audit/production_audit");


console.log({

notification:
notify.send({
type:"RIDE_UPDATE",
user:"PASSENGER",
message:"Driver arriving"
}),

driver:
match.findDriver([
{
id:"DRIVER1",
online:true
}
]),

location:
gps.update(
"DRIVER1",
{
lat:-24.6,
lng:25.9
}
),

channel:
realtime.subscribe("PASSENGER"),

extension:
(ext.register("Future AI Dispatcher"),ext.list()),

audit:
audit.check()

});

