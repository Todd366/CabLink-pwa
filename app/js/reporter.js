// Sends crashes from real phones to the admin (Errors tab). Throttled and
// de-duplicated so a bug loop can never flood the server or burn data.
const seen = new Set();
let sent = 0;
function report(message, where) {
    try {
        const key = String(message).slice(0, 80);
        if (seen.has(key) || sent >= 5) return;
        seen.add(key); sent += 1;
        const body = JSON.stringify({ message: String(message), where: String(where || ""), page: location.hash, agent: navigator.userAgent });
        const token = localStorage.getItem("cl.token");
        fetch("/api/client-errors", { method: "POST", keepalive: true, headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}), body }).catch(() => {});
    } catch (e) { /* never throw from the reporter */ }
}
window.addEventListener("error", e => report(e.message, (e.filename || "").split("/").pop() + ":" + e.lineno));
window.addEventListener("unhandledrejection", e => report((e.reason && e.reason.message) || e.reason, "promise"));
