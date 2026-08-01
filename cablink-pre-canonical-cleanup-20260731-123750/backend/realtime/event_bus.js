
const events=[];


function publish(type,data){

let event={

type,

data,

time:new Date().toISOString()

};


events.push(event);

return event;

}


function history(){

return events;

}


module.exports={
publish,
history
};

