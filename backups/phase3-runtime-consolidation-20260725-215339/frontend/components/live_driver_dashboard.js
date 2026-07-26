

function render(data){

return {

screen:"Live Driver Dashboard",

driver:data.driver,

tasks:data.tasks,

connection:data.source,

updated:data.lastUpdated,

status:"ONLINE"

};

}


module.exports={
render
};

