const session=require("./beta/operations/session_engine");
const events=require("./beta/operations/event_logger");


console.log(`
=========================================
🚕 PILOT OPERATIONS TEST
=========================================
`);


let s=session.start();


events.log({

type:"RIDE_REQUEST",

session:s.id

});


events.log({

type:"DRIVER_ASSIGNED",

session:s.id

});


events.log({

type:"GPS_TRACKING",

session:s.id

});


events.log({

type:"RIDE_COMPLETED",

session:s.id

});


console.log("✅ Pilot events recorded");


require("./beta/operations/reports/daily_report");


console.log(`
=========================================
🚕 PILOT OPERATIONS READY
=========================================
`);

