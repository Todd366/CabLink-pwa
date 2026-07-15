const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK SINGLE RIDE READ INSTALLER
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


if(!code.includes("app.get('/api/rides/:id'")){

const route=`


// ===== SINGLE RIDE TRUTH READ =====

app.get('/api/rides/:id', function(req,res){

const rideRepository = require('./database/rideRepository');

const ride = rideRepository.all()
.find(r => r.id === req.params.id);


if(!ride){

return res.status(404).json({
error:"Ride not found"
});

}


res.json({
ride
});

});


// ================================

`;


code=code.replace(
"// ── CATCH-ALL",
route+"\\n// ── CATCH-ALL"
);


console.log("✅ Added GET /api/rides/:id");

}
else{

console.log("✅ Route already exists");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

Added:

GET /api/rides/:id

Flow:

Frontend
  |
  ↓
server.js
  |
  ↓
rideRepository
  |
  ↓
rides.json

=========================================
`);

