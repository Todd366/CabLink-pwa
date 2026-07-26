
function calculate(data){

let fare=

data.base+
(data.distance*data.rate);


return {

distance:data.distance,

fare,

currency:"BWP",

status:"CALCULATED"

};

}


module.exports={
calculate
};
