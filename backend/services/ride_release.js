// Puts a ride back in front of drivers when the assigned driver cancels or
// never shows up, instead of killing the rider's request.
const repository = require("../canonical/ride_repository");
const push = require("./push_service");

async function release(ride, reason) {
    const declinedBy = Array.from(new Set([...(ride.declinedBy || []), ride.driverId, ride.driverAccountId].filter(Boolean)));
    const updated = await repository.update(ride.id, {
        status: "MATCHING", driverId: null, driverAccountId: null, driverName: null, assignedVehicle: null,
        acceptedAt: null, declinedBy, releasedAt: new Date().toISOString(), releaseReason: reason || null
    });
    if (ride.passenger) {
        push.sendToAccount(ride.passenger, { title: "Finding you another driver", body: reason || "Your driver can no longer take this ride", tag: "cablink-ride-" + ride.id, data: { rideId: ride.id, type: "RELEASED" } }).catch(() => {});
    }
    push.sendToOnlineDrivers({ title: "Ride available again", body: "A passenger is waiting for a driver", tag: "cablink-open-" + ride.id }).catch(() => {});
    return updated;
}
module.exports = { release };
