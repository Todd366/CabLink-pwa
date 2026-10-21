const test = require("node:test");
const assert = require("node:assert");
const { splitPlate } = require("../backend/services/vehicle_service");

test("number plates are separated from the car description", () => {
    assert.deepEqual(splitPlate("Toyota Corolla B 123 ABC"), { makeModel: "Toyota Corolla", plate: "B 123 ABC" });
    assert.deepEqual(splitPlate("Nissan Note B222BBB"), { makeModel: "Nissan Note", plate: "B 222 BBB" });
    assert.deepEqual(splitPlate("Honda Fit"), { makeModel: "Honda Fit", plate: null });
    assert.deepEqual(splitPlate(""), { makeModel: "Not specified", plate: null });
});
