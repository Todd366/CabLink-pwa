// A small, honest stand-in for Express so the REAL route code can run in tests
// and in a browser harness without installing packages. It implements only what
// CabLink uses: routers, use(), params, query, error handlers, json().
const METHODS = ["get", "post", "patch", "put", "delete"];

function compile(path) {
    const keys = [];
    const src = path.replace(/\/+$/, "").replace(/:([A-Za-z0-9_]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; });
    return { regex: new RegExp("^" + src + "/?$"), keys };
}

function runChain(fns, req, res, done, err) {
    let i = 0;
    const next = e => {
        const fn = fns[i++];
        if (!fn) return done(e);
        try {
            if (e) { if (fn.length === 4) return fn(e, req, res, next); return next(e); }
            if (fn.length === 4) return next();
            const out = fn(req, res, next);
            if (out && typeof out.catch === "function") out.catch(next);   // Express 5 behaviour
        } catch (x) { next(x); }
    };
    next(err);
}

function createRouter() {
    const stack = [];
    const router = (req, res, out) => {
        let i = 0;
        const next = e => {
            const layer = stack[i++];
            if (!layer) return out(e);
            const url = req.url.split("?")[0];
            if (layer.kind === "use") {
                const p = layer.path;
                if (p !== "/" && !(url === p || url.startsWith(p + "/"))) return next(e);
                const saved = { url: req.url, path: req.path };
                if (p !== "/") { req.url = req.url.slice(p.length) || "/"; req.path = (req.path || url).slice(p.length) || "/"; }
                const target = layer.fns;
                return runChain(target, req, res, err => { req.url = saved.url; req.path = saved.path; next(err); }, e);
            }
            if (e) return next(e);
            if (layer.method !== req.method) return next();
            const m = layer.regex.exec(url);
            if (!m) return next();
            req.params = Object.assign({}, req.params);
            layer.keys.forEach((k, idx) => { req.params[k] = decodeURIComponent(m[idx + 1]); });
            runChain(layer.fns, req, res, next);
        };
        next();
    };
    METHODS.forEach(m => { router[m] = (path, ...fns) => { const c = compile(path); stack.push({ kind: "route", method: m.toUpperCase(), regex: c.regex, keys: c.keys, path, fns: fns.flat() }); return router; }; });
    router.use = (a, ...b) => { const path = typeof a === "string" ? a : "/"; const fns = (typeof a === "string" ? b : [a, ...b]).flat(); stack.push({ kind: "use", path, fns }); return router; };
    router.disable = router.set = () => router;
    router.stack = stack;
    return router;
}

function express() { return createRouter(); }
express.Router = createRouter;
express.json = () => (req, res, next) => next();
express.static = () => (req, res, next) => next();

// Fire one request through an app and get {status, headers, body}.
function request(app, { method = "GET", url = "/", headers = {}, body, ip = "10.0.0.1" } = {}) {
    return new Promise(resolve => {
        const res = { statusCode: 200, headers: {}, headersSent: false };
        const done = payload => { if (res.headersSent) return; res.headersSent = true; resolve({ status: res.statusCode, headers: res.headers, body: payload }); };
        res.status = c => { res.statusCode = c; return res; };
        res.setHeader = (k, v) => { res.headers[String(k).toLowerCase()] = v; };
        res.set = res.setHeader;
        res.json = o => { done(JSON.parse(JSON.stringify(o))); return res; };
        res.send = o => { done(o); return res; };
        res.sendStatus = c => { res.statusCode = c; done(null); return res; };
        res.end = () => { done(null); return res; };
        res.redirect = () => done(null);
        const lower = {}; for (const k in headers) lower[k.toLowerCase()] = headers[k];
        const [path, qs] = url.split("?");
        const query = {}; if (qs) for (const [k, v] of new URLSearchParams(qs)) query[k] = v;
        const req = { method: method.toUpperCase(), url, path, query, headers: lower, body: body === undefined ? undefined : JSON.parse(JSON.stringify(body)), ip, params: {}, get: k => lower[String(k).toLowerCase()] };
        const timer = setTimeout(() => done({ __timeout: true }), 8000);
        app(req, res, err => { clearTimeout(timer); res.statusCode = err ? 500 : 404; done(err ? { __unhandled: String(err && err.stack || err) } : { __notfound: true }); });
        const orig = res.json; res.json = o => { clearTimeout(timer); return orig(o); };
    });
}

// Load a copy of the real backend in a temp folder with empty local storage.
function loadRealBackend(repoRoot, env = {}) {
    const fs = require("fs"), os = require("os"), path = require("path"), Module = require("module");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cablink-e2e-"));
    const src = path.join(repoRoot, "backend");
    // Judge each file by its path INSIDE backend/, never by the absolute path
    // (the repo itself may live under a folder called "data", e.g. Termux).
    fs.cpSync(src, path.join(tmp, "backend"), { recursive: true, filter: f => { const rel = path.relative(src, f).split(path.sep); return rel[0] !== "data" && !rel.includes("node_modules"); } });
    fs.mkdirSync(path.join(tmp, "backend", "data"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "package.json"), path.join(tmp, "package.json"));
    fs.mkdirSync(path.join(tmp, "api"), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, "api", "index.js"), path.join(tmp, "api", "index.js"));
    const proxy = new Proxy(function () {}, { get: (t, k) => (k === "__esModule" ? false : proxy), apply: () => proxy, construct: () => proxy });
    const orig = Module._load;
    Module._load = function (req, ...rest) {
        if (req === "express") return express;
        if (["cors", "dotenv", "ethers", "web-push"].includes(req) || req.startsWith("firebase-admin") || req.startsWith("@supabase")) return proxy;
        return orig.call(this, req, ...rest);
    };
    Object.assign(process.env, { ADMIN_KEY: "e2e-admin-key-0123456789", MARKETPLACE_API_KEY: "e2e-market-key", ...env });
    delete process.env.VERCEL; delete process.env.CABLINK_ACCOUNT_PERSISTENCE; delete process.env.CABLINK_RIDE_PERSISTENCE;
    const app = require(path.join(tmp, "api", "index.js"));
    return { app: app.default || app, dir: tmp, restore: () => { Module._load = orig; } };
}

module.exports = { express, request, loadRealBackend, createRouter };
