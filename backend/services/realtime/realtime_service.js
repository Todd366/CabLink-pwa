

module.exports={

broadcast:function(event,data){

return {

event:event,

data:data,

time:new Date().toISOString()

};

}

};

