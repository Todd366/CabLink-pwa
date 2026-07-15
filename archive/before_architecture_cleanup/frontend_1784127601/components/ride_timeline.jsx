
export default function RideTimeline({events}){

return (

<div>

<h2>
🚕 Ride Timeline
</h2>

{
events.map(
(e,i)=>(

<div key={i}>

<h3>
{e.type}
</h3>

<p>
{e.message}
</p>

</div>

)
)

}

</div>

);

}

