
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
