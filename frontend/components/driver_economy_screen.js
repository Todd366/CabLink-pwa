

function render(data){

return {

screen:"Driver Economy",

driver:data.driver,

wallet:{

balance:
data.wallet?.balance || 0,

currency:
data.wallet?.currency || "THB"

},

rewards:
data.rewards || [],


tasks:
data.tasks || [],


connection:"LIVE",

status:"READY"

};

}


module.exports={
render
};

