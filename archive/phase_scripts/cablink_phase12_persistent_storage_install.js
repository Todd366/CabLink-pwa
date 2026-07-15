const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 12
PERSISTENT STORAGE LAYER
=========================================
`);

[
"backend/storage",
"backend/database",
"backend/routes"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// SIMPLE FILE DATABASE

fs.writeFileSync(
"backend/storage/database.js",
`
const fs=require("fs");

const file="backend/storage/cablink_db.json";


if(!fs.existsSync(file)){

fs.mkdirSync(
"backend/storage",
{recursive:true}
);

fs.writeFileSync(
file,
JSON.stringify({
users:[],
rides:[]
},null,2)
);

}


function read(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function write(data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
);

}


module.exports={
read,
write
};

`
);


// USER DATABASE SERVICE

fs.writeFileSync(
"backend/database/user_repository.js",
`
const db=require("../storage/database");


function create(user){

let data=db.read();

data.users.push(user);

db.write(data);

return user;

}


function all(){

return db.read().users;

}


module.exports={
create,
all
};

`
);


// RIDE DATABASE SERVICE

fs.writeFileSync(
"backend/database/ride_repository.js",
`
const db=require("../storage/database");


function create(ride){

let data=db.read();

data.rides.push(ride);

db.write(data);

return ride;

}


function all(){

return db.read().rides;

}


function update(id,status){

let data=db.read();

let ride=
data.rides.find(
r=>r.id===id
);


if(ride){

ride.status=status;

db.write(data);

}


return ride;

}


module.exports={
create,
all,
update
};

`
);


// UPDATE USER ROUTE

fs.writeFileSync(
"backend/routes/users.js",
`
const router=require("express").Router();

const users=require("../database/user_repository");


router.post(
"/register",
(req,res)=>{

let user={

id:"USER-"+Date.now(),

...req.body,

created:new Date().toISOString()

};


res.json(
users.create(user)
);

}

);


router.get(
"/",
(req,res)=>{

res.json(
users.all()
);

}

);


module.exports=router;

`
);


// UPDATE RIDE ROUTE

fs.writeFileSync(
"backend/routes/rides.js",
`
const router=require("express").Router();

const rides=require("../database/ride_repository");


router.post(
"/request",
(req,res)=>{

let ride={

id:"RIDE-"+Date.now(),

...req.body,

status:"REQUESTED",

created:new Date().toISOString()

};


res.json(
rides.create(ride)
);

}

);


router.get(
"/",
(req,res)=>{

res.json(
rides.all()
);

}

);


router.patch(
"/:id",
(req,res)=>{

res.json(
rides.update(
req.params.id,
req.body.status
)
);

}

);


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"deployment/storage_test.md",
`
# CabLink Phase 12 Storage

Test:

1. Start backend

node backend/server/index.js


2. Create users and rides


3. Restart backend


4. Confirm data remains

Database file:

backend/storage/cablink_db.json

`
);


console.log(`
=========================================

✅ PHASE 12 CREATED

Added:

✅ Persistent storage engine
✅ User repository
✅ Ride repository
✅ Database-backed routes
✅ Restart recovery

NEXT:

Phase 13:
Realtime ride tracking + live driver/passenger state

=========================================
`);

