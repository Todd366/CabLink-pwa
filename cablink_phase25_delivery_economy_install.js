const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 25
DELIVERY ECONOMY ENGINE
BSTM + DRIVER EARNINGS
=========================================
`);

[
"backend/economy",
"frontend/components",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DELIVERY FARE ENGINE

fs.writeFileSync(
"backend/economy/delivery_fare_engine.js",
`

const config={

baseFee:20,

perKm:5,

driverShare:0.8,

bstmShare:0.2

};


function calculate(distance){

const total=
config.baseFee +
(distance * config.perKm);


return {

total,

driver:

total * config.driverShare,

bstm:

total * config.bstmShare,

currency:"BWP"

};

}


module.exports={
calculate
};

`
);


// DRIVER DELIVERY EARNINGS COMPONENT

fs.writeFileSync(
"frontend/components/delivery_earnings_panel.js",
`

function render(earning){

return {

title:"Delivery Earnings",

source:"BSTM Marketplace",

amount:earning.driver,

currency:earning.currency,

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
"backend/testing/delivery_economy_test.js",
`

const fare=require("../economy/delivery_fare_engine");

console.log(

fare.calculate(6)

);

`
);


console.log(`
=========================================

✅ PHASE 25 CREATED

Added:

✅ Delivery pricing engine
✅ Driver earnings calculation
✅ BSTM revenue share
✅ Economy foundation

RUN:

node backend/testing/delivery_economy_test.js

NEXT:

Phase 26:
Connect THoBoCoin rewards + delivery completion

=========================================
`);

