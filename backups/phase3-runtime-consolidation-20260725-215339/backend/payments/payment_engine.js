
function confirm(data){

return {

ride:data.ride,

fare:data.amount,

status:"PAYMENT_CONFIRMED",

time:new Date().toISOString()

};

}

module.exports={
confirm
};
