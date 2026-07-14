import React,{useState} from "react";

import PassengerTripStatus 
from "../components/passenger_trip_status.jsx";

import THBRewardPanel
from "../components/thb_reward_panel.jsx";


export default function PassengerRide(){

const [ride,setRide]=useState({

id:null,
status:"Ready",
driver:null,
reward:0

});


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


setRide({

id:data.request.id,

status:data.request.status,

driver:data.request.driver,

reward:1

});


}



return (

<div>

<h1>
🚖 Request Ride
</h1>


<button
onClick={requestRide}
>

Book Ride

</button>


<PassengerTripStatus

rideId={ride.id}

status={ride.status}

driver={ride.driver}

/>


<THBRewardPanel

reward={ride.reward}

currency="THB"

status="Waiting"

/>


</div>

);

}
