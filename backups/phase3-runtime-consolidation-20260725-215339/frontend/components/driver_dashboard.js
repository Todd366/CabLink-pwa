

function render(data){

return {

screen:"Driver Dashboard",

sections:[

{
title:"Wallet",
THB:data.thbEarned
},

{
title:"Rides",
count:data.rides
},

{
title:"Completed",
count:data.completed
},

{
title:"Revenue",
amount:data.totalFare
}

],

status:"LIVE"

};

}


module.exports={
render
};

