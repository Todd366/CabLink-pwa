

function createTHBTransaction(data){

return {

token:"THB",

wallet:data.wallet,

amount:data.amount,

contractMethod:"transfer",

status:"WAITING_CONTRACT_ADDRESS"

};

}


module.exports={createTHBTransaction};

