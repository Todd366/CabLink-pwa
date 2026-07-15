
const records=[];


function create(data){

let tx={

id:"TX-"+Date.now(),

ride:data.ride,

amount:data.amount,

status:data.status || "PENDING",

time:new Date().toISOString()

};

records.push(tx);

return tx;

}


function all(){
return records;
}


module.exports={
create,
all
};
