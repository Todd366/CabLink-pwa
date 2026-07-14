

const service=require("../services/driver_dashboard_live");
const dashboard=require("../components/live_driver_dashboard");


(async()=>{


const data=
await service.loadDashboard(
"DRIVER001"
);


console.log(

dashboard.render(data)

);


})();

