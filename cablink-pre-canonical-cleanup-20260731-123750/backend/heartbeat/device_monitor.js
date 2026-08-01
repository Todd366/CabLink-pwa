
function check(device){

return {

device,

status:"ONLINE",

checked:new Date().toISOString()

};

}


module.exports={
check
};

