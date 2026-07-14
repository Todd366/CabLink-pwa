
const ride=require("../services/ride_service");

async function dashboard(){

return {

screen:"Passenger Dashboard",

features:[

"Request Ride",

"Track Driver",

"View Fare",

"Receive Rewards"

],

rides:
await ride.rides()

};

}

module.exports={
dashboard
};

