const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDE READ UNIFIER
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");


const old=`app.get('/api/rides', function(req, res) {
  res.json({ rides: rides.slice(0, 20) });
});`;


const replacement=`app.get('/api/rides', function(req, res) {

  const rideServiceStore = require('./database/rideRepository');

  res.json({
    rides: rideServiceStore.all().slice(0,20)
  });

});`;


if(code.includes(old)){

code=code.replace(old,replacement);

console.log("✅ GET /api/rides connected to truth repository");

}else{

console.log("⚠️ GET route pattern not found");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
COMPLETE

READ FLOW:

GET /api/rides
        |
        v
rideRepository
        |
        v
rides.json

=========================================
`);

