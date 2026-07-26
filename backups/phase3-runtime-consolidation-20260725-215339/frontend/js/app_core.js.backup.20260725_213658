/* app_core.js - CabLink Complete Hailing App Core
   Handles: GPS, Distance, Fare, Booking, Matching, Status, Notifications
*/
'use strict';

// ── GABORONE LOCATIONS DATABASE ─────────────────────────
window.GABORONE_PLACES = [
  {name:'BSTM HQ, Mmopane',         lat:-24.5765, lng:25.8234},
  {name:'Game City Mall',            lat:-24.6282, lng:25.9056},
  {name:'Main Mall, CBD',            lat:-24.6559, lng:25.9062},
  {name:'Airport Junction Mall',     lat:-24.6024, lng:25.9156},
  {name:'Riverwalk Mall',            lat:-24.6448, lng:25.9271},
  {name:'Molapo Crossing',           lat:-24.6731, lng:25.8847},
  {name:'BBS Mall',                  lat:-24.6554, lng:25.9003},
  {name:'Gaborone Bus Rank',         lat:-24.6548, lng:25.9097},
  {name:'Princess Marina Hospital',  lat:-24.6543, lng:25.9183},
  {name:'University of Botswana',    lat:-24.6573, lng:25.9344},
  {name:'Gaborone Station',          lat:-24.6559, lng:25.9097},
  {name:'Fairground',                lat:-24.6739, lng:25.9053},
  {name:'Kgale Hill',                lat:-24.6891, lng:25.8967},
  {name:'Phakalane',                 lat:-24.5534, lng:25.9123},
  {name:'Tlokweng',                  lat:-24.6448, lng:25.9657},
  {name:'Broadhurst',                lat:-24.6812, lng:25.9023},
  {name:'Block 3',                   lat:-24.6634, lng:25.9187},
  {name:'Block 8',                   lat:-24.6523, lng:25.9312},
  {name:'Lobatse Rd, Gaborone',      lat:-24.7012, lng:25.8934},
  {name:'Maun Bus Stop, CBD',        lat:-24.6545, lng:25.9078},
  {name:'Segoditshane',              lat:-24.6234, lng:25.8723},
  {name:'Mogoditshane',              lat:-24.6012, lng:25.8456},
  {name:'Gaborone Private Hospital', lat:-24.6612, lng:25.9234},
  {name:'Botswana Craft',            lat:-24.6589, lng:25.9123},
  {name:'Three Chiefs Monument',     lat:-24.6534, lng:25.9089},
];

// ── HAVERSINE DISTANCE CALCULATOR ───────────────────────
// No API needed — pure math
window.haversineKm = function(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ── LOOKUP PLACE COORDS ──────────────────────────────────
window.getPlaceCoords = function(name) {
  var n = (name||'').toLowerCase();
  for (var i=0; i<window.GABORONE_PLACES.length; i++) {
    var p = window.GABORONE_PLACES[i];
    if (p.name.toLowerCase().indexOf(n) !== -1 ||
        n.indexOf(p.name.toLowerCase().split(',')[0]) !== -1) {
      return {lat: p.lat, lng: p.lng, name: p.name};
    }
  }
  return null;
};

// ── GET REAL DISTANCE BETWEEN INPUTS ───────────────────
window.getRideDistance = function() {
  var from = (document.getElementById('pickup')||{}).value||'';
  var to   = (document.getElementById('dropoff')||{}).value||'';
  var p1 = window.getPlaceCoords(from);
  var p2 = window.getPlaceCoords(to);
  if (p1 && p2) {
    var km = window.haversineKm(p1.lat, p1.lng, p2.lat, p2.lng);
    // Add 20% for road routing vs straight line
    km = km * 1.2;
    window._estKm = Math.max(km, 1);
    return window._estKm;
  }
  return window._estKm || 5;
};

// ── AUTOCOMPLETE FOR LOCATION INPUTS ────────────────────
window.setupLocationAutocomplete = function(inputId) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var dropId = inputId + '_drop';

  input.addEventListener('input', function() {
    var val = input.value.toLowerCase().trim();
    var old = document.getElementById(dropId);
    if (old) old.remove();
    if (val.length < 2) return;

    var matches = window.GABORONE_PLACES.filter(function(p) {
      return p.name.toLowerCase().indexOf(val) !== -1;
    }).slice(0, 5);

    if (!matches.length) return;

    var drop = document.createElement('div');
    drop.id = dropId;
    drop.style.cssText = [
      'position:absolute;left:0;right:0;z-index:9999;',
      'background:#16213e;border:1px solid #2a2a3e;',
      'border-radius:0 0 10px 10px;overflow:hidden;',
      'box-shadow:0 8px 24px rgba(0,0,0,0.5);'
    ].join('');

    matches.forEach(function(place) {
      var item = document.createElement('div');
      item.style.cssText = [
        'padding:12px 16px;cursor:pointer;font-size:13px;',
        'color:#f0f0f5;border-bottom:1px solid #2a2a3e;',
        'display:flex;align-items:center;gap:10px;'
      ].join('');
      item.innerHTML = '<span>📍</span><span>' + place.name + '</span>';
      item.onmousedown = function(e) {
        e.preventDefault();
        input.value = place.name;
        drop.remove();
        // Update fare with real distance
        var km = window.getRideDistance();
        if (typeof window.updateFareDisplay === 'function') {
          window.updateFareDisplay(km);
        }
        // Update ETA display
        var eta = Math.round(km / 0.45) + ' min';
        var etaEl = document.getElementById('rideETA');
        if (etaEl) etaEl.textContent = 'ETA ~' + eta;
      };
      item.onmouseover = function(){ item.style.background='#0f172a'; };
      item.onmouseout  = function(){ item.style.background=''; };
      drop.appendChild(item);
    });

    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(drop);
  });

  input.addEventListener('blur', function() {
    setTimeout(function() {
      var d = document.getElementById(dropId);
      if (d) d.remove();
      // Recalc fare when user finishes typing
      var km = window.getRideDistance();
      if (typeof window.updateFareDisplay === 'function') {
        window.updateFareDisplay(km);
      }
    }, 200);
  });
};

