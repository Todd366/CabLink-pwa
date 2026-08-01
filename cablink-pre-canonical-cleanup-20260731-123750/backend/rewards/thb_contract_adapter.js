
function prepareTransfer(data){

return {

contractReady:true,

token:"THB",

wallet:data.wallet,

amount:data.amount,

method:"transfer"

};

}

module.exports={prepareTransfer};
