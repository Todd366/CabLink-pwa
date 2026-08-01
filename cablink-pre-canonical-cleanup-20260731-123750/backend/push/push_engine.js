
function notify(user,message){

return {

user,

message,

status:"PUSH_READY",

time:new Date().toISOString()

};

}


module.exports={
notify
};

