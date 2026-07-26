import React from "react";

export default function DashboardCard({
title,
children
}){

return (

<div className="cab-card">

<h2>{title}</h2>

{children}

</div>

);

}
