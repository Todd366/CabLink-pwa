import { store } from "./store.js";

export class ApiError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

const wait = ms => new Promise(r => setTimeout(r, ms));

// One fetch wrapper for the whole app: auth header, timeout,
// retry for safe reads on weak networks, and plain-language errors.
export async function api(path, { method = "GET", body, auth = true, timeout = 15000 } = {}) {
    const retries = method === "GET" ? 2 : 0;
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeout);
        try {
            const headers = { Accept: "application/json" };
            if (body !== undefined) headers["Content-Type"] = "application/json";
            if (auth && store.token) headers.Authorization = "Bearer " + store.token;
            const res = await fetch("/api" + path, {
                method, headers, signal: ctrl.signal,
                body: body === undefined ? undefined : JSON.stringify(body)
            });
            clearTimeout(timer);
            let data = null;
            try { data = await res.json(); } catch (e) { /* non-JSON */ }
            if (res.status === 401 && auth) {
                store.clear();
                location.hash = "#/welcome";
                throw new ApiError("Please log in again", 401);
            }
            if (!res.ok || (data && data.success === false)) {
                const raw = data && data.error;
                const msg = typeof raw === "string" ? raw : raw && (raw.message || raw.error || JSON.stringify(raw));
                throw new ApiError(msg || "Server error (" + res.status + ")", res.status);
            }
            return data || {};
        } catch (e) {
            clearTimeout(timer);
            if (e instanceof ApiError) throw e;
            lastErr = new ApiError(
                navigator.onLine === false
                    ? "You are offline. Check your data or Wi-Fi."
                    : "Weak connection. Please try again.", 0);
            if (attempt < retries) await wait(600 * (attempt + 1));
        }
    }
    throw lastErr;
}

// Repeats fn() with back-off on failure; pauses while the tab is hidden.
export function poll(fn, ms = 4000) {
    let stopped = false, timer = null, delay = ms;
    const tick = async () => {
        if (stopped) return;
        if (document.hidden) { timer = setTimeout(tick, ms); return; }
        try { await fn(); delay = ms; } catch (e) { delay = Math.min(delay * 2, 30000); }
        if (!stopped) timer = setTimeout(tick, delay);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
}
