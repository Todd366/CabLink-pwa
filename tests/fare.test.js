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

const { splitFare } = require("../backend/pricing/fare");
test("delivery follows the BSTM rule: P20 + P5/km, 80% to the driver", () => {
    assert.equal(calcFare({ distanceKm: 10, taskType: "delivery" }).total, 70);
    assert.deepEqual(splitFare(70, "delivery"), { driverEarns: 56, platformFee: 14 });
    const r = splitFare(100, "ride"); assert.ok(r.driverEarns > 85 && r.driverEarns + r.platformFee === 100);
});
