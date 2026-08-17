/* driver_accept_bridge.js
   Fixes: driver "Accept"/"Decline" buttons on incoming ride
   requests called `window.acceptRideRequest` and
   `window.declineRideRequest`, but neither was ever defined
   anywhere index.html actually loads — clicking Accept did
   nothing (silent console error). This wires them to the real
   canonical backend (PATCH /api/rides/:id/accept).
*/
'use strict';

window.acceptRideRequest = async function (rideId, fare) {
  var card = document.getElementById('req_' + rideId) || document.getElementById('req-' + rideId);

  var driverId =
    (window.STATE && window.STATE.driverId) ||
    localStorage.getItem('cablink_driver_id') ||
    localStorage.getItem('cl6_driverId') ||
    'driver-anon';

  var driverName =
    (window.STATE && window.STATE.driverName) ||
    localStorage.getItem('cablink_driver_name') ||
    'Driver';

  if (!rideId) {
    toast('Invalid ride request', 'error');
    return null;
  }

  try {
    var response = await fetch('/api/rides/' + encodeURIComponent(rideId) + '/accept', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: driverId, driverName: driverName })
    });

    var data = {};
    try { data = await response.json(); } catch (e) {}

    if (!response.ok || !data.success) {
      throw new Error(data.error || ('Ride acceptance failed with HTTP ' + response.status));
    }

    if (card) card.remove();

    var acceptedRide = data.ride || data;

    if (window.CABLINK_ACTIVE_RIDE && typeof window.CABLINK_ACTIVE_RIDE.set === 'function') {
      window.CABLINK_ACTIVE_RIDE.set(acceptedRide);
    }

    if (window.STATE) {
      window.STATE.driverAccepted = (window.STATE.driverAccepted || 0) + 1;
    }

    if (typeof updateDriverUI === 'function') updateDriverUI();

    toast('Ride accepted! Head to pickup ✓', 'success');

    return acceptedRide;

  } catch (error) {
    console.error('[CABLINK] Ride acceptance failed:', error);
    toast('Could not accept ride: ' + error.message, 'error');
    return null;
  }
};

window.declineRideRequest = function (rideId) {
  var card = document.getElementById('req_' + rideId) || document.getElementById('req-' + rideId);
  if (card) card.remove();
  toast('Request declined', 'warning');
};

console.log('CabLink driver accept/decline bridge active');
