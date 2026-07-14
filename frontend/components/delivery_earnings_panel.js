

function render(earning){

return {

title:"Delivery Earnings",

source:"BSTM Marketplace",

amount:earning.driver,

currency:earning.currency,

status:"READY"

};

}


module.exports={
render
};

