
const channels={};


function subscribe(user){

channels[user]={
connected:true,
time:new Date().toISOString()
};

return channels[user];

}


function broadcast(event){

return {

event,

receivers:Object.keys(channels),

time:new Date().toISOString()

};

}


module.exports={
subscribe,
broadcast
};
