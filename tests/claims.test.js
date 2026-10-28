const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { request, loadRealBackend } = require("./helpers/mini_express.js");

// A THB payout must happen exactly once per ride, even if the request is
// repeated or sent many times at the same instant.
test("simultaneous reward claims pay out exactly once", async () => {
    const be = loadRealBackend(path.join(__dirname, ".."));
    let ip = 1;
    const call = (tok, method, url, body, h = {}) => request(be.app, { method, url, body, headers: Object.assign(tok ? { authorization: "Bearer " + tok } : {}, h), ip: "4.4.4." + (ip++ % 200 + 1) });
    const reg = async (n, p) => { await call(null, "POST", "/api/auth/register", { name: n, phone: p, pin: "1234" }); return (await call(null, "POST", "/api/auth/login", { phone: p, pin: "1234" })).body; };
    const A = await reg("Admin", "70000001"); await call(A.token, "POST", "/api/admin/bootstrap", {}, { "x-admin-key": "e2e-admin-key-0123456789" });
    const R = await reg("Rider", "71000001"), D = await reg("Driver", "72000001");
    await call(D.token, "POST", "/api/drivers/apply", { license: "BW1", vehicle: "Toyota Corolla B 111 AAA" });
    const adm = (await call(null, "POST", "/api/auth/login", { phone: "70000001", pin: "1234" })).body.token;
    for (const a of (await call(adm, "GET", "/api/admin/driver-applications?status=PENDING")).body.applications) await call(adm, "POST", "/api/admin/driver-applications/" + a.id + "/approve", {});
    for (const v of (await call(adm, "GET", "/api/admin/vehicles")).body.vehicles) await call(adm, "PATCH", "/api/admin/vehicles/" + v.id, { verificationStatus: "VERIFIED" });
    const Dt = (await call(null, "POST", "/api/auth/login", { phone: "72000001", pin: "1234" })).body.token;
    await call(Dt, "POST", "/api/drivers/online", { lat: -24.6, lng: 25.9 });
    const ride = (await call(R.token, "POST", "/api/rides", { pickup: "Mochudi", dropoff: "Gaborone", vehicle: "standard", distanceKm: 40, paymentMethod: "cash" })).body.ride;
    await call(Dt, "PATCH", "/api/rides/" + ride.id + "/accept", {});
    for (const s of ["DRIVER_ARRIVED", "PICKED_UP", "STARTED"]) await call(Dt, "PATCH", "/api/rides/" + ride.id, { status: s });
    // completing twice at the same time must create one driver reward only
    await Promise.all([call(Dt, "PATCH", "/api/rides/" + ride.id + "/complete", {}), call(Dt, "PATCH", "/api/rides/" + ride.id + "/complete", {})]);

    const before = await call(R.token, "POST", "/api/rewards/claim-ride", { rideId: ride.id });
    assert.equal(before.body.status, "NO_WALLET", "claiming without a wallet must not use up the claim");
    await call(R.token, "PATCH", "/api/auth/wallet", { walletAddress: "0x" + "ab".repeat(20) });
    const results = await Promise.all([1, 2, 3, 4, 5, 6].map(() => call(R.token, "POST", "/api/rewards/claim-ride", { rideId: ride.id })));
    assert.equal(results.filter(r => r.body.created === true).length, 1, "exactly one claim may create a payout");

    const ledger = await require(be.dir + "/backend/services/ledger_store").loadLedger();
    assert.equal(ledger.transactions.filter(t => t.type === "RIDE_CLAIM" && t.rideId === ride.id).length, 1);
    assert.equal(ledger.transactions.filter(t => t.type === "THB_REWARD" && t.rideId === ride.id).length, 1, "one driver reward per ride");

    const mine = await call(R.token, "GET", "/api/rewards/mine");
    assert.equal(mine.status, 200);
    assert.equal(mine.body.hasWallet, true);
    assert.equal(mine.body.claimable.length, 0, "a claimed ride is no longer claimable");
    assert.equal(mine.body.ridesDone, 1);
    assert.ok(mine.body.streak >= 1);

    // Live trip link: valid link works without login, shows no phone numbers, forged link does not.
    const sh = await call(R.token, "POST", "/api/rides/" + ride.id + "/share");
    assert.equal(sh.status, 200);
    const q = new URLSearchParams(sh.body.path.split("?")[1]);
    const view = await call(null, "GET", "/api/track?r=" + encodeURIComponent(q.get("r")) + "&k=" + q.get("k"));
    assert.equal(view.status, 200);
    assert.ok(!JSON.stringify(view.body).match(/7\d{7}/), "public trip page must not contain phone numbers");
    const forged = await call(null, "GET", "/api/track?r=" + encodeURIComponent(ride.id) + "&k=" + "x".repeat(24));
    assert.equal(forged.status, 404);
    const other = await call(D.token, "POST", "/api/rides/" + ride.id + "/share");
    assert.equal(other.status, 404, "only the rider can create the link");
    be.restore();
});
