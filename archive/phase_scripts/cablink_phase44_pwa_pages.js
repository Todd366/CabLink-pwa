const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 44
PWA PAGE INTEGRATION ENGINE
DRIVER + PASSENGER SCREENS
=========================================
`);

[
"frontend/pages",
"frontend/components",
"frontend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DRIVER PAGE

fs.writeFileSync(
"frontend/pages/DriverDashboard.jsx",
`

import React,{useEffect,useState} from "react";


export default function DriverDashboard(){

const [economy,setEconomy]=useState(null);
const [hotspots,setHotspots]=useState([]);


useEffect(()=>{

fetch("/api/driver/DRIVER001/economy")
.then(r=>r.json())
.then(setEconomy);


fetch("/api/driver/hotspots")
.then(r=>r.json())
.then(d=>setHotspots(d.hotspots));


},[]);


return (

<div>

<h1>🚕 Driver Dashboard</h1>


<div>

<h2>Economy</h2>

{
economy &&

<div>

<p>Rides: {economy.rides}</p>

<p>Completed: {economy.completed}</p>

<p>THB Earned: {economy.thbEarned}</p>

<p>Revenue: {economy.totalFare}</p>

</div>

}

</div>



<h2>🔥 Demand Areas</h2>


{
hotspots.map(
(h,i)=>(

<div key={i}>

{h.location}

Score:
{h.score}

</div>

)
)

}


</div>

);

}

`
);


// PASSENGER PAGE

fs.writeFileSync(
"frontend/pages/PassengerRide.jsx",
`

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

`
);


// UPDATES PAGE

fs.writeFileSync(
"frontend/pages/UpdatesCenter.jsx",
`

import React,{useEffect,useState} from "react";


export default function UpdatesCenter(){

const [updates,setUpdates]=useState([]);


useEffect(()=>{

fetch("/api/updates")
.then(r=>r.json())
.then(setUpdates);

},[]);


return (

<div>

<h1>📢 CabLink Updates</h1>

{
updates.map(
(u,i)=>(

<div key={i}>

<h3>{u.title}</h3>

<p>{u.message}</p>

</div>

)
)

}

</div>

);

}

`
);


// TEST

fs.writeFileSync(
"frontend/testing/phase44_page_test.js",
`

const fs=require("fs");


console.log({

driver:
fs.existsSync(
"frontend/pages/DriverDashboard.jsx"
),

passenger:
fs.existsSync(
"frontend/pages/PassengerRide.jsx"
),

updates:
fs.existsSync(
"frontend/pages/UpdatesCenter.jsx"
)

});

`
);


console.log(`
=========================================

✅ PHASE 44 CREATED

Added:

✅ Driver Dashboard page
✅ Passenger Ride page
✅ Updates Center page
✅ API-connected UI
✅ PWA screen structure

RUN:

node frontend/testing/phase44_page_test.js

=========================================
`);

