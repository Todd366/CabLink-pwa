
const cloud=require("../cloud/cloud_adapter");


function broadcast(event){

return cloud.sync(
"ride_events",
event
);

}


module.exports={
broadcast
};

