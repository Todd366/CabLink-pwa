const rideRepository = require("../canonical/ride_repository");
const eventService = require("./event_service");

// Every number here is computed directly from real stored records.
// If there isn't enough data yet, this says so explicitly rather
// than padding out a confident-looking dashboard with noise —
// that's the difference between real analysis and decoration.

const MIN_SAMPLE_SIZE = 5;

function hourOf(isoString) {
    if (!isoString) return null;
    return new Date(isoString).getHours();
}

function topEntries(counts, limit) {
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key, count]) => ({ key, count }));
}

async function computeInsights() {
    const [rides, events] = await Promise.all([
        rideRepository.all(),
        eventService.listEvents()
    ]);

    const totalRides = rides.length;
    const completed = rides.filter(r => r.status === "COMPLETED");
    const cancelled = rides.filter(r => r.status === "CANCELLED");
    const completionRate = totalRides > 0
        ? Math.round((completed.length / totalRides) * 1000) / 10
        : null;

    // Peak request hours — real histogram from actual RIDE_CREATED
    // timestamps, not a guessed "rush hour" assumption.
    const hourCounts = {};
    rides.forEach(r => {
        const h = hourOf(r.createdAt);
        if (h !== null) hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHours = topEntries(hourCounts, 3)
        .map(e => ({ hour: Number(e.key), requests: e.count }));

    // Most common pickup/dropoff — actual frequency counts.
    const pickupCounts = {};
    const dropoffCounts = {};
    rides.forEach(r => {
        if (r.pickup) pickupCounts[r.pickup] = (pickupCounts[r.pickup] || 0) + 1;
        if (r.dropoff) dropoffCounts[r.dropoff] = (dropoffCounts[r.dropoff] || 0) + 1;
    });
    const topPickups = topEntries(pickupCounts, 5).map(e => ({ location: e.key, count: e.count }));
    const topDropoffs = topEntries(dropoffCounts, 5).map(e => ({ location: e.key, count: e.count }));

    // Average time from RIDE_CREATED to DRIVER_ASSIGNED — read from
    // the real event log, paired by rideId.
    const createdAtByRide = {};
    const assignedAtByRide = {};
    events.forEach(e => {
        if (e.type === "RIDE_CREATED" && e.rideId) createdAtByRide[e.rideId] = e.createdAt;
        if (e.type === "DRIVER_ASSIGNED" && e.rideId) assignedAtByRide[e.rideId] = e.createdAt;
    });
    const acceptanceDurationsSec = Object.keys(assignedAtByRide)
        .filter(id => createdAtByRide[id])
        .map(id => (new Date(assignedAtByRide[id]) - new Date(createdAtByRide[id])) / 1000)
        .filter(sec => sec >= 0);
    const avgAcceptanceSeconds = acceptanceDurationsSec.length > 0
        ? Math.round(acceptanceDurationsSec.reduce((a, b) => a + b, 0) / acceptanceDurationsSec.length)
        : null;

    const incidentEvents = events.filter(e => e.type === "INCIDENT_CREATED");

    return {
        sampleSize: totalRides,
        hasEnoughData: totalRides >= MIN_SAMPLE_SIZE,
        minSampleSize: MIN_SAMPLE_SIZE,

        totalRides,
        completedRides: completed.length,
        cancelledRides: cancelled.length,
        completionRatePercent: completionRate,

        avgAcceptanceSeconds,
        acceptanceSampleSize: acceptanceDurationsSec.length,

        peakHours,
        topPickups,
        topDropoffs,

        totalIncidents: incidentEvents.length,

        computedAt: new Date().toISOString()
    };
}

module.exports = { computeInsights };
