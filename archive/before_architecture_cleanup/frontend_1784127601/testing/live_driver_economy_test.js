

const service=require("../services/live_driver_economy");


(async()=>{

console.log(

await service.loadDriverEconomy(
"DRIVER001"
)

);

})();

