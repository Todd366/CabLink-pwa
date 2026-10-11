const test = require("node:test");
const assert = require("node:assert");
const { calcFare } = require("../backend/pricing/fare");

test("minimum fare applies to very short trips", () => assert.equal(calcFare({ vehicle: "standard", distanceKm: 1 }).total, 15));
test("fare grows with distance", () => assert.ok(calcFare({ distanceKm: 30 }).total > calcFare({ distanceKm: 10 }).total));
test("each stop adds the stop fee, capped at three", () => {
    const base = calcFare({ distanceKm: 10 }).total;
    assert.equal(calcFare({ distanceKm: 10, stops: ["a", "b"] }).total, base + 10);
    assert.equal(calcFare({ distanceKm: 10, stops: ["a", "b", "c", "d", "e"] }).total, base + 15);
});
test("hostile input cannot produce negative or absurd fares", () => {
    assert.equal(calcFare({ distanceKm: -50 }).total, 15);
    assert.ok(calcFare({ distanceKm: 1e9 }).total < 20000);
});
