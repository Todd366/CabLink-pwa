
const codes={};


function sendCode(phone){

let code=
Math.floor(
100000+
Math.random()*900000
);


codes[phone]=code;


return {

phone,

status:"CODE_SENT",

expires:"5_MINUTES"

};

}


function verify(phone,code){

return {

phone,

verified:
codes[phone]==code,

time:new Date().toISOString()

};

}


module.exports={
sendCode,
verify
};

