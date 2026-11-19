const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { request, loadRealBackend } = require("./helpers/mini_express.js");

test("client error reports are accepted without login and never fail", async () => {
  const be = loadRealBackend(path.join(__dirname, ".."));
  const r = await request(be.app, { method: "POST", url: "/api/client-error", body: { message: "x".repeat(5000), source: "/app/js/main.js", line: 12, stack: "y".repeat(5000), page: "#/rider" }, ip: "7.7.7.7" });
  assert.equal(r.status, 204);
  const bad = await request(be.app, { method: "POST", url: "/api/client-error", body: null, ip: "7.7.7.8" });
  assert.equal(bad.status, 204);
});
