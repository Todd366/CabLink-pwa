import React,{useState} from "react";

import "./styles/cablink.css";

import CabLinkHeader
from "./components/CabLinkHeader.jsx";

import BottomNavigation
from "./components/BottomNavigation.jsx";

import PassengerRide
from "./pages/PassengerRide.jsx";

import DriverDashboard
from "./pages/DriverDashboard.jsx";

import UpdatesCenter
from "./pages/UpdatesCenter.jsx";


export default function App(){

const [role,setRole]=useState("passenger");


return (

<div className="app-shell">


<CabLinkHeader

role={role}

setRole={setRole}

/>



<main className="content">


{
role==="passenger"

?

<PassengerRide/>

:

<DriverDashboard/>

}



<UpdatesCenter/>


</main>



<BottomNavigation/>


</div>

);

}
