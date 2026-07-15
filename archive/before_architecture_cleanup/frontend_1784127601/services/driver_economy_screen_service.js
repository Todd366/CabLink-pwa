

const dashboard =
require("./economy_dashboard_api");


async function load(driver){

const economy =
await dashboard.getDriverDashboard(driver);


return economy;

}


module.exports={
load
};

