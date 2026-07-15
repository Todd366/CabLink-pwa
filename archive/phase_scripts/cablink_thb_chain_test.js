
const health=require("./backend/blockchain/chain_health");
const wallet=require("./backend/blockchain/wallet_validator");
const transfer=require("./backend/blockchain/thb_transfer_service");


console.log(
"CHAIN:",
health.check()
);


console.log(
"WALLET:",
wallet.valid("0x123")
);


transfer.transfer({

wallet:"0xPILOT",

amount:1

})
.then(console.log);

