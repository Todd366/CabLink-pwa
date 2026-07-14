

const tasks={};


function create(data){

const task={

id:"TASK-"+Date.now(),

source:"BSTM_MARKETPLACE",

type:data.type || "DELIVERY",

customer:data.customer,

pickup:data.pickup,

dropoff:data.dropoff,

status:"AVAILABLE",

created:new Date().toISOString()

};


tasks[task.id]=task;

return task;

}



function assign(id,driver){

if(tasks[id]){

tasks[id].driver=driver;

tasks[id].status="ASSIGNED";

}

return tasks[id];

}



function all(){

return Object.values(tasks);

}



module.exports={
create,
assign,
all
};

