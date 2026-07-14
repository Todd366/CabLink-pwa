
const store=require("../../database/production/store_engine");


function createTransaction(data){

let tx={

id:"TX-"+Date.now(),

claim:data.claim,

wallet:data.wallet,

amount:data.amount,

status:"SIMULATION_CREATED",

created:new Date().toISOString()

};


store.save(
"blockchain_transactions",
tx
);


return tx;

}


function submit(tx){

tx.status="WAITING_BLOCKCHAIN";

tx.updated=new Date().toISOString();


store.save(
"blockchain_transactions",
tx
);


return tx;

}


function confirm(tx,hash){

tx.status="CONFIRMED";

tx.hash=hash;

tx.confirmed=new Date().toISOString();


store.save(
"blockchain_transactions",
tx
);


return tx;

}


module.exports={
createTransaction,
submit,
confirm
};

