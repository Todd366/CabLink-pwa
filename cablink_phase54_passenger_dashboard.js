const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 54
PASSENGER DASHBOARD EXPERIENCE
FRONTEND INTEGRATION LAYER
=========================================
`);

[
"frontend/components",
"frontend/services"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// PASSENGER DASHBOARD COMPONENT

fs.writeFileSync(
"frontend/components/passenger_dashboard.jsx",
`
import {useEffect,useState} from "react";

export default function PassengerDashboard(){

const [ride,setRide]=useState(null);
const [events,setEvents]=useState([]);

useEffect(()=>{

const id=localStorage.getItem("activeRide");

if(!id) return;


fetch("/api/ride/"+id+"/status")
.then(r=>r.json())
.then(d=>setRide(d.ride));


fetch("/api/ride/"+id+"/timeline")
.then(r=>r.json())
.then(d=>setEvents(d.events));


},[]);


return (

<div>

<h1>
🚕 CabLink Passenger Dashboard
</h1>


{
ride &&

<div>

<h2>
Live Ride
</h2>

<p>
Status: {ride.status}
</p>

<p>
From: {ride.pickup}
</p>

<p>
To: {ride.destination}
</p>

{
ride.fare &&
<p>
Fare: {ride.fare} BWP
</p>
}

</div>

}


<h2>
Activity Timeline
</h2>


{
events.map(
(e)=>(

<div key={e.id}>

<b>{e.type}</b>

<p>{e.message}</p>

</div>

)
)

}


</div>

);

}
`
);


// SERVICE

fs.writeFileSync(
"frontend/services/passenger_dashboard_api.js",
`
async function getRide(id){

const status=
await fetch(
"/api/ride/"+id+"/status"
);

const timeline=
await fetch(
"/api/ride/"+id+"/timeline"
);


return {

ride:
await status.json(),

events:
await timeline.json()

};

}


module.exports={
getRide
};

`
);


// SAFE EXPORT HELPER

fs.writeFileSync(
"frontend/components/dashboard_registry.js",
`
import PassengerDashboard from "./passenger_dashboard";

export {
PassengerDashboard
};
`
);


console.log(`
=========================================

✅ PHASE 54 CREATED

Added:

✅ Passenger dashboard UI
✅ Live ride status view
✅ Timeline connection
✅ Fare visibility
✅ Future THB reward compatibility
✅ No ride engine changes

NEXT:

Connect dashboard route
restart frontend
test UI

=========================================
`);

