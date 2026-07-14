const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 43
FRONTEND INTELLIGENCE INTEGRATION
DRIVER + PASSENGER DASHBOARDS
=========================================
`);

[
"frontend/services",
"frontend/components",
"frontend/screens"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DRIVER API CONNECTOR

fs.writeFileSync(
"frontend/services/driver_dashboard_api.js",
`
async function getDriverEconomy(id){

const r=await fetch(
"/api/driver/"+id+"/economy"
);

return r.json();

}


async function getHotspots(){

const r=await fetch(
"/api/driver/hotspots"
);

return r.json();

}


async function getUpdates(){

const r=await fetch(
"/api/updates"
);

return r.json();

}


module.exports={
getDriverEconomy,
getHotspots,
getUpdates
};
`
);


// DRIVER DASHBOARD COMPONENT

fs.writeFileSync(
"frontend/components/driver_dashboard.js",
`

function render(data){

return {

screen:"Driver Dashboard",

sections:[

{
title:"Wallet",
THB:data.thbEarned
},

{
title:"Rides",
count:data.rides
},

{
title:"Completed",
count:data.completed
},

{
title:"Revenue",
amount:data.totalFare
}

],

status:"LIVE"

};

}


module.exports={
render
};

`
);


// DEMAND COMPONENT

fs.writeFileSync(
"frontend/components/demand_panel.js",
`

function render(data){

return {

screen:"Demand Map",

hotspots:data.hotspots,

message:
"Find areas with active passengers"

};

}


module.exports={
render
};

`
);


// PASSENGER RIDE COMPONENT

fs.writeFileSync(
"frontend/components/passenger_trip_status.js",
`

function render(request){

return {

screen:"Trip Status",

rideId:request.id,

status:request.status,

driver:
request.driver || "Searching"

};

}


module.exports={
render
};

`
);


// UI TEST

fs.writeFileSync(
"frontend/testing/phase43_ui_test.js",
`

const dashboard=
require("../components/driver_dashboard");

const demand=
require("../components/demand_panel");


console.log(
dashboard.render(
{
rides:5,
completed:4,
totalFare:120,
thbEarned:5
}
)
);


console.log(
demand.render(
{
hotspots:[
{
location:"Gaborone CBD",
score:80
}
]
}
)
);

`
);


console.log(`
=========================================

✅ PHASE 43 CREATED

Added:

✅ Driver dashboard connector
✅ Economy display layer
✅ Demand display component
✅ Passenger trip status UI
✅ Updates connector
✅ Frontend testing

RUN:

node frontend/testing/phase43_ui_test.js

=========================================
`);

