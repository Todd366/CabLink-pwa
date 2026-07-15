

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

