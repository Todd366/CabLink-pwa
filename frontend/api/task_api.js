

const BASE_URL =
typeof window === "undefined"
?
"http://localhost:3000"
:
"";


async function getTasks(){

const response=await fetch(
BASE_URL + "/api/ecosystem/tasks"
);

return await response.json();

}



async function acceptTask(id,driver){

const response=await fetch(
BASE_URL + "/api/ecosystem/tasks/"+id,
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

