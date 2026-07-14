
const store=require("../../database/production/store_engine");

function recordPayment(data){

return store.save(
"transactions",
{
id:"TX-"+Date.now(),
provider:data.provider,
amount:data.amount,
status:data.status
}
);

}

module.exports={recordPayment};
