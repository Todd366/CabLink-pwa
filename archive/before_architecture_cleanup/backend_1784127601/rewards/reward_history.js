

let history=[];


function add(record){

history.push({

...record,

created:new Date().toISOString()

});

return record;

}


function getDriver(driver){

return history.filter(
item=>item.driver===driver
);

}


function all(){

return history;

}


module.exports={
add,
getDriver,
all
};

