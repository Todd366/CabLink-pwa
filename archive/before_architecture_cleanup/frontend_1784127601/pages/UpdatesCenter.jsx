

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

