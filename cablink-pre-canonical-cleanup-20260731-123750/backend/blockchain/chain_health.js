
const config=require("./thb_config");


function check(){

return {

rpcConfigured:
!!config.rpc,

contractConfigured:
!!config.contract &&
!config.contract.includes("your_"),

walletConfigured:
!!config.wallet,

time:new Date().toISOString()

};

}


module.exports={
check
};

