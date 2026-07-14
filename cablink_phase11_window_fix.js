const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 11 WINDOW COMPATIBILITY FIX
=========================================
`);

fs.writeFileSync(
"frontend/api/cablink_api.js",
`

const API_URL =
typeof window !== "undefined" &&
window.CABLINK_API
?
window.CABLINK_API
:
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

`
);


console.log(`
=========================================

✅ WINDOW COMPATIBILITY FIXED

Now supports:

✅ Browser PWA
✅ Node testing
✅ Local backend
✅ Future production API URL

=========================================
`);

