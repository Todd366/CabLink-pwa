const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK OPERATIONAL CORE INSTALL v1
=========================================
`);


const dirs=[
"database/schema",
"backend/services",
"backend/routes",
"backend/controllers"
];


dirs.forEach(d=>{
fs.mkdirSync(d,{recursive:true});
console.log("✅",d);
});


const files={


"database/schema/users.json":
JSON.stringify({
collection:"users",
fields:[
"id",
"name",
"phone",
"role",
"wallet",
"createdAt"
]
},null,2),



"database/schema/drivers.json":
JSON.stringify({
collection:"drivers",
fields:[
"id",
"name",
"phone",
"vehicle",
"license",
"status",
"location",
"wallet"
]
},null,2),



"database/schema/rides.json":
JSON.stringify({
collection:"rides",
fields:[
"id",
"customerId",
"driverId",
"pickup",
"dropoff",
"fare",
"status",
"createdAt",
"completedAt"
]
},null,2),



"database/schema/transactions.json":
JSON.stringify({
collection:"transactions",
fields:[
"id",
"rideId",
"amount",
"driverPayout",
"platformRevenue",
"status",
"createdAt"
]
},null,2),



"database/schema/rewards.json":
JSON.stringify({
collection:"rewards",
fields:[
"id",
"userId",
"rideId",
"amount",
"token",
"createdAt"
]
},null,2),



"backend/services/ride_service.js":`

const rides=[];

module.exports={

create:function(data){

const ride={
id:"RIDE-"+Date.now(),
...data,
status:"REQUESTED",
createdAt:new Date().toISOString()
};

rides.push(ride);

return ride;

},


updateStatus:function(id,status){

let ride=rides.find(r=>r.id===id);

if(!ride)return null;

ride.status=status;

return ride;

},


list:function(){

return rides;

}

};

`,



"backend/services/driver_service.js":`

const drivers=[];

module.exports={

register:function(data){

const driver={
id:"DRV-"+Date.now(),
...data,
status:"OFFLINE"
};

drivers.push(driver);

return driver;

},


online:function(id){

let d=drivers.find(x=>x.id===id);

if(!d)return null;

d.status="ONLINE";

return d;

},


available:function(){

return drivers.filter(d=>d.status==="ONLINE");

}

};

`,



"backend/services/payment_service.js":`

module.exports={

create:function(ride,finance){

return {

id:"TX-"+Date.now(),

rideId:ride.id,

customerPayment:finance.customerPayment,

driverPayout:finance.driverPayout,

platformRevenue:finance.platformRevenue,

status:"COMPLETED",

createdAt:new Date().toISOString()

};

}

};

`,



"backend/services/reward_service.js":`

module.exports={

create:function(userId,rideId){

return {

id:"REWARD-"+Date.now(),

userId:userId,

rideId:rideId,

token:"THB",

amount:1,

createdAt:new Date().toISOString()

};

}

};

`



};


Object.entries(files).forEach(([file,data])=>{

fs.writeFileSync(file,data);

console.log("✅",file);

});


console.log(`
=========================================
Operational Core Installed
=========================================
`);

