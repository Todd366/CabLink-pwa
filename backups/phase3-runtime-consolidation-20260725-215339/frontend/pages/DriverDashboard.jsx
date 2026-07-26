

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

