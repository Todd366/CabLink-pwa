
function sendOTP(phone){

return {

provider:
process.env.SMS_PROVIDER || "NOT_CONFIGURED",

phone,

status:"OTP_PENDING",

created:new Date().toISOString()

};

}


module.exports={
sendOTP
};
