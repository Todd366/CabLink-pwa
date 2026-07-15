
const executor=require("./backend/blockchain/thb_real_executor");


executor.executeTransfer({

wallet:"0x0000000000000000000000000000000000000001",

amount:1

})
.then(console.log);

