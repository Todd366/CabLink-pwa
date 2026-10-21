// Pure rules about when a ride request is still worth showing to drivers.
const MIN = 60000;

// App rides expire quickly; external deliveries (Digital Mall) may wait
// longer for a driver because the shop and customer are not watching a screen.
const staleMs = ride => (ride && ride.source === "digital_mall" ? 6 * 60 * MIN : 45 * MIN);

const isStale = (ride, now = Date.now()) => now - new Date(ride.createdAt).getTime() > staleMs(ride);

// Open for drivers: waiting for a driver, not stale, and either a known
// distance or an external delivery whose distance could not be worked out.
function isOpenForDrivers(ride, now = Date.now()) {
    if (ride.status !== "MATCHING" || isStale(ride, now)) return false;
    return Number(ride.distanceKm) > 0 || ride.source === "digital_mall";
}

module.exports = { staleMs, isStale, isOpenForDrivers };

// A rider may only have one live request or trip at a time; a driver one job.
const RIDER_ACTIVE = ["REQUESTED", "MATCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"];
const DRIVER_ACTIVE = ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"];
const isActiveForRider = (ride, now = Date.now()) => RIDER_ACTIVE.includes(ride.status) && !(ride.status === "MATCHING" && isStale(ride, now));
const isActiveForDriver = ride => DRIVER_ACTIVE.includes(ride.status);

// A driver who accepted but never reached the pickup in this long is released.
const ASSIGN_TIMEOUT_MS = (Number(process.env.ASSIGN_TIMEOUT_MIN) || 30) * MIN;
const isNoShow = (ride, now = Date.now()) => ride.status === "DRIVER_ASSIGNED" && ride.acceptedAt && now - new Date(ride.acceptedAt).getTime() > ASSIGN_TIMEOUT_MS;

// Non-admins may only cancel before the passenger is in the car.
const PRE_PICKUP = ["REQUESTED", "MATCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVED"];

Object.assign(module.exports, { isActiveForRider, isActiveForDriver, isNoShow, PRE_PICKUP, ASSIGN_TIMEOUT_MS });
