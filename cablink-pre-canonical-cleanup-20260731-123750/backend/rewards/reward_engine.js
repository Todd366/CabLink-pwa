require("dotenv").config();

const {ethers}=require("ethers");


const ABI=[
"function transfer(address,uint256) returns(bool)",
"function decimals() view returns(uint8)"
];


async function issue(walletAddress,amount){

if(!process.env.PRIVATE_KEY ||
process.env.PRIVATE_KEY.includes("your_treasury")){

throw new Error(
"Treasury wallet not configured"
);

}


if(!ethers.isAddress(walletAddress)){

throw new Error(
"Invalid wallet address"
);

}


const provider=
new ethers.JsonRpcProvider(
process.env.RPC_URL
);


const signer=
new ethers.Wallet(
process.env.PRIVATE_KEY,
provider
);


const token=
new ethers.Contract(
process.env.CONTRACT_ADDRESS,
ABI,
signer
);


const decimals=
await token.decimals();


const value=
ethers.parseUnits(
String(amount),
decimals
);


const tx=
await token.transfer(
walletAddress,
value
);


await tx.wait();


return {

token:"THB",

wallet:walletAddress,

amount,

hash:tx.hash,

status:"CONFIRMED"

};


}


module.exports={
issue
};

