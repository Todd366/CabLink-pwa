

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

