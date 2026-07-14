const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK THB REAL EXECUTOR INSTALL
=========================================
`);

fs.writeFileSync(
"backend/blockchain/thb_real_executor.js",
`
require("dotenv").config();

const {ethers}=require("ethers");
const abi=require("./thb_abi.json");


async function executeTransfer(data){

if(
!process.env.PRIVATE_KEY ||
process.env.PRIVATE_KEY.includes("your_")
){

return {

status:"SIMULATION",

reason:"Treasury wallet not configured",

recipient:data.wallet,

amount:data.amount

};

}


const provider=
new ethers.JsonRpcProvider(
process.env.RPC_URL
);


const wallet=
new ethers.Wallet(
process.env.PRIVATE_KEY,
provider
);


const contract=
new ethers.Contract(
process.env.CONTRACT_ADDRESS,
abi,
wallet
);


let tx=
await contract.transfer(
data.wallet,
data.amount
);


return {

status:"SUBMITTED",

hash:tx.hash

};

}


module.exports={
executeTransfer
};

`
);


fs.writeFileSync(
"cablink_thb_executor_test.js",
`
const executor=require("./backend/blockchain/thb_real_executor");


executor.executeTransfer({

wallet:"0x0000000000000000000000000000000000000001",

amount:1

})
.then(console.log);

`
);


console.log(`
=========================================

✅ THB EXECUTOR CREATED

Added:

✅ ethers connection layer
✅ ERC20 transfer path
✅ simulation fallback
✅ transaction response handling

=========================================
`);

