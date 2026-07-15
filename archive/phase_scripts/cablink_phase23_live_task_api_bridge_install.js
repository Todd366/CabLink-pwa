const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 23
LIVE TASK API BRIDGE
BSTM DRIVER ACCEPTANCE
=========================================
`);

[
"frontend/api",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// FRONTEND API CLIENT

fs.writeFileSync(
"frontend/api/task_api.js",
`

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

`
);


// DRIVER LIVE TASK SERVICE

fs.writeFileSync(
"frontend/services/task_service.js",
`

const state=require("../state/task_state");


async function refresh(api){

const tasks=await api.getTasks();

state.set(tasks);

return tasks;

}


async function accept(api,id,driver){

const task=
await api.acceptTask(id,driver);


return task;

}


module.exports={
refresh,
accept
};

`
);


// BACKEND ROUTE TEST

fs.writeFileSync(
"backend/testing/live_task_flow_test.js",
`

const tasks=require("../tasks/task_manager");


let task=tasks.create({

customer:"USER100",

pickup:"BSTM MARKETPLACE",

dropoff:"Main Mall",

type:"DELIVERY"

});


console.log("CREATED");

console.log(task);


console.log("ASSIGN DRIVER");


console.log(

tasks.assign(

task.id,

"DRIVER001"

)

);


console.log("ALL");

console.log(

tasks.all()

);

`
);


console.log(`
=========================================

✅ PHASE 23 CREATED

Added:

✅ Frontend task API connector
✅ Driver acceptance service
✅ Live task workflow foundation
✅ Marketplace delivery flow

RUN:

node backend/testing/live_task_flow_test.js

NEXT:

Phase 24:
Connect Express server routes + real app dashboard buttons

=========================================
`);

