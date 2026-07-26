

function render(wallet){

return {

title:"THoBoCoin Wallet",

driver:wallet.driver,

balance:wallet.balance,

currency:wallet.currency,

transactions:
wallet.transactions,

status:"READY"

};

}


module.exports={
render
};

