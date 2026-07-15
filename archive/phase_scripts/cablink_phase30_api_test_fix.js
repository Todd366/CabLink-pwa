const fs=require("fs");

console.log(`
=========================================
🚕 PHASE 30 API TEST FIX
BROWSER + NODE COMPATIBILITY
=========================================
`);


const file="frontend/api/task_api.js";


if(!fs.existsSync(file)){
 console.log("❌ task_api.js missing");
 process.exit(1);
}


fs.writeFileSync(
file,
`

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

`
);


console.log(`
=========================================

✅ API CLIENT FIXED

Supports:

✅ Browser PWA
✅ Node testing
✅ Local backend connection

NEXT:

Start backend:

npm run backend

Then:

node frontend/testing/live_driver_economy_test.js

=========================================
`);

