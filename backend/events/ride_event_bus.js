
const events=[];


function publish(event){

let record={

id:"EVENT-"+Date.now(),

type:event.type,

ride:event.ride,

data:event.data,

time:new Date().toISOString()

};


events.push(record);


return record;

}


function history(){

return events;

}


module.exports={
publish,
history
};

