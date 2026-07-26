
function enter(role){

return {

app:"CabLink",

role,

screens:
role==="driver"
?
[
"Driver Dashboard",
"Incoming Trips",
"Navigation",
"Earnings"
]
:
[
"Find Ride",
"Track Driver",
"Fare",
"Rewards"
],

status:"READY"

};

}


module.exports={
enter
};
