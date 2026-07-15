

const fs=require("fs");


console.log({

driver:
fs.existsSync(
"frontend/pages/DriverDashboard.jsx"
),

passenger:
fs.existsSync(
"frontend/pages/PassengerRide.jsx"
),

updates:
fs.existsSync(
"frontend/pages/UpdatesCenter.jsx"
)

});

