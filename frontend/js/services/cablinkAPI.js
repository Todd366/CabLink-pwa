export async function api(url, options={}){

const response = await fetch(url,{
headers:{
"Content-Type":"application/json"
},
...options
});

return await response.json();

}