// ── GEOLOCATION ─────────────────────────────────────────
window.detectUserLocation = function() {
  var btn = document.querySelector('[onclick*="detectLocation"]') ||
            document.querySelector('[title*="location"]');
  if (btn) btn.textContent = '⏳';

  if (!navigator.geolocation) {
    toast('Geolocation not supported — type your location', 'warning');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;
      // Find nearest known place
      var nearest = null, minDist = 999;
      window.GABORONE_PLACES.forEach(function(p) {
        var d = window.haversineKm(lat, lng, p.lat, p.lng);
        if (d < minDist) { minDist = d; nearest = p; }
      });
      var inp = document.getElementById('pickup');
      if (inp) {
        inp.value = nearest ? nearest.name : ('GPS: ' + lat.toFixed(4) + ', ' + lng.toFixed(4));
        window._userLat = lat; window._userLng = lng;
        var km = window.getRideDistance();
        if (typeof window.updateFareDisplay === 'function') window.updateFareDisplay(km);
        toast('Location detected: ' + (nearest ? nearest.name : 'GPS coords'), 'success');
      }
      if (btn) btn.textContent = '📍';
    },
    function(err) {
      var msgs = {1:'Location permission denied',2:'Location unavailable',3:'Location timeout'};
      toast(msgs[err.code]||'Location error', 'warning');
      if (btn) btn.textContent = '📍';
    },
    {timeout:8000, maximumAge:60000}
  );
};

// ── BROWSER PUSH NOTIFICATIONS ──────────────────────────
window.requestNotificationPermission = function() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

window.sendNotification = function(title, body, icon) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body: body,
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'cablink-ride',
    renotify: true,
  });
};

