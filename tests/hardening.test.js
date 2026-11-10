// Regression tests for the launch-hardening fixes (completion bypass, wallet PIN, account deletion, fare floor, sessions).
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { request, loadRealBackend } = require("./helpers/mini_express.js");
const ADMINKEY = "e2e-admin-key-0123456789";
let ip = 1;

test("fare calculator never returns NaN for hostile vehicle names", () => {
  const { calcFare } = require("../backend/pricing/fare");
  for (const v of ["constructor", "__proto__", "toString", "hasOwnProperty", undefined, null, "x"]) {
    const t = calcFare({ distanceKm: 10, vehicle: v }).total;
    assert.ok(Number.isFinite(t) && t >= 15, "vehicle " + String(v) + " gave " + t);
  }
});

test("launch hardening: completion, wallet PIN, delete account, fare floor", async () => {
  const be = loadRealBackend(path.join(__dirname, ".."));
  const call = (tok, method, url, body, extra = {}) => request(be.app, { method, url, body, headers: Object.assign(tok ? { authorization: "Bearer " + tok } : {}, extra), ip: "6.6.6." + (ip++ % 200 + 1) });
  const reg = async (name, phone, pin = "1234") => { await call(null, "POST", "/api/auth/register", { name, phone, pin }); const l = await call(null, "POST", "/api/auth/login", { phone, pin }); return { tok: l.body.token, acc: l.body.account }; };

  const R = await reg("Hard Rider", "71100001");
  const D = await reg("Hard Driver", "72100001");
  await call(D.tok, "POST", "/api/drivers/apply", { license: "BW900", vehicle: "Toyota Corolla B 900 HHH" });
  const A = await reg("Hard Admin", "70100001");
  await call(A.tok, "POST", "/api/admin/bootstrap", {}, { "x-admin-key": ADMINKEY });
  const adminTok = (await call(null, "POST", "/api/auth/login", { phone: "70100001", pin: "1234" })).body.token;
  const apps = await call(adminTok, "GET", "/api/admin/driver-applications?status=PENDING");
  for (const a of apps.body.applications) await call(adminTok, "POST", "/api/admin/driver-applications/" + a.id + "/approve", {});
  const Dl = (await call(null, "POST", "/api/auth/login", { phone: "72100001", pin: "1234" })).body;
  for (const v of ((await call(adminTok, "GET", "/api/admin/vehicles")).body.vehicles || [])) await call(adminTok, "PATCH", "/api/admin/vehicles/" + v.id, { verificationStatus: "VERIFIED" });
  await call(Dl.token, "POST", "/api/drivers/online", { lat: -24.65, lng: 25.91 });

  // fare floor: a spoofed 1 km on a ~36 km trip is priced on the real straight-line distance
  const trip = { pickup: "A (-24.65,25.91)", dropoff: "B (-24.40,26.14)", vehicle: "standard", paymentMethod: "cash" };
  const honest = await call(R.tok, "POST", "/api/rides", { ...trip, distanceKm: 36 });
  assert.equal(honest.status, 201);
  await call(R.tok, "PATCH", "/api/rides/" + honest.body.ride.id, { status: "CANCELLED" });
  const spoofed = await call(R.tok, "POST", "/api/rides", { ...trip, distanceKm: 1 });
  assert.equal(spoofed.status, 201);
  assert.ok(spoofed.body.ride.fare >= honest.body.ride.fare * 0.9, "spoofed distance must not underprice the fare: " + spoofed.body.ride.fare + " vs " + honest.body.ride.fare);
  const ride = spoofed.body.ride;

  assert.equal((await call(Dl.token, "PATCH", "/api/rides/" + ride.id + "/accept", {})).status, 200);

  // driver cannot finish the trip (or plant a rating) through the generic PATCH
  const bypass = await call(Dl.token, "PATCH", "/api/rides/" + ride.id, { status: "COMPLETED", rating: 5, comment: "self" });
  assert.equal(bypass.status, 403, "generic PATCH must not complete a ride");
  const bypass2 = await call(Dl.token, "PATCH", "/api/rides/" + ride.id + "/state", { status: "COMPLETED" });
  assert.ok([403, 404].includes(bypass2.status), "state route must not complete a ride: " + bypass2.status);

  for (const st of ["DRIVER_ARRIVED", "PICKED_UP", "STARTED"]) assert.equal((await call(Dl.token, "PATCH", "/api/rides/" + ride.id, { status: st })).status, 200, "step " + st);
  // after STARTED the generic PATCH still cannot complete
  assert.equal((await call(Dl.token, "PATCH", "/api/rides/" + ride.id, { status: "COMPLETED", rating: 5 })).status, 403);

  // completion ignores identity injected in the body
  const done = await call(Dl.token, "PATCH", "/api/rides/" + ride.id + "/complete", { driverId: "ACC-evil", driverName: "Evil" });
  assert.equal(done.status, 200);
  const fin = (await call(R.tok, "GET", "/api/rides/" + ride.id)).body.ride;
  assert.equal(fin.driverId, Dl.account.id, "driverId must not be overwritten from the request body");
  assert.ok(!fin.rating, "no rating can be planted by the driver");

  // wallet changes need the current PIN
  const w = "0x" + "cd".repeat(20);
  assert.equal((await call(R.tok, "PATCH", "/api/auth/wallet", { walletAddress: w })).status, 403);
  assert.equal((await call(R.tok, "PATCH", "/api/auth/wallet", { walletAddress: w, pin: "9999" })).status, 403);
  assert.equal((await call(R.tok, "PATCH", "/api/auth/wallet", { walletAddress: w, pin: "1234" })).status, 200);

  // never-match block list works both ways (hidden from open list, accept refused, unblock restores)
  const bl = await call(R.tok, "POST", "/api/rides", { ...trip, distanceKm: 36 });
  assert.equal(bl.status, 201);
  assert.ok(((await call(Dl.token, "GET", "/api/rides/open")).body.rides || []).some(x => x.id === bl.body.ride.id), "driver sees the request before blocking");
  assert.equal((await call(R.tok, "POST", "/api/auth/block", { accountId: Dl.account.id, blocked: true })).status, 200);
  assert.ok(!((await call(Dl.token, "GET", "/api/rides/open")).body.rides || []).some(x => x.id === bl.body.ride.id), "blocked driver no longer sees the request");
  assert.equal((await call(Dl.token, "PATCH", "/api/rides/" + bl.body.ride.id + "/accept", {})).status, 403, "blocked driver cannot accept");
  assert.equal((await call(R.tok, "POST", "/api/auth/block", { accountId: Dl.account.id, blocked: false })).status, 200);
  assert.ok(((await call(Dl.token, "GET", "/api/rides/open")).body.rides || []).some(x => x.id === bl.body.ride.id), "unblock restores matching");
  await call(R.tok, "PATCH", "/api/rides/" + bl.body.ride.id, { status: "CANCELLED" });

  // consent is recorded at registration
  const rc = await call(null, "POST", "/api/auth/register", { name: "Consent", phone: "71100077", pin: "1234", consent: true });
  assert.ok(rc.status < 300);

  // delete my account: wrong PIN refused, right PIN anonymises and ends the session
  const del = await reg("Leaver", "71100099");
  assert.equal((await call(del.tok, "DELETE", "/api/auth/account", { pin: "0000" })).status, 400);
  assert.equal((await call(del.tok, "DELETE", "/api/auth/account", { pin: "1234" })).status, 200);
  assert.equal((await call(del.tok, "GET", "/api/auth/me")).status, 401, "old session must stop working");
  const relog = await call(null, "POST", "/api/auth/login", { phone: "71100099", pin: "1234" });
  assert.ok(relog.status >= 400, "deleted account cannot log in");
  assert.equal((await call(null, "POST", "/api/auth/register", { name: "Back", phone: "71100099", pin: "4321" })).status < 300, true, "phone number can be reused after deletion");

  // a stranger cannot lock the owner out: failed logins from one device do not block another device
  for (let i = 0; i < 6; i++) await request(be.app, { method: "POST", url: "/api/auth/login", body: { phone: "71100001", pin: "0000" }, ip: "9.9.9.9" });
  const owner = await request(be.app, { method: "POST", url: "/api/auth/login", body: { phone: "71100001", pin: "1234" }, ip: "8.8.8.8" });
  assert.equal(owner.status, 200, "owner on another device is not locked out");
});
