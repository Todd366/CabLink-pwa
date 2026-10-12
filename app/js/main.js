import { store } from "./store.js";
import { api } from "./api.js";
import { route, go, render } from "./router.js";
import { toast } from "./ui.js";
import { t } from "./i18n.js";
import { welcome } from "./screens/welcome.js";
import { login, register } from "./screens/auth.js";
import * as rider from "./screens/rider.js";
import * as driver from "./screens/driver.js";
import { account } from "./screens/account.js";
import { admin } from "./screens/admin.js";
import { enablePush } from "./push.js";

// Every protected screen declares who may see it. A driver account
// can never open a rider screen (and so can never book a ride).
function guard(roles, handler) {
    return async params => {
        const me = store.account;
        if (!store.token || !me) { go("/welcome", true); return null; }
        if (roles && !roles.includes(me.role)) { go("/", true); return null; }
        return handler(params);
    };
}

async function homePath() {
    const me = store.account;
    if (!store.token || !me) return "/welcome";
    if (me.role === "ADMIN") return "/admin";
    if (me.role === "APPROVED_DRIVER") return "/driver/home";
    if (store.intent === "driver" && !store.asPassenger) return "/driver/apply";
    return "/rider/home";
}

route("/", async () => { go(await homePath(), true); return null; });
route("/welcome", params => { if (store.token && store.account) { go("/", true); return null; } return welcome(params); });
route("/auth/login", login);
route("/auth/register", register);
route("/rider/home", guard(["PASSENGER"], rider.home));
route("/rider/where/:kind", guard(["PASSENGER"], rider.where));
route("/rider/trip", guard(["PASSENGER"], rider.trip));
route("/rider/ride/:id", guard(["PASSENGER"], rider.ride));
route("/rider/trips", guard(["PASSENGER"], rider.trips));
route("/driver/apply", guard(["PASSENGER"], driver.apply));
route("/driver/home", guard(["APPROVED_DRIVER"], driver.home));
route("/driver/job/:id", guard(["APPROVED_DRIVER"], driver.job));
route("/driver/earnings", guard(["APPROVED_DRIVER"], driver.earnings));
route("/admin", guard(["ADMIN"], admin));
route("/account", guard(null, account));

// Connection awareness: say so plainly when the phone drops offline.
window.addEventListener("offline", () => toast(t("offline"), "error"));
window.addEventListener("online", () => toast(t("online"), "ok"));

async function boot() {
    document.documentElement.lang = store.lang === "tn" ? "tn" : "en";
    if (store.token) {
        try { store.setAccount((await api("/auth/me")).account); } catch (e) { /* offline: keep cached account */ }
    }
    if (!location.hash || location.hash === "#") location.hash = "#/";
    await render();
    if (store.token) enablePush({ ask: false });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
}
boot();
