

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

