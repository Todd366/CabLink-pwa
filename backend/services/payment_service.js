

module.exports={

create:function(ride,finance){

return {

id:"TX-"+Date.now(),

rideId:ride.id,

customerPayment:finance.customerPayment,

driverPayout:finance.driverPayout,

platformRevenue:finance.platformRevenue,

status:"COMPLETED",

createdAt:new Date().toISOString()

};

}

};

