
const store=require("../../database/production/store_engine");


function requestClaim(data){

let rewards=
store.get("rewards");


let eligible=
rewards.filter(
r =>
r.wallet===data.wallet &&
r.status!=="CLAIMED"
);


if(!eligible.length){

return {

status:"NO_REWARDS",

wallet:data.wallet

};

}


let claim={

id:"CLAIM-"+Date.now(),

wallet:data.wallet,

amount:
eligible.reduce(
(a,b)=>a+b.amount,
0
),

status:"READY_FOR_TRANSFER",

created:new Date().toISOString()

};


store.save(
"claims",
claim
);


return claim;

}


function completeClaim(id,tx){

store.save(
"blockchain_transactions",
{
claim:id,
transaction:tx,
status:"CONFIRMED",
time:new Date().toISOString()
}
);

return {

status:"CLAIM_COMPLETED",

transaction:tx

};

}


module.exports={
requestClaim,
completeClaim
};

