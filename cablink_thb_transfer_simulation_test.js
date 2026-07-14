
const tx=require("./backend/blockchain/thb_transaction_engine");


let transaction=tx.createTransaction({

claim:"CLAIM-001",

wallet:"PILOT-TEST-WALLET",

amount:1

});


console.log(
tx.submit(transaction)
);


console.log(
tx.confirm(
transaction,
"0xSIMULATED_TRANSACTION_HASH"
)
);

