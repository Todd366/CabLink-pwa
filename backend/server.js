'use strict';
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const rideService = require('./services/rideService');
const rideDispatch = require('./services/ride_dispatch_bridge');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// In-memory stores (Phase 1 — Firebase in Phase 2)
var rides          = [];
var driversOnline  = {};
var driverApps     = [];

// ── HEALTH ────────────────────────────────────────────────────
app.get('/api/health', function(req, res) {
  res.json({ status:'ok', version:'5.0.0', ecosystem:'BSTM CabLink',
    timestamp:new Date().toISOString(), ridesCount:rides.length,
    driversOnline:Object.keys(driversOnline).length });
});

// ── RIDES ─────────────────────────────────────────────────────
app.post('/api/rides', function(req, res) {
  var b = req.body || {};
  if (!b.pickup || !b.dropoff) {
    return res.status(400).json({ error:'pickup and dropoff required' });
  }
  const ride = rideService.createRide(b);

  rideDispatch.dispatchRide(ride);

  console.log('New REAL ride:', ride.id, ride.pickup, '->', ride.dropoff);

  res.json({
    success:true,
    ride:ride
  });
});

app.get('/api/rides', function(req, res) {

  const rideServiceStore = require('./database/rideRepository');

  res.json({
    rides: rideServiceStore.all().slice(0,20)
  });

});

app.patch('/api/rides/:id', function(req, res) {
  var ride = rides.find(function(r){ return r.id === req.params.id; });
  if (!ride) return res.status(404).json({ error:'Ride not found' });
  Object.assign(ride, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success:true, ride:ride });
});

// ── DRIVERS ───────────────────────────────────────────────────
app.post('/api/drivers/online', function(req, res) {
  var b = req.body || {};
  var id = b.driverId || b.wallet || 'driver-' + Date.now();
  driversOnline[id] = {
    id:id, vehicle:b.vehicle||'standard',
    lat:b.lat||-24.6541, lng:b.lng||25.9087,
    status:'online', onlineSince:new Date().toISOString()
  };
  console.log('Driver online:', id);
  res.json({ success:true, driverId:id, status:'online',
    pendingRides: rides.filter(function(r){ return r.status==='searching'; }).length });
});

app.post('/api/drivers/offline', function(req, res) {
  var b = req.body || {};
  var id = b.driverId || b.wallet;
  if (id) delete driversOnline[id];
  res.json({ success:true, status:'offline' });
});

app.get('/api/drivers/online', function(req, res) {
  var list = Object.values(driversOnline);
  res.json({ count:list.length, drivers:list });
});

// ── DRIVER APPLICATIONS ───────────────────────────────────────
app.post('/api/drivers/apply', function(req, res) {
  var b = req.body || {};
  if (!b.name || !b.phone || !b.license || !b.vehicle) {
    return res.status(400).json({ error:'Missing required fields' });
  }
  var rec = { id:'DRV-'+Date.now(), name:b.name, phone:b.phone,
    license:b.license, vehicle:b.vehicle, wallet:b.wallet||null,
    status:'pending', createdAt:new Date().toISOString() };
  driverApps.push(rec);
  console.log('Driver application:', rec.id, rec.name);
  res.json({ success:true, id:rec.id, message:'Application received.' });
});




// ===== REAL RIDE LIFECYCLE =====

app.patch('/api/rides/:id/accept', function(req,res){

const ride = rideService.acceptRide(
req.params.id,
req.body.driverId
);

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});


app.patch('/api/rides/:id/complete', function(req,res){

const ride = rideService.completeRide(
req.params.id
);

if(!ride){
return res.status(404).json({
error:"Ride not found"
});
}

res.json({
success:true,
ride
});

});


// ===============================





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

// ── CATCH-ALL ─────────────────────────────────────────────────
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, function() {
  console.log('CabLink backend: http://localhost:' + PORT);
  console.log('  GET  /api/health');
  console.log('  POST /api/rides');
  console.log('  GET  /api/rides');
  console.log('  POST /api/drivers/online');
  console.log('  GET  /api/drivers/online');
  console.log('  POST /api/drivers/offline');
  console.log('  POST /api/drivers/apply');
});
