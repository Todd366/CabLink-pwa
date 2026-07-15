
const status=require("./frontend/components/status_panel");
const passenger=require("./frontend/screens/passenger_dashboard");
const driver=require("./frontend/screens/driver_dashboard");
const health=require("./frontend/monitoring/ui_health");


async function run(){

console.log({

status:
status.status({

user:"Pilot Passenger",

role:"passenger",

connection:"CONNECTED"

}),

passenger:
await passenger.dashboard(),

driver:
driver.dashboard(),

health:
health.check()

});

}

run();

