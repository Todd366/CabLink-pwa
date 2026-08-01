

module.exports={

send:function(user,message){

return {

user:user,

message:message,

sent:true,

time:new Date().toISOString()

};

}

};