// ── LEAFLET MAP ─────────────────────────────────────────
window.initMap = function() {
  var mapEl = document.getElementById('mapSvg');
  if (!mapEl) return;

  // Replace SVG with Leaflet map container
  var parent = mapEl.parentElement;
  parent.innerHTML = '<div id="leaflet-map" style="width:100%;height:200px;border-radius:12px;overflow:hidden;"></div>';

  // Load Leaflet CSS
  if (!document.getElementById('leaflet-css')) {
    var link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Load Leaflet JS
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function() {
    var gaborone = [-24.6541, 25.9087];
    var map = L.map('leaflet-map', {
      center: gaborone, zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    window._map = map;
    window._markers = {};

    // Add default pickup/dropoff markers
    var greenIcon = L.divIcon({className:'',html:'<div style="font-size:24px;">📍</div>'});
    var redIcon   = L.divIcon({className:'',html:'<div style="font-size:24px;">🏁</div>'});

    window._markers.pickup  = L.marker(gaborone, {icon:greenIcon}).addTo(map);
    window._markers.dropoff = L.marker([-24.6282, 25.9056], {icon:redIcon}).addTo(map);

    // Draw route line
    window._routeLine = L.polyline([gaborone, [-24.6282,25.9056]], {
      color:'#f5c518', weight:3, dashArray:'8,4'
    }).addTo(map);

    // Show driver dots from backend
    window.updateMapDrivers();
  };
  document.head.appendChild(script);
};

window.updateMapDrivers = function() {
  if (!window._map) return;
  fetch('/api/drivers/online')
    .then(function(r){ return r.json(); })
    .then(function(d) {
      (d.drivers||[]).forEach(function(drv) {
        var key = 'drv_' + drv.id;
        var dIcon = L.divIcon({className:'',html:'<div style="font-size:18px;">🚗</div>'});
        if (window._markers[key]) {
          window._markers[key].setLatLng([drv.lat, drv.lng]);
        } else if (window._map) {
          window._markers[key] = L.marker([drv.lat||(-24.65+Math.random()*0.05)], {icon:dIcon}).addTo(window._map);
        }
      });
      var el = document.getElementById('driverCount');
      if (el) el.textContent = d.count||0;
    })
    .catch(function(){});
};

window.updateMapRoute = function(from, to) {
  if (!window._map || !window._markers) return;
  var p1 = window.getPlaceCoords(from);
  var p2 = window.getPlaceCoords(to);
  if (!p1 || !p2) return;
  window._markers.pickup.setLatLng([p1.lat, p1.lng]);
  window._markers.dropoff.setLatLng([p2.lat, p2.lng]);
  if (window._routeLine) window._routeLine.setLatLngs([[p1.lat,p1.lng],[p2.lat,p2.lng]]);
  window._map.fitBounds([[p1.lat,p1.lng],[p2.lat,p2.lng]], {padding:[30,30]});
};

window.updateMapCar = function(lat, lng) {
  if (!window._map) return;
  if (!window._markers.car) {
    var carIcon = L.divIcon({className:'',html:'<div style="font-size:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🚕</div>'});
    window._markers.car = L.marker([lat,lng],{icon:carIcon}).addTo(window._map);
  } else {
    window._markers.car.setLatLng([lat,lng]);
  }
};

// ── COMPLETE BOOKING FLOW ───────────────────────────────
window.requestRide = function() {
  var from = (document.getElementById('pickup')||{}).value||'';
  var to   = (document.getElementById('dropoff')||{}).value||'';

  from = from.trim(); to = to.trim();

  if (!from) { toast('Enter your pickup location', 'warning'); document.getElementById('pickup').focus(); return; }
  if (!to)   { toast('Enter your drop-off location', 'warning'); document.getElementById('dropoff').focus(); return; }
  if (!navigator.onLine) { toast('You are offline — ride queued', 'warning'); return; }

  var km   = window.getRideDistance();
  var type = (window.STATE && window.STATE.selectedRideType) || 'standard';
  var fare = window._lastFare ? window._lastFare.total : 20;

  var payload = {
    pickup:  from,
    dropoff: to,
    vehicle: type,
    fare:    fare,
    distanceKm: +km.toFixed(2),
    wallet:  (window.STATE && window.STATE.wallet) || null,
    notes:   (document.getElementById('rideNotes')||{}).value||'',
  };

  // Update map with real route
  window.updateMapRoute(from, to);

  // Show requesting state
  var bookBtn = document.getElementById('bookBtn');
  if (bookBtn) { bookBtn.disabled = true; bookBtn.textContent = '🔍 Finding driver...'; }

  var statusEl = document.getElementById('statusLabel');
  if (statusEl) statusEl.textContent = '🔍 Requesting ride...';

  // Show ride ID row
  document.getElementById('rideIdRow').style.display = 'flex';
  document.getElementById('cancelBtn').style.display = 'block';

  fetch('/api/rides', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(function(r){ return r.json(); })
  .then(function(data) {
    if (!data.success) throw new Error(data.error || 'Booking failed');

    var ride = data.ride;
    document.getElementById('rideId').textContent = ride.id;
    if (window.STATE) { window.STATE.rideId = ride.id; window.STATE.inRide = true; }

    toast('Ride requested! Looking for drivers...', 'success');
    window.sendNotification('CabLink', 'Finding a driver near you...', '');
    haptic && haptic();

    // Start polling for status
    if (window.CL_RIDE) window.CL_RIDE.start(ride.id);

    // Show chat section
    document.getElementById('chatSection').style.display = 'block';

  })
  .catch(function(err) {
    toast('Booking failed: ' + err.message, 'error');
    if (bookBtn) { bookBtn.disabled = false; bookBtn.textContent = 'Request Ride · Earn 1 THB'; }
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('rideIdRow').style.display = 'none';
  });
};

// Override bookRide globally
window.bookRide = window.requestRide;

// ── RATING SUBMISSION TO BACKEND ────────────────────────
window.submitRatingToBackend = function(rideId, rating, comment) {
  if (!rideId) return;
  fetch('/api/rides/' + rideId, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({rating: rating, comment: comment, status: 'RATED'})
  }).catch(function(){});
};

// ── DRIVER ONLINE STATUS WITH REAL LOCATION ─────────────
var _origToggle = window.toggleDriverMode;
window.toggleDriverMode = function() {
  if (!window.STATE) window.STATE = {};
  window.STATE.driverOnline = !window.STATE.driverOnline;

  var btn = document.getElementById('driverModeBtn');
  if (window.STATE.driverOnline) {
    if (btn) { btn.textContent = '🔴 Go Offline'; btn.className = 'btn btn-danger btn-sm'; }
    toast('You are online — receiving ride requests', 'success');
    window.requestNotificationPermission();

    // Send real location to backend
    navigator.geolocation && navigator.geolocation.getCurrentPosition(
      function(pos) {
        fetch('/api/drivers/online', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            driverId: (window.STATE.wallet||'driver-'+Date.now()),
            vehicle: window.STATE.selectedVehicle || 'standard',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            wallet: window.STATE.wallet || null
          })
        })
        .then(function(r){ return r.json(); })
        .then(function(d){
          if (d.pendingRides > 0) toast(d.pendingRides + ' ride(s) waiting!', 'warning');
          window.sendNotification('CabLink Driver', 'You are online. Waiting for rides...', '');
        })
        .catch(function(){
          // No location — still go online
          fetch('/api/drivers/online', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({driverId:(window.STATE.wallet||'drv-'+Date.now()),vehicle:'standard'})
          }).catch(function(){});
        });
      },
      function() {
        fetch('/api/drivers/online', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({driverId:(window.STATE.wallet||'drv-'+Date.now()),vehicle:'standard'})
        }).catch(function(){});
      }
    );

    // Poll for ride requests every 4 seconds
    clearInterval(window._driverPoll);
    window._driverPoll = setInterval(function() {
      if (!window.STATE.driverOnline) { clearInterval(window._driverPoll); return; }
      fetch('/api/rides')
        .then(function(r){ return r.json(); })
        .then(function(d) {
          var pending = (d.rides||[]).filter(function(r){ return r.status === 'REQUESTED' || r.status === 'searching'; });
          if (pending.length > 0) {
            window.showDriverRequest(pending[0]);
          }
          if (typeof updateDriverUI === 'function') updateDriverUI();
        }).catch(function(){});
    }, 4000);

  } else {
    if (btn) { btn.textContent = '🟢 Go Online'; btn.className = 'btn btn-outline btn-sm'; }
    clearInterval(window._driverPoll);
    toast('You are offline', 'warning');
    fetch('/api/drivers/offline', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({wallet: window.STATE.wallet || null})
    }).catch(function(){});
  }
  if (typeof updateDriverUI === 'function') updateDriverUI();
};

