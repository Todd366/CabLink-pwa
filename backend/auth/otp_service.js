
function send(phone){

return {

phone,

provider:
process.env.SMS_PROVIDER || "NOT_CONFIGURED",

status:"OTP_READY",

time:new Date().toISOString()

};

}


function verify(phone,code){

return {

phone,

verified:
Boolean(code),

time:new Date().toISOString()

};

}


module.exports={
send,
verify
};
