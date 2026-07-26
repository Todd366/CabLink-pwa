

const dashboard=
require("../components/driver_dashboard");

const demand=
require("../components/demand_panel");


console.log(
dashboard.render(
{
rides:5,
completed:4,
totalFare:120,
thbEarned:5
}
)
);


console.log(
demand.render(
{
hotspots:[
{
location:"Gaborone CBD",
score:80
}
]
}
)
);

