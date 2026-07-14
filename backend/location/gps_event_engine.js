
const events=[];


function record(data){

let event={

id:"GPS-"+Date.now(),

driver:data.driver,

latitude:data.latitude,

longitude:data.longitude,

time:new Date().toISOString()

};

events.push(event);

return event;

}


function history(driver){

return events.filter(
x=>x.driver===driver
);

}


module.exports={
record,
history
};
