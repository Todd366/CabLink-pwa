

const intelligence=
require("../services/driver_intelligence_service");


console.log(
"RANKING"
);


console.log(
intelligence.rank(
[
{
id:"A",
rating:5,
completed:200,
acceptance:100,
online:true
},
{
id:"B",
rating:4,
completed:20,
acceptance:60,
online:true
}
],
2
)
);


console.log(
"BEST"
);


console.log(
intelligence.best(2)
);

