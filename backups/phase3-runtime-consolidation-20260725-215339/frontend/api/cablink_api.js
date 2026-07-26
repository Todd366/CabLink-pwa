

const API_URL =
typeof window !== "undefined" &&
window.CABLINK_API
?
window.CABLINK_API
:
import.meta.env.VITE_CABLINK_API_URL || '';


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

