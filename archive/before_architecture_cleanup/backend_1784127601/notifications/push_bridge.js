
function registerDevice(user,token){

return {

user,

token,

status:"DEVICE_REGISTERED"

};

}


function send(user,message){

return {

user,

message,

provider:
process.env.PUSH_PROVIDER || "NOT_CONFIGURED",

status:"QUEUED"

};

}


module.exports={
registerDevice,
send
};

