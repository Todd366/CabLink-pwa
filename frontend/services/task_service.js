

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

