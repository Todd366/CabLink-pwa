
function createCheckout(data){

return {

reference:"CAB-"+Date.now(),

amount:data.amount,

currency:"BWP",

status:"PENDING_PROVIDER"

};

}


function verifyWebhook(data){

return {

verified:true,

reference:data.reference,

status:data.status

};

}


module.exports={
createCheckout,
verifyWebhook
};
