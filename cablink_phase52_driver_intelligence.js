const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 52
DRIVER INTELLIGENCE ENGINE
SMART DISPATCH SCORING
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// DRIVER DATABASE

const file="backend/data/drivers.json";

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({
drivers:[
{
id:"DRIVER001",
name:"Driver One",
rating:4.9,
completed:120,
acceptance:95,
online:true
},
{
id:"DRIVER002",
name:"Driver Two",
rating:4.5,
completed:80,
acceptance:75,
online:true
}
]
},null,2)
);

}


// INTELLIGENCE SERVICE

fs.writeFileSync(
"backend/services/driver_intelligence_service.js",
`

const fs=require("fs");

const file="backend/data/drivers.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


// scoring algorithm

function score(driver,distance){

let ratingScore =
(driver.rating/5)*40;


let acceptanceScore =
(driver.acceptance/100)*30;


let experienceScore =
Math.min(driver.completed/200,1)*20;


let distanceScore =
Math.max(10-distance*2,0);


return Math.round(
ratingScore+
acceptanceScore+
experienceScore+
distanceScore
);

}


function rank(drivers,distance){

return drivers
.filter(d=>d.online)
.map(d=>({

...d,

dispatchScore:
score(d,distance)

}))
.sort(
(a,b)=>
b.dispatchScore-a.dispatchScore
);

}


function best(distance){

const db=load();

return rank(
db.drivers,
distance
)[0];

}


module.exports={
rank,
best
};

`
);


// API

fs.writeFileSync(
"backend/routes/driver_intelligence_api.js",
`

const router=require("express").Router();

const intelligence=
require("../services/driver_intelligence_service");


router.post(
"/drivers/rank",
(req,res)=>{

res.json({

success:true,

drivers:
intelligence.rank(
require("../data/drivers.json").drivers,
req.body.distance || 1

)

});

});


router.post(
"/drivers/best",
(req,res)=>{

res.json({

success:true,

driver:
intelligence.best(
req.body.distance || 1
)

});

});


module.exports=router;

`
);


// TEST

fs.writeFileSync(
"backend/testing/phase52_driver_test.js",
`

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

`
);


console.log(`
=========================================

✅ PHASE 52 CREATED

Added:

✅ Driver database
✅ Driver scoring engine
✅ Smart ranking
✅ Best driver selection
✅ Dispatch intelligence API
✅ Test system

NEXT:

Mount route
restart backend
test intelligence

=========================================
`);

