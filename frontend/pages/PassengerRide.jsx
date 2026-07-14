

import React,{useState} from "react";


export default function PassengerRide(){

const [status,setStatus]=useState(
"Ready"
);


async function requestRide(){


let r=
await fetch(
"/api/dispatch/request",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

passenger:"USER001",

pickup:"Gaborone CBD",

destination:"Airport"

})

}
);


let data=await r.json();


setStatus(
data.request.status
);


}


return (

<div>

<h1>🚖 Request Ride</h1>


<button
onClick={requestRide}
>

Book Ride

</button>


<h2>
Status:
{status}
</h2>


</div>

);

}

