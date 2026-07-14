
const settlement=require("./backend/rides/settlement_engine");
const wallet=require("./backend/users/wallet_manager");

console.log(
wallet.attachWallet(
"DRIVER-001",
"0xTESTWALLET"
)
);


console.log(
settlement.settle({

ride:"TEST-RIDE-001",

amount:35,

wallet:"0xTESTWALLET",

reward:1

})
);
