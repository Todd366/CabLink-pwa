
require("dotenv").config();


module.exports={

rpc:
process.env.RPC_URL,

contract:
process.env.CONTRACT_ADDRESS,

wallet:
process.env.TREASURY_WALLET

};

