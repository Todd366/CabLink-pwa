

async function getTasks(){

const response=await fetch(
"/api/ecosystem/tasks"
);

return await response.json();

}



async function acceptTask(id,driver){

const response=await fetch(
"/api/ecosystem/tasks/"+id,
{

method:"PATCH",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

driver

})

}

);


return await response.json();

}


module.exports={
getTasks,
acceptTask
};

