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
