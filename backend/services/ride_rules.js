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
