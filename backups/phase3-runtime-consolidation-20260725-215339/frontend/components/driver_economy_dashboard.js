

function render(data){

return {

screen:"Driver Economy Dashboard",

driver:data.driver,

deliveryTasks:data.tasks || [],

earnings:{

amount:data.earnings || 0,

currency:"BWP"

},

wallet:{

balance:data.wallet || 0,

currency:"THB"

},

rewards:data.rewards || [],

status:"ACTIVE"

};

}


module.exports={
render
};

