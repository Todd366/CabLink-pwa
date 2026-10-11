// ============================================================
// CABLINK SECURITY LAYER
// Single place for headers, CORS, auth guards, rate limits and
// error handling. Every route imports guards from here so the
// rules are identical everywhere.
// ============================================================
const crypto = require("crypto");
const auth = require("../services/auth_service");
const rateLimiter = require("../services/rate_limiter_service");

const IS_PROD = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

function safeEqual(a, b) {
    const x = Buffer.from(String(a || ""));
    const y = Buffer.from(String(b || ""));
    if (x.length !== y.length || x.length === 0) return false;
    return crypto.timingSafeEqual(x, y);
}

// The admin key is only honoured when it is set AND long enough.
// No default value exists anywhere in the code base any more.
function adminKeyValid(req) {
    const key = process.env.ADMIN_KEY || "";
    if (key.length < 16) return false;
    return safeEqual(req.headers["x-admin-key"], key);
}

function requestId(req, res, next) {
    req.id = crypto.randomBytes(6).toString("hex");
    res.setHeader("X-Request-Id", req.id);
    next();
}

function securityHeaders(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(self), camera=(), microphone=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    if (IS_PROD) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
    next();
}

// Same-origin by default in production (Vercel serves app + API
// together). Set CORS_ORIGINS="https://a.com,https://b.com" to
// allow others. Development stays open for local testing.
function cors(req, res, next) {
    const allowed = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.headers.origin;
    if (origin && (allowed.includes(origin) || (!IS_PROD && allowed.length === 0))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
}

async function attachAccount(req, res, next) {
    try {
        req.account = await auth.accountFromRequest(req);
    } catch (e) {
        req.account = null;
    }
    next();
}

function fail(res, status, error) {
    return res.status(status).json({ success: false, error });
}

async function requireAuth(req, res, next) {
    if (req.account === undefined) {
        try { req.account = await auth.accountFromRequest(req); } catch (e) { req.account = null; }
    }
    if (!req.account) return fail(res, 401, "Please log in to continue");
    next();
}

function requireRole(...roles) {
    return async (req, res, next) => {
        await requireAuth(req, res, () => {
            if (!roles.includes(req.account.role)) {
                return fail(res, 403, "Your account is not allowed to do this");
            }
            next();
        });
    };
}

async function requireAdmin(req, res, next) {
    if (adminKeyValid(req)) return next();
    if (req.account === undefined) {
        try { req.account = await auth.accountFromRequest(req); } catch (e) { req.account = null; }
    }
    if (req.account && req.account.role === "ADMIN") return next();
    return fail(res, 403, "Admin access required");
}

// Limit by account (or IP when logged out)
function limit(name, maxAttempts, windowMs) {
    return async (req, res, next) => {
        try {
            const who = req.account ? req.account.id : req.ip;
            const r = await rateLimiter.checkAndRecord({ key: name + ":" + who, maxAttempts, windowMs });
            if (!r.allowed) {
                res.setHeader("Retry-After", String(r.retryAfterSeconds || 60));
                return fail(res, 429, "Too many requests — try again in " + (r.retryAfterSeconds || 60) + " seconds");
            }
        } catch (e) { /* limiter must never take the API down */ }
        next();
    };
}

function selfOrAdmin(param) {
    return async (req, res, next) => {
        if (adminKeyValid(req)) return next();
        await requireAuth(req, res, () => {
            if (req.account.role === "ADMIN" || req.account.id === req.params[param]) return next();
            return fail(res, 403, "You can only access your own data");
        });
    };
}

function notFound(req, res) {
    return fail(res, 404, "Not found");
}

function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error("[" + (req.id || "-") + "]", err);
    if (err.type === "entity.parse.failed") return fail(res, 400, "Invalid request body");
    if (err.type === "entity.too.large") return fail(res, 413, "Request too large");
    return fail(res, status, status >= 500 ? "Something went wrong on our side" : err.message);
}

module.exports = {
    IS_PROD, safeEqual, adminKeyValid, requestId, securityHeaders, cors,
    attachAccount, requireAuth, requireRole, requireAdmin, limit, selfOrAdmin,
    notFound, errorHandler
};
