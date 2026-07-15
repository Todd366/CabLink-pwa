

const taskApi=require("../api/task_api");


async function loadDriverEconomy(driver){

const tasks =
await taskApi.getTasks();


return {

driver,

tasks:

tasks.filter(
task=>
!task.driver ||
task.driver===driver
),

source:"LIVE_BACKEND"

};

}


module.exports={
loadDriverEconomy
};

