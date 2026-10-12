// Guards against "the whole API crashes on startup" — loads every route
// with stand-ins for third-party packages, so a missing import or an
// undefined handler fails here instead of in production.
const test = require("node:test");
const assert = require("node:assert");
const Module = require("module");

test("backend loads without errors", () => {
    const proxy = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? false : proxy), apply: () => proxy, construct: () => proxy });
    const router = () => {
        const r = function () {};
        for (const m of ["use", "get", "post", "patch", "put", "delete", "all", "disable", "set", "listen", "param"])
            r[m] = (...a) => { for (const f of a.flat()) assert.ok(f !== undefined, "undefined handler passed to " + m); };
        return r;
    };
    const express = () => router();
    express.Router = router; express.json = () => (q, s, n) => n(); express.static = () => (q, s, n) => n();
    const orig = Module._load;
    Module._load = function (req, ...rest) {
        if (req === "express") return express;
        if (["cors", "dotenv", "ethers", "web-push"].includes(req) || req.startsWith("firebase-admin") || req.startsWith("@supabase")) return proxy;
        return orig.call(this, req, ...rest);
    };
    process.env.VERCEL = "1";
    try { assert.doesNotThrow(() => require("../api/index.js")); } finally { Module._load = orig; }
});
