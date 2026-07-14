

const ride=require("../services/ride_service");
const user=require("../services/user_service");


async function test(){

console.log({

user:
await user.register({

name:"Pilot Passenger",

phone:"+26770000000",

role:"passenger"

}),


ride:
await ride.requestRide({

passenger:"Pilot Passenger",

pickup:"Gaborone CBD",

destination:"Airport"

})

});

}


test();

