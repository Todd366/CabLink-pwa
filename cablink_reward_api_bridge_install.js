const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK REWARD API BRIDGE
=========================================
`);

fs.mkdirSync(
"backend/api",
{recursive:true}
);


fs.writeFileSync(
"backend/api/reward_api.js",
`
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

`
);


fs.writeFileSync(
"cablink_reward_api_test.js",
`
const api=require("./backend/api/reward_api");


api.claimReward(
"PILOT-TEST-WALLET"
)
.then(console.log);

`
);


console.log(`
=========================================

✅ REWARD API BRIDGE CREATED

Added:

✅ Frontend-ready claim endpoint
✅ Claim → Transfer connection
✅ Unified reward response

=========================================
`);

