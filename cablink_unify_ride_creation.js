const fs=require("fs");

console.log(`
=========================================
🚕 CABLINK RIDE BRAIN UNIFIER
=========================================
`);

const file="backend/server.js";

let code=fs.readFileSync(file,"utf8");

if(!code.includes("rideService.createRide")){

const old=`  var ride = {
    id:        'RIDE-' + Date.now(),
    pickup:    b.pickup,
    dropoff:   b.dropoff,
    vehicle:   b.vehicle   || 'standard',
    fare:      b.fare      || 20,
    wallet:    b.wallet    || null,
    status:    'searching',
    createdAt: new Date().toISOString(),
    driverId:  null
  };
  rides.unshift(ride);
  if (rides.length > 100) rides = rides.slice(0, 100);
  console.log('New ride:', ride.id, ride.pickup, '->', ride.dropoff);
  res.json({ success:true, ride:ride });`;

const replacement=`  const ride = rideService.createRide(b);

  console.log('New REAL ride:', ride.id, ride.pickup, '->', ride.dropoff);

  res.json({
    success:true,
    ride:ride
  });`;

if(code.includes(old)){

code=code.replace(old,replacement);

console.log("✅ Replaced old ride creator");

}else{

console.log("⚠️ Old block not found - manual review needed");

}

}else{

console.log("✅ Already unified");

}


fs.writeFileSync(file,code);


console.log(`
=========================================
DONE

server.js now points to:
rideService
      ↓
rideRepository

=========================================
`);

