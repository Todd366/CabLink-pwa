

function render(tasks){

return {

title:"BSTM Delivery Tasks",

source:"BSTM Marketplace",

tasks:tasks || [],

actions:[

"Accept Delivery",

"Navigate",

"Complete"

],

status:"READY"

};

}


module.exports={
render
};

