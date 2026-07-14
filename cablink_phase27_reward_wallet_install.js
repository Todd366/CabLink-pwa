const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 27
THOBOCOIN REWARD WALLET LAYER
DRIVER HISTORY
=========================================
`);

[
"backend/rewards",
"backend/testing",
"frontend/components"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// REWARD STORAGE

fs.writeFileSync(
"backend/rewards/reward_history.js",
`

let history=[];


function add(record){

history.push({

...record,

created:new Date().toISOString()

});

return record;

}


function getDriver(driver){

return history.filter(
item=>item.driver===driver
);

}


function all(){

return history;

}


module.exports={
add,
getDriver,
all
};

`
);


// WALLET SERVICE

fs.writeFileSync(
"backend/rewards/wallet_service.js",
`

const history=require("./reward_history");


function wallet(driver){

const records=
history.getDriver(driver);


const balance=
records.reduce(
(total,item)=>total+item.reward,
0
);


return {

driver,

currency:"THB",

balance,

transactions:records

};

}


module.exports={
wallet
};

`
);


// FRONTEND WALLET COMPONENT

fs.writeFileSync(
"frontend/components/thb_wallet_panel.js",
`

function render(wallet){

return {

title:"THoBoCoin Wallet",

driver:wallet.driver,

balance:wallet.balance,

currency:wallet.currency,

transactions:
wallet.transactions,

status:"READY"

};

}


module.exports={
render
};

`
);


// TEST

fs.writeFileSync(
"backend/testing/reward_wallet_test.js",
`

const history=require("../rewards/reward_history");
const wallet=require("../rewards/wallet_service");


history.add({

task:"TASK100",

driver:"DRIVER001",

reward:7,

currency:"THB"

});


history.add({

task:"TASK101",

driver:"DRIVER001",

reward:5,

currency:"THB"

});


console.log(

wallet.wallet("DRIVER001")

);

`
);


console.log(`
=========================================

✅ PHASE 27 CREATED

Added:

✅ Reward history storage
✅ Driver THB wallet
✅ Transaction records
✅ Wallet UI component

RUN:

node backend/testing/reward_wallet_test.js

NEXT:

Phase 28:
Connect completed deliveries automatically into rewards

=========================================
`);

