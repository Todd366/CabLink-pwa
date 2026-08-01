

const store=require("../../database/production/store_engine");


function saveRide(ride){

return store.save(
"rides",
ride
);

}


module.exports={saveRide};

