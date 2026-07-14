

const wallet=require("../rewards/wallet_service");
const history=require("../rewards/reward_history");


let rides=[];


function accept(driver,ride){

const record={
id:"RIDE-"+Date.now(),
driver,
status:"ACCEPTED",
fare:ride.fare || 20,
created:new Date().toISOString()
};

rides.push(record);

return record;

}


function complete(id){

const ride=
rides.find(r=>r.id===id);

if(!ride) return null;


ride.status="COMPLETED";


const reward={
driver:ride.driver,
amount:1,
currency:"THB",
ride:id,
time:new Date().toISOString()
};


// wallet update
if(wallet.add){
wallet.add(
ride.driver,
1
);
}


// history update
if(history.add){
history.add(reward);
}


return {
ride,
reward
};

}


function list(){
return rides;
}


module.exports={
accept,
complete,
list
};

