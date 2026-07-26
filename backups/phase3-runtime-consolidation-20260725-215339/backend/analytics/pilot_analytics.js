
function calculate(data){

return {

rides:data.rides || 0,

drivers:data.drivers || 0,

passengers:data.passengers || 0,

revenue:data.revenue || 0,

rewards:data.rewards || 0,

timestamp:new Date().toISOString()

};

}


module.exports={
calculate
};
