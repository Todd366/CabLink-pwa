

function createPayment(data){

return {

id:"PAY-"+Date.now(),

provider:"ADAPTER_READY",

amount:data.amount,

status:"PENDING_GATEWAY"

};

}


module.exports={createPayment};

