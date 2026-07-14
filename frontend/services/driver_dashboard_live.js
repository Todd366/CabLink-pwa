

const taskApi=require("../api/task_api");


async function loadDashboard(driver){


const tasks =
await taskApi.getTasks();


return {

driver,

tasks:
tasks.filter(
task =>
!task.driver ||
task.driver===driver
),

source:"LIVE_API",

lastUpdated:
new Date().toISOString()

};


}


module.exports={
loadDashboard
};

