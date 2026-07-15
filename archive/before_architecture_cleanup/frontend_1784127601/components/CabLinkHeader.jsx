import React from "react";

export default function CabLinkHeader({
role,
setRole
}){

return (
<header className="cab-header">

<div>
<h1>🚕 CabLink</h1>
<p>BSTM Smart Mobility</p>
</div>

<button
onClick={() =>
setRole(
role==="passenger"
?"driver"
:"passenger"
)
}
>
Switch to {role==="passenger"?"Driver":"Passenger"}
</button>

</header>
);

}
