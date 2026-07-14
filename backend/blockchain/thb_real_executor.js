
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

