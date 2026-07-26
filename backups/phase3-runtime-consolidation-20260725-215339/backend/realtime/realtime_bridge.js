
const listeners={};


function register(channel,callback){

listeners[channel]=callback;

return {

channel,

status:"LISTENING"

};

}


function emit(channel,data){

if(listeners[channel]){

listeners[channel](data);

}


return {

channel,

delivered:true,

time:new Date().toISOString()

};

}


module.exports={
register,
emit
};

