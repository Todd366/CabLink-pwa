
export async function submitApplication(data){

const r = await fetch('/api/drivers/apply',{
method:'POST',
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

return await r.json();

}
