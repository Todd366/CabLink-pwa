
const store=require("../../database/production/store_engine");


function createPayment(data){

let payment={

id:"PAY-"+Date.now(),

ride:data.ride,

amount:data.amount,

status:"RECORDED",

timestamp:new Date().toISOString()

};


store.save(
"payments",
payment
);


return payment;

}


module.exports={
createPayment
};
