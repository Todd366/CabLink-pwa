// ============================================================
// RATE LIMITER
//
// Nothing in this app was rate-limited before this — no
// express-rate-limit, no helmet, nothing at all. A login PIN is as
// short as 4 digits (10,000 combinations), completely unprotected
// against brute force; the admin key is a single shared secret with
// no protection against guessing it either.
//
// Uses the same Supabase-backed generic store as every other piece
// of durable state in this app (see supabase_adapter.js) when
// configured, rather than a naive in-memory Map — Vercel serverless
// functions don't reliably share memory between invocations (each
// request can land on a different, cold container), so an
// in-memory-only limiter would silently protect almost nothing in
// production while looking like it works in local testing. Falls
// back to real in-memory tracking only when Supabase isn't
// configured (local dev via `npm start` without those env vars set).
// ============================================================

function supabaseConfigured() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const memoryStore = new Map();

async function getAttempts(key) {
    if (supabaseConfigured()) {
        const supabase = require("../supabase/supabase_adapter");
        try {
            const result = await supabase.read("cablink_rate_limits", key);
            return result.exists && Array.isArray(result.data.attempts) ? result.data.attempts : [];
        } catch (error) {
            // Supabase hiccup shouldn't take down login entirely —
            // fail open to memory for this one check rather than 500.
            return memoryStore.get(key) || [];
        }
    }
    return memoryStore.get(key) || [];
}

async function saveAttempts(key, attempts) {
    if (supabaseConfigured()) {
        const supabase = require("../supabase/supabase_adapter");
        try {
            await supabase.write("cablink_rate_limits", key, { attempts });
            return;
        } catch (error) {
            // Same fail-open reasoning as above.
        }
    }
    memoryStore.set(key, attempts);
}

// Records this attempt and reports whether it's still within the
// allowed rate. Called on every attempt regardless of outcome (the
// caller decides what "an attempt" means — e.g. only failed logins,
// or every request to an endpoint), so repeated hits against the
// limit keep extending the block rather than the window quietly
// resetting.
async function checkAndRecord({ key, maxAttempts, windowMs }) {
    const now = Date.now();
    const existing = await getAttempts(key);
    const recent = existing.filter(t => now - t < windowMs);

    if (recent.length >= maxAttempts) {
        const oldestInWindow = Math.min(...recent);
        const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldestInWindow)) / 1000));
        return { allowed: false, retryAfterSeconds };
    }

    recent.push(now);
    await saveAttempts(key, recent);
    return { allowed: true, retryAfterSeconds: 0 };
}

module.exports = { checkAndRecord };
