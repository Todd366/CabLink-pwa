
function dashboard(data){

return {

system:"CabLink Pilot Control",

activeDrivers:data.drivers || 0,

activeRides:data.rides || 0,

pendingRewards:data.rewards || 0,

timestamp:new Date().toISOString()

};

}


module.exports={
dashboard
};
