const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 10
FRONTEND BACKEND CONNECTION LAYER
=========================================
`);

[
"frontend/api",
"frontend/services",
"frontend/state",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// API CLIENT

fs.writeFileSync(
"frontend/api/cablink_api.js",
`

const API_URL =
window.CABLINK_API ||
"http://localhost:3000";


async function request(endpoint,options={}){

let response =
await fetch(
API_URL + endpoint,
{
headers:{
"Content-Type":"application/json"
},
...options
}
);


return await response.json();

}


module.exports={
request
};

`
);


// USER SERVICE

fs.writeFileSync(
"frontend/services/user_service.js",
`

const api=require("../api/cablink_api");


async function register(user){

return api.request(
"/api/users/register",
{
method:"POST",
body:JSON.stringify(user)
}
);

}


async function users(){

return api.request(
"/api/users"
);

}


module.exports={
register,
users
};

`
);


// RIDE SERVICE

fs.writeFileSync(
"frontend/services/ride_service.js",
`

const api=require("../api/cablink_api");


async function requestRide(data){

return api.request(
"/api/rides/request",
{
method:"POST",
body:JSON.stringify(data)
}
);

}


async function rides(){

return api.request(
"/api/rides"
);

}


module.exports={
requestRide,
rides
};

`
);


// APP STATE

fs.writeFileSync(
"frontend/state/session_store.js",
`

let session={

user:null,

role:null,

ride:null

};


function setUser(user){

session.user=user;

session.role=user.role;

}


function setRide(ride){

session.ride=ride;

}


function get(){

return session;

}


module.exports={
setUser,
setRide,
get
};

`
);


// API TEST BRIDGE

fs.writeFileSync(
"frontend/api/bridge_test.js",
`

const ride=require("../services/ride_service");
const user=require("../services/user_service");


async function test(){

console.log({

user:
await user.register({

name:"Pilot Passenger",

phone:"+26770000000",

role:"passenger"

}),


ride:
await ride.requestRide({

passenger:"Pilot Passenger",

pickup:"Gaborone CBD",

destination:"Airport"

})

});

}


test();

`
);


// CONNECTION GUIDE

fs.writeFileSync(
"deployment/FRONTEND_BACKEND_CONNECTION.md",
`
# CabLink Frontend Backend Connection

## Start Backend

node backend/server/index.js


## Frontend communicates through:

API Client

frontend/api/cablink_api.js


## Available:

POST /api/users/register

POST /api/rides/request

GET /api/users

GET /api/rides


## Next:

Real database

Authentication

Maps

Realtime updates

`
);


console.log(`
=========================================

✅ PHASE 10 CREATED

Added:

✅ Frontend API client
✅ User service
✅ Ride service
✅ Session state
✅ Frontend/backend bridge

CabLink can now communicate.

NEXT:

Phase 11:
Real database + authentication

=========================================
`);

