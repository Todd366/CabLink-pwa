
function status(){

return {

pwa:true,

installable:true,

offlineSupport:true,

mobileReady:true,

checked:new Date().toISOString()

};

}


module.exports={
status
};
