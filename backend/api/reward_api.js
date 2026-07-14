
const claim=require("../rewards/thb_claim_engine");
const executor=require("../blockchain/thb_real_executor");


async function claimReward(wallet){

let claimResult=
claim.requestClaim({
wallet
});


if(
claimResult.status==="NO_REWARDS"
){

return claimResult;

}


let transfer=
await executor.executeTransfer({

wallet,
amount:claimResult.amount

});


return {

claim:claimResult,

transfer

};

}


module.exports={
claimReward
};

