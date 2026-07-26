

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

