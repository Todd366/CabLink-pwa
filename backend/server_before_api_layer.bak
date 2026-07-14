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
