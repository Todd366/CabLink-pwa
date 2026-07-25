'use strict';
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ── IN-MEMORY STORES ─────────────────────────────────────
var rides   = [];
var drivers = {};  // driverId -> driver object
var ratings = [];

// ── RIDE LIFECYCLE STATES ─────────────────────────────────
// REQUESTED -> MATCHING -> DRIVER_ASSIGNED -> ACCEPTED
// -> ARRIVED -> IN_PROGRESS -> COMPLETED -> REWARD_PENDING -> REWARD_CLAIMED
// CANCELLED (any stage before IN_PROGRESS)

// ── HEALTH ────────────────────────────────────────────────
app.get('/api/health', function(req, res) {
  res.json({
    status: 'ok', version: '5.0.0',
    ecosystem: 'BSTM CabLink', timestamp: new Date().toISOString(),
    ridesCount: rides.length, driversOnline: Object.keys(drivers).length
  });
});

// ── RIDES ─────────────────────────────────────────────────
app.post('/api/rides', function(req, res) {
  var b = req.body || {};
  if (!b.pickup || !b.dropoff)
    return res.status(400).json({error:'pickup and dropoff required'});

  var ride = {
    id:         'CL-' + Date.now().toString(36).toUpperCase(),
    pickup:     b.pickup,
    dropoff:    b.dropoff,
    vehicle:    b.vehicle    || 'standard',
    fare:       b.fare       || 20,
    distanceKm: b.distanceKm || 5,
    wallet:     b.wallet     || null,
    notes:      b.notes      || '',
    status:     'REQUESTED',
    driverId:   null, driverName: null,
    rating:     null, comment: null,
    createdAt:  new Date().toISOString(),
    updatedAt:  new Date().toISOString(),
  };
  rides.unshift(ride);
  if (rides.length > 200) rides = rides.slice(0,200);

  // Auto-match to an online driver if one available
  var available = Object.values(drivers).filter(function(d){ return d.status==='online'; });
  if (available.length > 0) {
    ride.status   = 'MATCHING';
    ride.updatedAt = new Date().toISOString();
    // In Phase 2: real matching algorithm (nearest driver)
    // For now: notify all online drivers (they see it via polling)
  }

  console.log('New ride:', ride.id, ride.pickup, '->', ride.dropoff, ride.fare+'BWP');
  res.json({success:true, ride:ride});
});

app.get('/api/rides', function(req, res) {
  res.json({rides: rides.slice(0,50)});
});

app.get('/api/rides/:id', function(req, res) {
  var ride = rides.find(function(r){ return r.id===req.params.id; });
  if (!ride) return res.status(404).json({error:'Ride not found'});
  res.json({ride:ride});
});

app.patch('/api/rides/:id', function(req, res) {
  var ride = rides.find(function(r){ return r.id===req.params.id; });
  if (!ride) return res.status(404).json({error:'Ride not found'});
  var allowed = ['status','driverId','driverName','rating','comment','lat','lng'];
  allowed.forEach(function(k){ if (req.body[k] !== undefined) ride[k] = req.body[k]; });
  ride.updatedAt = new Date().toISOString();
  // If COMPLETED -> REWARD_PENDING
  if (ride.status === 'COMPLETED' && !ride.rewardReady) {
    ride.status = 'REWARD_PENDING';
    ride.rewardReady = true;
  }
  console.log('Ride updated:', ride.id, '->', ride.status);
  res.json({success:true, ride:ride});
});

// ── DRIVERS ───────────────────────────────────────────────
app.post('/api/drivers/online', function(req, res) {
  var b = req.body || {};
  var id = b.driverId || b.wallet || ('drv-' + Date.now());
  drivers[id] = {
    id:          id,
    vehicle:     b.vehicle || 'standard',
    lat:         b.lat     || -24.6541 + (Math.random()-0.5)*0.05,
    lng:         b.lng     || 25.9087  + (Math.random()-0.5)*0.05,
    status:      'online',
    wallet:      b.wallet  || null,
    onlineSince: new Date().toISOString(),
  };
  var pending = rides.filter(function(r){ return r.status==='REQUESTED'||r.status==='MATCHING'; });
  console.log('Driver online:', id, '| pending rides:', pending.length);
  res.json({success:true, driverId:id, status:'online', pendingRides:pending.length});
});

app.post('/api/drivers/offline', function(req, res) {
  var b = req.body || {};
  var id = b.driverId || b.wallet;
  if (id && drivers[id]) delete drivers[id];
  else {
    // Delete any matching wallet
    Object.keys(drivers).forEach(function(k){
      if (drivers[k].wallet === id) delete drivers[k];
    });
  }
  res.json({success:true, status:'offline'});
});

app.get('/api/drivers/online', function(req, res) {
  var list = Object.values(drivers);
  // Slowly drift driver positions (simulate movement)
  list.forEach(function(d){
    d.lat += (Math.random()-0.5)*0.001;
    d.lng += (Math.random()-0.5)*0.001;
  });
  res.json({count:list.length, drivers:list});
});

// ── DRIVER APPLICATIONS ───────────────────────────────────
var applications = [];
app.post('/api/drivers/apply', function(req, res) {
  var b = req.body || {};
  if (!b.name||!b.phone||!b.license||!b.vehicle)
    return res.status(400).json({error:'All fields required'});
  var rec = {
    id:        'DRV-' + Date.now().toString(36).toUpperCase(),
    name:      b.name, phone: b.phone,
    license:   b.license, vehicle: b.vehicle,
    wallet:    b.wallet || null, status: 'pending',
    appliedAt: new Date().toISOString()
  };
  applications.push(rec);
  console.log('Driver application:', rec.id, rec.name);
  res.json({success:true, id:rec.id, message:'Application received. We will contact you within 24 hours.'});
});

app.get('/api/drivers/applications', function(req, res) {
  res.json({count:applications.length, applications:applications});
});

// ── RATINGS ───────────────────────────────────────────────
app.post('/api/ratings', function(req, res) {
  var b = req.body||{};
  var rating = {id:Date.now(), rideId:b.rideId, stars:b.stars, comment:b.comment, date:new Date().toISOString()};
  ratings.push(rating);
  res.json({success:true, rating:rating});
});

// ── CATCH-ALL → index.html ───────────────────────────────
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── START ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, function() {
    console.log('CabLink backend: http://localhost:' + PORT);
    console.log('Routes: /api/health | /api/rides | /api/drivers/online | /api/drivers/apply');
  });
}
module.exports = app;
