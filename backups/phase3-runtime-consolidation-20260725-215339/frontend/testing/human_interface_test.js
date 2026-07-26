
const state=require("../state/ride_ui_state");
const passenger=require("../screens/passenger_ride_screen");
const driver=require("../screens/driver_control_screen");
const map=require("../maps/live_map_component");
const dash=require("../components/mobile_dashboard");


state.update({

status:"DRIVER_ARRIVING",

driver:"DRIVER001"

});


console.log({

dashboard:
dash.dashboard("PASSENGER001"),

passenger:
passenger.render(),

driver:
driver.render(),

map:
map.render({

driver:{
lat:-24.628,
lng:25.923
},

passenger:{
lat:-24.630,
lng:25.925
}

})

});

