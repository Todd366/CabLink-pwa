const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 53
IDENTITY ENGINE
USER + ROLE MANAGEMENT CORE
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing",
"frontend/services"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// USER DATABASE

const file="backend/data/users.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
users:[
{
id:"USER001",
name:"Passenger One",
role:"PASSENGER",
active:true
},
{
id:"DRIVER001",
name:"Driver One",
role:"DRIVER",
active:true
},
{
id:"ADMIN001",
name:"CabLink Admin",
role:"ADMIN",
active:true
}
]
},null,2)
);

}


// IDENTITY SERVICE

fs.writeFileSync(
"backend/services/identity_service.js",
`

const fs=require("fs");

const file="backend/data/users.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function getUser(id){

const db=load();

return db.users.find(
u=>u.id===id
);

}


function createUser(user){

const db=load();

const item={

id:user.id,

name:user.name,

role:user.role,

active:true,

created:new Date().toISOString()

};

db.users.push(item);

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return item;

}


function verifyRole(id,role){

const user=getUser(id);

return !!(
user &&
user.role===role
);

}


module.exports={
getUser,
createUser,
verifyRole
};

`
);


// API

fs.writeFileSync(
"backend/routes/identity_api.js",
`

const router=require("express").Router();

const identity=
require("../services/identity_service");


// get identity

router.get(
"/user/:id",
(req,res)=>{

res.json({

success:true,

user:
identity.getUser(
req.params.id
)

});

});


// create user

router.post(
"/user/create",
(req,res)=>{

res.json({

success:true,

user:
identity.createUser(
req.body
)

});

});


// role verification

router.post(
"/user/verify-role",
(req,res)=>{

res.json({

success:true,

allowed:
identity.verifyRole(
req.body.id,
req.body.role
)

});

});


module.exports=router;

`
);


// FRONTEND CONNECTOR

fs.writeFileSync(
"frontend/services/identity_api.js",
`

async function getUser(id){

const r=
await fetch(
"/api/user/"+id
);

return r.json();

}


module.exports={
getUser
};

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase53_identity_test.js",
`

const identity=
require("../services/identity_service");


console.log(
"PASSENGER"
);

console.log(
identity.getUser(
"USER001"
)
);


console.log(
"DRIVER ROLE CHECK"
);

console.log(
identity.verifyRole(
"DRIVER001",
"DRIVER"
)
);


console.log(
"ADMIN"
);

console.log(
identity.getUser(
"ADMIN001"
)
);

`
);


console.log(`
=========================================

✅ PHASE 53 CREATED

Added:

✅ User database
✅ Role management
✅ Identity service
✅ User API
✅ Role verification
✅ Frontend identity connector

No ride engine modified.

NEXT:

Mount route
restart backend
test identity

=========================================
`);

