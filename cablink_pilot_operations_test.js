
const heartbeat=require("./backend/drivers/heartbeat_engine");
const gps=require("./backend/location/gps_event_engine");
const state=require("./backend/rides/ride_state_engine");
const safety=require("./backend/safety/safety_engine");
const admin=require("./backend/admin/admin_monitor");


let driver=heartbeat.heartbeat({

id:"DRIVER-001",

name:"Pilot Driver"

});


let location=gps.record({

driver:driver.id,

latitude:-24.6282,

longitude:25.9231

});


let ride=state.update({

id:"RIDE-001"

},"TRIP_STARTED");


let incident=safety.create({

ride:"RIDE-001",

type:"NONE",

description:"Normal pilot ride"

});


let dashboard=admin.dashboard({

drivers:1,

rides:1,

rewards:1

});


console.log({

driver,

location,

ride,

incident,

dashboard

});

