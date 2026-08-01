
function sendRideRequest(driver,ride){

return {

driver:driver.id,

ride,

notification:
"NEW_RIDE_REQUEST",

time:new Date().toISOString()

};

}


module.exports={
sendRideRequest
};
