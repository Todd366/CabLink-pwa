
const drivers={};


function heartbeat(driver){

drivers[driver.id]={

...driver,

lastSeen:new Date().toISOString(),

online:true

};

return drivers[driver.id];

}


function status(id){

let driver=drivers[id];

if(!driver)
return null;


let age=
Date.now()-
new Date(driver.lastSeen).getTime();


if(age>60000)
driver.online=false;


return driver;

}


module.exports={
heartbeat,
status
};
