
function check(){

return {

frontend:true,

api_bridge:true,

state_management:true,

screens:true,

notifications:"WAITING_REAL_PROVIDER",

gps:"WAITING_REAL_PROVIDER",

timestamp:new Date().toISOString()

};

}

module.exports={
check
};

