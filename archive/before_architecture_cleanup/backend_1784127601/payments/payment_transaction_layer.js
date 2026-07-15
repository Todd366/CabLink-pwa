

const store=require("../../database/production/store_engine");


function createTransaction(data){

let tx={

id:"TX-"+Date.now(),

provider:data.provider || "PENDING_PROVIDER",

amount:data.amount,

status:data.status || "PENDING"

};


return store.save(
"transactions",
tx
);

}


module.exports={createTransaction};

