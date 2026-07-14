

const transactions=[];


function createPayment(data){

let payment={

id:"PAY-"+Date.now(),

ride:data.ride,

amount:data.amount,

status:"COMPLETED"

};


transactions.push(payment);

return payment;

}


function all(){

return transactions;

}


module.exports={createPayment,all};

