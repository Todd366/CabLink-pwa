
const gps=require("./gps_service");


function stream(device,location){

return gps.update(
device,
location
);

}


module.exports={
stream
};

