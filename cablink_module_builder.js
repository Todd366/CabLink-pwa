const fs=require("fs");

console.log(`
🚕 BUILDING CABLINK REAL MODULE TREE
`);

const modules={

"frontend/js/rides/rideService.js":`

export async function requestRide(data){

const response=await fetch('/api/rides',{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify(data)
});

return await response.json();

}

`,

"frontend/js/driver/driverService.js":`

export async function driverOnline(driver){

return fetch('/api/drivers/online',{
method:'POST',
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify(driver)
});

}


export async function getRideRequests(){

const r=await fetch('/api/rides');

return await r.json();

}

`,

"frontend/js/services/api.js":`

export const API={
rides:'/api/rides',
drivers:'/api/drivers/online',
health:'/api/health'
};

`

};


for(const file in modules){

fs.writeFileSync(file,modules[file]);

console.log("✅ Created",file);

}


