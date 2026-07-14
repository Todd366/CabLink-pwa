const {spawn} = require("child_process");
const http=require("http");

console.log(`
=========================================
🚕 CABLINK PHASE 11
FULL STACK INTEGRATION TEST
=========================================
`);

console.log("Starting backend...");

const server=spawn(
"node",
[
"backend/server/index.js"
],
{
stdio:"inherit"
}
);


function checkBackend(){

http.get(
"http://localhost:3000/health",
res=>{

let data="";

res.on(
"data",
chunk=>data+=chunk
);


res.on(
"end",
()=>{

console.log(`
=========================================

✅ BACKEND ONLINE

${data}

=========================================
`);


runFrontend();

}

);

}

).on(
"error",
()=>{

console.log(
"Waiting for backend..."
);

setTimeout(
checkBackend,
1000
);

}

);

}



async function runFrontend(){

console.log(`
=========================================

Testing frontend bridge...

=========================================
`);


const user=require("./frontend/services/user_service");
const ride=require("./frontend/services/ride_service");


try{


let registered=
await user.register({

name:"Pilot User",

phone:"+26770000000",

role:"passenger"

});


let request=
await ride.requestRide({

passenger:
registered.id,

pickup:"Gaborone CBD",

destination:"Airport"

});


console.log({

user:registered,

ride:request

});


console.log(`
=========================================

✅ FULL STACK CONNECTION SUCCESS

Frontend
    ↓
API Bridge
    ↓
Express Backend
    ↓
Ride Engine

=========================================
`);


process.exit();


}catch(e){

console.log(
"Integration failed:",
e.message
);

process.exit(1);

}

}


checkBackend();

