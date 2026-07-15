

let tasks=[];


function set(data){

tasks=data;

return tasks;

}


function get(){

return tasks;

}


module.exports={
set,
get
};

