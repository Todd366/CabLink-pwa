// Pure functions that turn ride history into driver-facing insights.
// Computed from the ride store (durable), not from local files.
const DAY = 864e5;
const placeOf = label => String(label || "").replace(/\s*\(-?\d+\.\d+,-?\d+\.\d+\)/, "").replace(/^My location,? ?(near )?/i, "").trim();
const firstNameInitial = name => {
    const parts = String(name || "Driver").trim().split(/\s+/);
    return parts[0] + (parts[1] ? " " + parts[1][0] + "." : "");
};

function leaderboard(rides, now = Date.now(), days = 30, limit = 10) {
    const by = {};
    for (const r of rides) {
        if (r.status !== "COMPLETED" || now - new Date(r.createdAt) > days * DAY) continue;
        const id = r.driverAccountId || r.driverId;
        if (!id) continue;
        const d = by[id] || (by[id] = { driverId: id, name: firstNameInitial(r.driverName), rides: 0, ratings: [] });
        d.rides += 1;
        if (Number(r.rating) > 0) d.ratings.push(Number(r.rating));
    }
    return Object.values(by)
        .map(d => ({ driverId: d.driverId, name: d.name, rides: d.rides, rating: d.ratings.length ? +(d.ratings.reduce((a, b) => a + b, 0) / d.ratings.length).toFixed(1) : null }))
        .sort((a, b) => b.rides - a.rides || (b.rating || 0) - (a.rating || 0))
        .slice(0, limit).map((d, i) => ({ rank: i + 1, ...d }));
}

// Where riders are asking for cars: open requests now + recent history.
function hotspots(rides, now = Date.now(), limit = 5) {
    const open = rides.filter(r => r.status === "MATCHING" && now - new Date(r.createdAt) < 45 * 60000 && Number(r.distanceKm) > 0);
    const recent = rides.filter(r => now - new Date(r.createdAt) < DAY && Number(r.distanceKm) > 0);
    const tally = {};
    for (const r of recent) { const p = placeOf(r.pickup); if (p) tally[p] = (tally[p] || 0) + (r.status === "MATCHING" ? 3 : 1); }
    const places = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([place, score]) => ({ place, score }));
    return { openRequests: open.length, places };
}
module.exports = { leaderboard, hotspots, placeOf, firstNameInitial };
