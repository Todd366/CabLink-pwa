const test = require("node:test");
const assert = require("node:assert");
const { calcFare } = require("../backend/pricing/fare");

test("browser fare estimate matches the server fare", async () => {
    const { estimateFare } = await import("../app/js/fare.js");
    for (const km of [0, 3, 25, 400])
        assert.equal(estimateFare({ vehicle: "standard", km, task: "delivery" }), calcFare({ vehicle: "standard", distanceKm: km, taskType: "delivery" }).total, "delivery " + km);
    for (const vehicle of ["standard", "premium", "xl"])
        for (const km of [0, 1, 4.5, 12, 39, 41, 120, 480, 1200])
            for (const stops of [0, 2])
                assert.equal(estimateFare({ vehicle, km, stops }), calcFare({ vehicle, distanceKm: km, stops: new Array(stops).fill("x") }).total, vehicle + " " + km);
});
