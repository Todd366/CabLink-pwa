

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

