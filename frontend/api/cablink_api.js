

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

