const test = require("node:test");
const assert = require("node:assert");
const { leaderboard, hotspots, placeOf } = require("../backend/services/community_stats");

const now = Date.parse("2026-10-13T12:00:00Z");
const ride = (o) => Object.assign({ status: "COMPLETED", createdAt: "2026-10-12T10:00:00Z", distanceKm: 5, pickup: "Mochudi" }, o);

test("leaderboard ranks by completed rides and hides full names", () => {
    const rides = [ride({ driverId: "A", driverName: "Todd Mosanako", rating: 5 }), ride({ driverId: "A", driverName: "Todd Mosanako", rating: 4 }), ride({ driverId: "B", driverName: "Kabo Seretse" }),
        ride({ driverId: "C", driverName: "Old", createdAt: "2026-07-01T00:00:00Z" }), ride({ driverId: "D", status: "CANCELLED" })];
    const lb = leaderboard(rides, now);
    assert.deepEqual(lb.map(d => d.driverId), ["A", "B"]);
    assert.equal(lb[0].name, "Todd M."); assert.equal(lb[0].rating, 4.5); assert.equal(lb[1].rating, null);
});
test("hotspots count open requests and group pickup places", () => {
    const rides = [ride({ status: "MATCHING", createdAt: "2026-10-13T11:50:00Z", pickup: "My location, near Mochudi (-24.38000,26.15000)" }), ride({ pickup: "Mochudi" }), ride({ pickup: "Palapye" }),
        ride({ status: "MATCHING", createdAt: "2026-10-01T00:00:00Z", pickup: "Ghost" }), ride({ status: "MATCHING", createdAt: "2026-10-13T11:55:00Z", distanceKm: 0, pickup: "Zero" })];
    const h = hotspots(rides, now);
    assert.equal(h.openRequests, 1);
    assert.equal(h.places[0].place, "Mochudi");
    assert.ok(!h.places.some(p => p.place === "Ghost" || p.place === "Zero"));
});
test("placeOf strips coordinates and the 'My location' prefix", () => assert.equal(placeOf("My location, near Kanye (-24.9,25.3)".replace("-24.9,25.3", "-24.90000,25.30000")), "Kanye"));

const { visibleTo } = require("../backend/services/announcement_service");
test("announcements are filtered by audience, expiry and retirement", () => {
    const n = Date.parse("2026-10-14T00:00:00Z");
    const a = (o) => Object.assign({ id: o.title, message: "m", createdAt: "2026-10-13T00:00:00Z", audience: "ALL" }, o);
    const list = [a({ title: "all" }), a({ title: "drivers", audience: "DRIVERS" }), a({ title: "riders", audience: "RIDERS" }), a({ title: "old", expiresAt: "2026-10-01T00:00:00Z" }), a({ title: "gone", active: false })];
    assert.deepEqual(visibleTo("APPROVED_DRIVER", list, n).map(x => x.title).sort(), ["all", "drivers"]);
    assert.deepEqual(visibleTo("PASSENGER", list, n).map(x => x.title).sort(), ["all", "riders"]);
});

const rules = require("../backend/services/ride_rules");
test("ride rules: stale app rides vanish, Digital Mall deliveries wait longer and need no distance", () => {
    const now = Date.parse("2026-10-14T12:00:00Z");
    const mk = (o) => Object.assign({ status: "MATCHING", createdAt: "2026-10-14T11:30:00Z", distanceKm: 5, source: "app" }, o);
    assert.equal(rules.isOpenForDrivers(mk({}), now), true);
    assert.equal(rules.isOpenForDrivers(mk({ createdAt: "2026-10-14T10:00:00Z" }), now), false);
    assert.equal(rules.isOpenForDrivers(mk({ distanceKm: 0 }), now), false);
    assert.equal(rules.isOpenForDrivers(mk({ source: "digital_mall", distanceKm: 0, createdAt: "2026-10-14T09:00:00Z" }), now), true);
    assert.equal(rules.isOpenForDrivers(mk({ status: "REQUESTED" }), now), false);
});

const { balances, metrics } = require("../backend/services/community_stats");
test("balances: fees owed = fees on completed rides minus payments recorded", () => {
    const rides = [ride({ driverId: "A", driverName: "Todd Mosanako", fare: 100 }), ride({ driverId: "A", fare: 100, platformFee: 10 }), ride({ driverId: "B", status: "CANCELLED", fare: 50 }), ride({ driverId: "A", taskType: "delivery", fare: 70 })];
    const b = balances(rides, [{ driverId: "A", amount: 5 }]);
    assert.equal(b.length, 1);
    assert.equal(b[0].rides, 3);
    assert.equal(b[0].fees, 11 + 10 + 14);       // P100 ride (P11), stored P10, delivery 20% of P70
    assert.equal(b[0].owed, 30);
});
test("metrics: completion rate, wait time and money", () => {
    const n = Date.parse("2026-10-14T12:00:00Z");
    const m = metrics([
        ride({ createdAt: "2026-10-14T09:00:00Z", fare: 100, acceptedAt: "2026-10-14T09:04:00Z" }),
        ride({ createdAt: "2026-10-13T09:00:00Z", status: "CANCELLED" }),
        ride({ createdAt: "2026-10-14T08:00:00Z", status: "MATCHING" }),
        ride({ createdAt: "2026-10-14T11:50:00Z", status: "MATCHING" })
    ], n);
    assert.equal(m.week.requested, 4); assert.equal(m.week.completed, 1); assert.equal(m.week.unanswered, 1);
    assert.equal(m.completionRate, 33); assert.equal(m.avgWaitMin, 4); assert.equal(m.openNow, 1); assert.equal(m.grossFares, 100);
    assert.equal(m.days.length, 7);
});

test("driver ETA is a sensible estimate", async () => {
    const { etaMinutes } = await import("../app/js/eta.js");
    assert.equal(etaMinutes({ lat: -24.65, lng: 25.91 }, { lat: -24.65, lng: 25.91 }), 1);
    const m = etaMinutes({ lat: -24.4, lng: 26.1 }, { lat: -24.65, lng: 25.91 });   // ~35 km apart
    assert.ok(m >= 40 && m <= 90, "got " + m);
    assert.equal(etaMinutes(null, { lat: 0, lng: 0 }), null);
});
