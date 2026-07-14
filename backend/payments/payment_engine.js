const fs=require("fs");
const path=require("path");

const DB=path.join(
__dirname,
"../../database/production/database.json"
);


function load(){

if(!fs.existsSync(DB)){

fs.writeFileSync(
DB,
JSON.stringify({
transactions:[]
},null,2)
);

}

return JSON.parse(
fs.readFileSync(DB,"utf8")
);

}


function save(db){

fs.writeFileSync(
DB,
JSON.stringify(db,null,2)
);

}



function createPayment(data){

let db=load();


let existing=db.transactions.find(
x=>x.ride===data.ride
);


if(existing){
return existing;
}


let payment={

id:"PAY-"+Date.now(),

ride:data.ride,

amount:data.amount,

status:"RECORDED",

timestamp:new Date().toISOString()

};


db.transactions.push(payment);

save(db);


return payment;

}



module.exports={
createPayment
};

