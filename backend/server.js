/**
 * CabLink Backend — server.js
 * Minimal Express server for Phase 1 (beta).
 * Serves the static PWA files and exposes a health endpoint.
 *
 * Usage from project root:
 *   node backend/server.js
 *   OR: npm run backend
 *
 * Phase 2 will add:
 *   - Firebase Admin SDK for server-side ride matching
 *   - JWT auth middleware
 *   - Real-time ride dispatch via Firestore triggers
 *   - THB treasury relay (server signs and sends THB to riders)
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve the PWA from the project root (one level up from /backend)
app.use(express.static(path.join(__dirname, '..')));

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', function (req, res) {
  res.json({
    status:    'ok',
    version:   '5.0.0',
    ecosystem: 'BSTM CabLink',
    timestamp: new Date().toISOString()
  });
});

// ── DRIVER APPLICATIONS (Phase 1 — in-memory, no Admin SDK yet) ──
// In Phase 2 this will verify the Firestore write made by fix.js
// and send a confirmation SMS via Africa's Talking API.
var driverApplications = [];

app.post('/api/drivers/apply', function (req, res) {
  var body = req.body || {};
  if (!body.name || !body.phone || !body.license || !body.vehicle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  var record = {
    id:        'DRV-' + Date.now(),
    name:      body.name,
    phone:     body.phone,
    license:   body.license,
    vehicle:   body.vehicle,
    wallet:    body.wallet || null,
    status:    'pending',
    createdAt: new Date().toISOString()
  };
  driverApplications.push(record);
  console.log('📋 New driver application:', record.id, record.name);
  res.json({ success: true, id: record.id, message: 'Application received. We will review and contact you.' });
});

app.get('/api/drivers', function (req, res) {
  res.json({ count: driverApplications.length, applications: driverApplications });
});

// ── RIDE BOOKING STUB (Phase 1) ───────────────────────────────
// Returns "no drivers" for now. Phase 2 will match from Firestore.
app.post('/api/rides/book', function (req, res) {
  var body = req.body || {};
  if (!body.pickup || !body.dropoff) {
    return res.status(400).json({ error: 'pickup and dropoff required' });
  }
  // Stub: always no drivers in Phase 1 (real matching comes in Phase 2)
  res.json({
    success:  false,
    status:   'no_drivers',
    message:  'No drivers available in your area right now. Try again in a few minutes.',
    rideId:   null
  });
});



// ================================
// CABLINK OPERATION API LAYER
// ================================

const rideService=require("./services/ride_service");
const driverService=require("./services/driver_service");
const paymentService=require("./services/payment_service");
const rewardService=require("./services/reward_service");


app.post("/api/rides/create",function(req,res){

const ride=
rideService.create(req.body||{});

res.json({
success:true,
ride:ride
});

});


app.get("/api/rides",function(req,res){

res.json({
success:true,
rides:rideService.list()
});

});


app.post("/api/drivers/register",function(req,res){

const driver=
driverService.register(req.body||{});

res.json({
success:true,
driver:driver
});

});


app.get("/api/drivers/available",function(req,res){

res.json({
success:true,
drivers:driverService.available()
});

});


app.post("/api/payments/create",function(req,res){

res.json({
success:true,
transaction:
paymentService.create(
req.body.ride,
req.body.finance
)
});

});


app.post("/api/rewards/create",function(req,res){

res.json({
success:true,
reward:
rewardService.create(
req.body.userId,
req.body.rideId
)
});

});


app.get("/api/system/status",function(req,res){

res.json({

system:"CabLink",

version:"5.0",

status:"operational",

timestamp:new Date().toISOString()

});

});


// ================================
// END CABLINK API LAYER
// ================================



// BSTM Marketplace Task Bridge
const ecosystemTasks=require("./routes/ecosystem_tasks");
app.use("/api/ecosystem", ecosystemTasks);






// Driver Dashboard Economy API
const driverDashboardAPI=require("./routes/driver_dashboard_api");
app.use("/api", driverDashboardAPI);



// Ride Economy API
const rideEconomyAPI=require("./routes/ride_economy_api");
app.use("/api", rideEconomyAPI);




// Driver Economy Dashboard API
const driverEconomyAPI=require("./routes/driver_economy_api");
app.use("/api", driverEconomyAPI);




// Driver Visibility APIs
const driverDemandAPI=require("./routes/driver_demand_api");
app.use("/api", driverDemandAPI);

const updatesAPI=require("./routes/updates_api");
app.use("/api", updatesAPI);




// Live Demand Intelligence API
const liveDemandAPI=require("./routes/live_demand_api");
app.use("/api", liveDemandAPI);




// Smart Driver Matching API
const matchingAPI=require("./routes/matching_api");
app.use("/api", matchingAPI);




// Smart Dispatch API
const dispatchAPI=require("./routes/dispatch_api");
app.use("/api", dispatchAPI);




// Live Ride State API
const liveRideAPI=require("./routes/live_ride_api");
app.use("/api", liveRideAPI);




// Driver Location Tracking API
const driverLocationAPI=require("./routes/driver_location_api");
app.use("/api", driverLocationAPI);




// Ride Completion Economy API
const completionAPI=require("./routes/completion_api");
app.use("/api", completionAPI);




// Notification Timeline API
const notificationAPI=require("./routes/notification_api");
app.use("/api", notificationAPI);




// Live Ride State API
const rideStateAPI=require("./routes/ride_state_api");
app.use("/api", rideStateAPI);




// Ride Orchestrator API
const orchestratorAPI=require("./routes/orchestrator_api");
app.use("/api", orchestratorAPI);




// Driver Intelligence API
const driverIntelligenceAPI=require("./routes/driver_intelligence_api");
app.use("/api", driverIntelligenceAPI);




// Passenger Intelligence API
const passengerIntelligenceAPI=require("./routes/passenger_intelligence_api");
app.use("/api", passengerIntelligenceAPI);


// ── CATCH-ALL → serve index.html (SPA routing) ───────────────
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── START ─────────────────────────────────────────────────────

app.listen(PORT, function () {
  console.log('🚕 CabLink backend running on http://localhost:' + PORT);
  console.log('   Health: http://localhost:' + PORT + '/api/health');
});

module.exports = app;
