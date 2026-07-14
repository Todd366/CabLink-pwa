

const service=
require("../services/driver_economy_screen_service");

const screen=
require("../components/driver_economy_screen");


(async()=>{


const data=
await service.load(
"DRIVER001"
);


console.log(

screen.render(data)

);


})();

