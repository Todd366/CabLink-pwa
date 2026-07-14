const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK PHASE 54
PASSENGER INTELLIGENCE ENGINE
PROFILE + HISTORY + WALLET VIEW
=========================================
`);

[
"backend/data",
"backend/services",
"backend/routes",
"backend/testing",
"frontend/components",
"frontend/pages"
].forEach(d=>fs.mkdirSync(d,{recursive:true}));


// PASSENGER DATABASE

const file="backend/data/passengers.json";

if(!fs.existsSync(file)){
fs.writeFileSync(
file,
JSON.stringify({
passengers:[
{
id:"USER001",
name:"Passenger One",
rides:5,
completed:5,
spent:175,
thbEarned:5,
rating:5
}
]
},null,2)
);
}


// SERVICE

fs.writeFileSync(
"backend/services/passenger_intelligence_service.js",
`
const fs=require("fs");

const file="backend/data/passengers.json";


function load(){

return JSON.parse(
fs.readFileSync(file,"utf8")
);

}


function profile(id){

const db=load();

return db.passengers.find(
p=>p.id===id
);

}


function updateRide(id,fare,thb){

const db=load();

const user=db.passengers.find(
p=>p.id===id
);

if(user){

user.rides++;
user.completed++;
user.spent+=fare;
user.thbEarned+=thb;

}

fs.writeFileSync(
file,
JSON.stringify(db,null,2)
);

return user;

}


module.exports={
profile,
updateRide
};
`
);


// API

fs.writeFileSync(
"backend/routes/passenger_intelligence_api.js",
`
const router=require("express").Router();

const passenger=
require("../services/passenger_intelligence_service");


router.get(
"/passenger/:id/profile",
(req,res)=>{

res.json({
success:true,
profile:
passenger.profile(req.params.id)
});

});


router.post(
"/passenger/update",
(req,res)=>{

res.json({
success:true,
profile:
passenger.updateRide(
req.body.id,
req.body.fare,
req.body.thb
)
});

});


module.exports=router;
`
);


// UI CARD

fs.writeFileSync(
"frontend/components/passenger_profile_card.jsx",
`
export default function PassengerProfileCard({profile}){

return (

<div>

<h2>🧍 Passenger Profile</h2>

<p>
Rides: {profile.rides}
</p>

<p>
Spent: P{profile.spent}
</p>

<p>
THB Earned: {profile.thbEarned}
</p>

<p>
Rating: ⭐ {profile.rating}
</p>

</div>

);

}
`
);


console.log(`
=========================================

✅ PHASE 54 CREATED

Added:

✅ Passenger database
✅ Passenger profile service
✅ Ride statistics
✅ Wallet tracking
✅ Frontend profile card

No existing ride engine modified.

=========================================
`);
