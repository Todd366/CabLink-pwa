const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

// Stub the two services so the middleware can be tested without storage.
let currentAccount = null;
const stub = (rel, exp) => {
    const p = require.resolve(path.join("..", "backend", "services", rel));
    require.cache[p] = { id: p, filename: p, loaded: true, exports: exp };
};
stub("auth_service.js", { accountFromRequest: async () => currentAccount });
stub("rate_limiter_service.js", { checkAndRecord: async ({ key }) => ({ allowed: !key.startsWith("api:blocked"), retryAfterSeconds: 30 }) });

process.env.ADMIN_KEY = "a-very-long-test-admin-key";
const sec = require("../backend/middleware/security");

const mkRes = () => {
    const r = { code: 200, body: null, headers: {} };
    r.status = c => { r.code = c; return r; };
    r.json = b => { r.body = b; return r; };
    r.setHeader = (k, v) => { r.headers[k] = v; };
    return r;
};
const run = async (mw, req) => { const res = mkRes(); let passed = false; await mw(req, res, () => { passed = true; }); return { res, passed }; };

test("requireAuth blocks anonymous and passes logged-in users", async () => {
    currentAccount = null;
    let r = await run(sec.requireAuth, { headers: {} });
    assert.equal(r.passed, false); assert.equal(r.res.code, 401);
    currentAccount = { id: "A1", role: "PASSENGER" };
    r = await run(sec.requireAuth, { headers: {} });
    assert.equal(r.passed, true);
});

test("requireRole refuses passengers on driver routes", async () => {
    currentAccount = { id: "A1", role: "PASSENGER" };
    let r = await run(sec.requireRole("APPROVED_DRIVER"), { headers: {} });
    assert.equal(r.passed, false); assert.equal(r.res.code, 403);
    currentAccount = { id: "D1", role: "APPROVED_DRIVER" };
    r = await run(sec.requireRole("APPROVED_DRIVER"), { headers: {} });
    assert.equal(r.passed, true);
});

test("admin key: wrong, missing and right", async () => {
    currentAccount = null;
    assert.equal((await run(sec.requireAdmin, { headers: { "x-admin-key": "nope" } })).passed, false);
    assert.equal((await run(sec.requireAdmin, { headers: {} })).passed, false);
    assert.equal((await run(sec.requireAdmin, { headers: { "x-admin-key": "a-very-long-test-admin-key" } })).passed, true);
});

test("the old default admin key no longer works", async () => {
    currentAccount = null;
    assert.equal((await run(sec.requireAdmin, { headers: { "x-admin-key": "cablink-admin-dev-key" } })).passed, false);
});

test("selfOrAdmin lets a driver touch only their own record", async () => {
    currentAccount = { id: "D1", role: "APPROVED_DRIVER" };
    assert.equal((await run(sec.selfOrAdmin("id"), { headers: {}, params: { id: "D1" } })).passed, true);
    assert.equal((await run(sec.selfOrAdmin("id"), { headers: {}, params: { id: "D2" } })).passed, false);
});

test("rate limit returns 429", async () => {
    const r = await run(sec.limit("api:blocked", 1, 1000), { ip: "1.1.1.1", headers: {} });
    assert.equal(r.passed, false); assert.equal(r.res.code, 429);
});
