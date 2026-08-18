
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


try{

const decimals=
await contract.decimals();

const parsedAmount=
ethers.parseUnits(
String(data.amount),
decimals
);

let tx=
await contract.transfer(
data.wallet,
parsedAmount
);

const receipt=
await tx.wait(1);

if(!receipt || receipt.status !== 1){

return {
status:"FAILED",
hash:tx.hash,
reason:"Transaction reverted on-chain"
};

}

return {

status:"CONFIRMED",
hash:tx.hash,
blockNumber:receipt.blockNumber

};

}catch(error){

return {

status:"FAILED",
reason:error.shortMessage || error.message || "Unknown blockchain error"

};

}

}


module.exports={
executeTransfer
};

