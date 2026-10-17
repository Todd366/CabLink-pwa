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
const { splitFare } = require("../pricing/fare");
const feeOf = r => (Number.isFinite(Number(r.platformFee)) ? Number(r.platformFee) : splitFare(r.fare, r.taskType).platformFee);

// What each driver owes CabLink: fees on completed rides minus recorded payments.
function balances(rides, settlements = []) {
    const by = {};
    for (const r of rides) {
        const id = r.driverAccountId || r.driverId;
        if (r.status !== "COMPLETED" || !id) continue;
        const d = by[id] || (by[id] = { driverId: id, name: r.driverName || "Driver", rides: 0, fees: 0, settled: 0 });
        d.rides += 1; d.fees += feeOf(r);
    }
    for (const s of settlements) { const d = by[s.driverId] || (by[s.driverId] = { driverId: s.driverId, name: s.driverName || "Driver", rides: 0, fees: 0, settled: 0 }); d.settled += Number(s.amount) || 0; }
    return Object.values(by).map(d => ({ ...d, owed: Math.round((d.fees - d.settled) * 100) / 100 })).sort((a, b) => b.owed - a.owed);
}

// Pilot health: volume, completion, how long riders wait, money.
function metrics(rides, now = Date.now()) {
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now - i * DAY).toISOString().slice(0, 10); days.push({ date: d, requested: 0, completed: 0, cancelled: 0 }); }
    const idx = Object.fromEntries(days.map((d, i) => [d.date, i]));
    const week = rides.filter(r => now - new Date(r.createdAt) < 7 * DAY);
    for (const r of week) { const d = days[idx[new Date(r.createdAt).toISOString().slice(0, 10)]]; if (!d) continue; d.requested++; if (r.status === "COMPLETED") d.completed++; if (r.status === "CANCELLED") d.cancelled++; }
    const done = week.filter(r => r.status === "COMPLETED");
    const stale = r => r.status === "MATCHING" && now - new Date(r.createdAt) > 45 * 60000;
    const resolved = week.filter(r => ["COMPLETED", "CANCELLED"].includes(r.status) || stale(r));
    const waits = week.filter(r => r.acceptedAt).map(r => (new Date(r.acceptedAt) - new Date(r.createdAt)) / 60000).filter(m => m >= 0 && m < 600);
    const round1 = n => Math.round(n * 10) / 10;
    return {
        days,
        week: { requested: week.length, completed: done.length, cancelled: week.filter(r => r.status === "CANCELLED").length, unanswered: week.filter(stale).length },
        completionRate: resolved.length ? Math.round(100 * done.length / resolved.length) : null,
        avgWaitMin: waits.length ? round1(waits.reduce((a, b) => a + b, 0) / waits.length) : null,
        avgFare: done.length ? Math.round(done.reduce((a, r) => a + (Number(r.fare) || 0), 0) / done.length) : null,
        grossFares: Math.round(done.reduce((a, r) => a + (Number(r.fare) || 0), 0)),
        platformFees: Math.round(done.reduce((a, r) => a + feeOf(r), 0)),
        openNow: rides.filter(r => r.status === "MATCHING" && !stale(r)).length,
        activeNow: rides.filter(r => ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"].includes(r.status)).length
    };
}

module.exports = { leaderboard, hotspots, placeOf, firstNameInitial, balances, metrics };
