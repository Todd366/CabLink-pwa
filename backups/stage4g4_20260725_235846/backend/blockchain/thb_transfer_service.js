
const health=require("./chain_health");


async function transfer(data){

let status=health.check();


if(
!status.contractConfigured
){

return {

status:"BLOCKED",

reason:
"THB contract not configured"

};

}


// Real ethers Contract.transfer()
// will be activated after
// contract address + private key
// are supplied


return {

status:"READY",

recipient:data.wallet,

amount:data.amount,

message:
"Waiting for live contract connection"

};

}


module.exports={
transfer
};