// ── SHOW INCOMING RIDE REQUEST TO DRIVER ─────────────────
var _shownRequests = {};
window.showDriverRequest = function(ride) {
  if (_shownRequests[ride.id]) return;
  _shownRequests[ride.id] = true;

  if (window.STATE) window.STATE.driverRequests = (window.STATE.driverRequests||0) + 1;
  if (typeof updateDriverUI === 'function') updateDriverUI();

  var container = document.getElementById('driverRequests');
  if (!container) return;
  var empty = container.querySelector('.empty-text') || container.querySelector('[style*="color:var(--muted"]');
  if (empty) container.innerHTML = '';

  var fare = ride.fare || 20;
  var km   = ride.distanceKm || '?';

  var card = document.createElement('div');
  card.className = 'request-card pending';
  card.id = 'req_' + ride.id;
  card.style.cssText = 'background:#12121d;border:1px solid #2a2a3e;border-radius:12px;padding:14px;margin-bottom:10px;animation:slideIn .3s ease;';
  card.innerHTML = [
    '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">',
      '<strong style="color:#f5c518;">' + ride.id + '</strong>',
      '<span style="color:#f5c518;font-weight:700;font-size:16px;">' + fare + ' BWP</span>',
    '</div>',
    '<div style="font-size:12px;color:#888;margin-bottom:4px;">📍 ' + (ride.pickup||'?') + '</div>',
    '<div style="font-size:12px;color:#888;margin-bottom:8px;">🏁 ' + (ride.dropoff||'?') + ' · ' + km + ' km</div>',
    '<div id="rtimer_'+ride.id+'" style="height:3px;background:#2a2a3e;border-radius:2px;margin-bottom:10px;overflow:hidden;">',
      '<div style="height:100%;background:#f5c518;border-radius:2px;animation:timerDrain 20s linear forwards;"></div>',
    '</div>',
    '<div style="display:flex;gap:8px;">',
      '<button onclick="window.acceptRideRequest(\''+ride.id+'\','+fare+')" style="flex:1;padding:12px;background:#22d672;color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;">✓ Accept</button>',
      '<button onclick="window.declineRideRequest(\''+ride.id+'\')" style="flex:1;padding:12px;background:transparent;color:#888;border:1px solid #2a2a3e;border-radius:10px;cursor:pointer;">✗ Decline</button>',
    '</div>',
  ].join('');

  container.insertBefore(card, container.firstChild);

  // Auto-decline after 20s
  setTimeout(function() {
    var c = document.getElementById('req_' + ride.id);
    if (c) { c.remove(); toast('Request expired', 'warning'); }
  }, 20000);

  window.sendNotification('🚗 New Ride Request!',
    ride.pickup + ' → ' + ride.dropoff + ' · ' + fare + ' BWP', '');
  if (typeof haptic === 'function') haptic();
};

window.acceptRideRequest = function(rideId, fare) {
  var card = document.getElementById('req_' + rideId);
  if (card) card.remove();
  fetch('/api/rides/' + rideId, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      status: 'DRIVER_ASSIGNED',
      driverId: window.STATE && window.STATE.wallet || 'driver-anon',
      driverName: 'Driver'
    })
  }).then(function(){ toast('Ride accepted! Head to pickup ✓', 'success'); })
  .catch(function(){ toast('Accepted (offline)', 'success'); });
  if (window.STATE) { window.STATE.driverAccepted = (window.STATE.driverAccepted||0)+1; window.STATE.driverThb = (window.STATE.driverThb||0)+1; }
  if (typeof updateDriverUI === 'function') updateDriverUI();
};

window.declineRideRequest = function(rideId) {
  var card = document.getElementById('req_' + rideId);
  if (card) card.remove();
  toast('Request declined', 'warning');
};

// ── INIT ON LOAD ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Setup autocomplete
  window.setupLocationAutocomplete('pickup');
  window.setupLocationAutocomplete('dropoff');

  // Init map
  setTimeout(window.initMap, 500);

  // Update driver count
  setInterval(window.updateMapDrivers, 15000);

  // Request notification permission
  setTimeout(window.requestNotificationPermission, 3000);

  // Initial fare with 5km default
  setTimeout(function() {
    if (typeof window.updateFareDisplay === 'function') window.updateFareDisplay(5);
  }, 300);

  // Update fare when inputs change
  ['pickup','dropoff'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function() {
      var km = window.getRideDistance();
      if (typeof window.updateFareDisplay === 'function') window.updateFareDisplay(km);
      var from = (document.getElementById('pickup')||{}).value||'';
      var to   = (document.getElementById('dropoff')||{}).value||'';
      if (from && to) window.updateMapRoute(from, to);
    });
  });

  // Wire detect location button
  var locBtn = document.querySelector('[title="Use my location"]') ||
               document.querySelector('[onclick*="detectLocation"]');
  if (locBtn) locBtn.onclick = window.detectUserLocation;

  console.log('app_core.js loaded — CabLink full hailing engine');
});
