import { h, icon, money, toast, busy, spinner, ago, dayKey, skeleton } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api, poll } from "../api.js";
import { go } from "../router.js";
import { screen, driverTabs } from "../shell.js";
import { put, ticket, routeBlock, isActive, sosSheet, openSheet } from "./common.js";

const coordsIn = text => { const m = /\((-?\d+\.\d+),(-?\d+\.\d+)\)/.exec(text || ""); return m ? m[1] + "," + m[2] : null; };
const navUrl = place => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(coordsIn(place) || place + ", Botswana");
const completedBy = (rides, me) => rides.filter(r => (r.driverId === me.id || r.driverAccountId === me.id) && r.status === "COMPLETED");
const sum = rides => rides.reduce((a, r) => a + (Number(r.fare) || 0), 0);

// ---------------------------------------------------------------- apply
export async function apply() {
    const me = store.account;
    const body = h("div", null, spinner());
    const el = screen({ title: t("applyTitle"), back: () => go("/welcome"), body });
    const draw = async () => {
        let status = "NONE";
        try { status = (await api("/drivers/application-status")).status; } catch (e) { toast(e.message, "error"); }
        body.replaceChildren(); const actions = [];
        if (status === "PENDING") {
            put(body, h("div", { class: "empty" }, h("span", { class: "status", style: "justify-content:center;margin-bottom:16px" }, h("span", { class: "pulse" }), t("pendingTitle")), t("pendingSub")),
                h("button", { class: "btn quiet", onClick: async () => { const a = (await api("/auth/me")).account; store.setAccount(a); go("/", true); } }, t("refresh")));
        } else {
            if (status === "REJECTED") put(body, h("h1", null, t("rejectedTitle")), h("p", { class: "muted" }, t("rejectedSub")),
                h("button", { class: "btn ghost", onClick: () => { store.setAsPassenger(true); go("/", true); } }, t("useAsPassenger")), h("h3", null, t("applyAgain")));
            const lic = h("input", { id: "lic", maxlength: "40", autocomplete: "off" }), veh = h("input", { id: "veh", maxlength: "80", autocomplete: "off" });
            const send = h("button", { class: "btn" }, t("submitApplication"));
            send.onclick = () => busy(send, async () => {
                if (!lic.value.trim() || !veh.value.trim()) return toast(t("required"), "error");
                try { await api("/drivers/apply", { method: "POST", body: { license: lic.value.trim(), vehicle: veh.value.trim() } }); toast(t("saved"), "ok"); draw(); }
                catch (e) { toast(e.message, "error"); }
            });
            put(body, h("div", { class: "field" }, h("label", { for: "lic" }, t("license")), lic), h("div", { class: "field" }, h("label", { for: "veh" }, t("vehicle")), veh), send,
                h("button", { class: "link", onClick: () => { store.setAsPassenger(true); go("/", true); } }, t("useAsPassenger")));
        }
    };
    draw();
    return { el };
}

// ----------------------------------------------------------------- home
export async function home() {
    const me = store.account;
    let online = false, stopPoll = null, beat = null;
    const body = h("div", null);
    const el = screen({ title: t("drive"), body, tabs: driverTabs() });
    const jobSlot = h("div"), requests = h("div", { style: "margin-top:12px" });
    const statsEl = h("div", { class: "big-stat" });
    const toggle = h("button", { class: "switch" });
    put(body, toggle, jobSlot, statsEl, requests);

    const position = () => new Promise(res => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res({}), { timeout: 8000, maximumAge: 60000 }) : res({}));
    const heartbeat = async () => { try { await api("/drivers/online", { method: "POST", body: await position() }); } catch (e) { /* retry next beat */ } };
    const paintToggle = () => { toggle.className = "switch" + (online ? " on" : ""); toggle.replaceChildren(icon("power", 30), online ? t("youAreOnline") : t("goOnline")); };

    const loadRequests = async () => {
        const { rides } = await api("/rides/open");
        requests.replaceChildren(rides.length ? h("div", null, rides.map(r => {
            const b = h("button", { class: "btn go" }, t("accept") + " · " + money(r.fare));
            b.onclick = () => busy(b, async () => {
                try { await api("/rides/" + encodeURIComponent(r.id) + "/accept", { method: "PATCH", body: {} }); go("/driver/job/" + r.id); }
                catch (e) { toast(e.status === 409 ? "Another driver took this ride" : e.message, "error"); loadRequests().catch(() => {}); }
            });
            return h("div", { style: "margin-bottom:18px" }, routeBlock(r.pickup, r.dropoff), h("div", { style: "margin:10px 0", class: "small muted" }, r.distanceKm + " " + t("km") + " · " + (r.paymentMethod === "cash" ? t("cash") : t("mobileMoney")) + (r.taskType === "delivery" ? " · " + t("sendParcel") : "") + (r.notes ? " · " + r.notes : "")), b);
        })) : h("div", { class: "empty" }, h("b", null, t("noRequests")), t("waitingRequests")));
    };
    const setOnline = async on => {
        try {
            if (on) { await api("/drivers/online", { method: "POST", body: {} }); heartbeat(); } else { await api("/drivers/offline", { method: "POST", body: {} }); }
            online = on; paintToggle();
            if (stopPoll) { stopPoll(); stopPoll = null; } if (beat) { clearInterval(beat); beat = null; }
            if (on) { stopPoll = poll(loadRequests, 5000); beat = setInterval(heartbeat, 30000); } else requests.replaceChildren();
        } catch (e) { toast(e.message, "error"); }
    };
    toggle.onclick = () => busy(toggle, () => setOnline(!online));
    paintToggle();

    try {
        const [{ rides }, { drivers }] = await Promise.all([api("/rides/mine"), api("/drivers/online").catch(() => ({ drivers: [] }))]);
        const done = completedBy(rides, me), todayKey = dayKey(new Date().toISOString());
        const today = done.filter(r => dayKey(r.createdAt) === todayKey);
        statsEl.append(h("div", null, h("b", null, money(sum(today))), h("small", { class: "muted" }, t("today"))), h("div", null, h("b", null, String(today.length)), h("small", { class: "muted" }, t("tripsDone"))));
        const active = rides.find(r => (r.driverId === me.id || r.driverAccountId === me.id) && isActive(r.status) && r.status !== "MATCHING");
        if (active) jobSlot.append(h("button", { class: "status", style: "margin-top:14px;width:100%;border:0;cursor:pointer", onClick: () => go("/driver/job/" + active.id) }, h("span", { class: "pulse" }), t("status_" + active.status)));
        else if ((drivers || []).some(d => d.id === me.id && d.status === "ONLINE")) setOnline(true);
    } catch (e) { toast(e.message, "error"); }
    return { el, dispose: () => { if (stopPoll) stopPoll(); if (beat) clearInterval(beat); } };
}

// ------------------------------------------------------------------ job
const NEXT = {
    DRIVER_ASSIGNED: ["DRIVER_ARRIVED", "arrived"], DRIVER_ARRIVED: ["PICKED_UP", "pickedUp"],
    PICKED_UP: ["STARTED", "startTrip"], STARTED: ["COMPLETED", "completeTrip"]
};
export function job({ id }) {
    const holder = h("div"), actions = h("div", { style: "display:grid;gap:10px" });
    const el = screen({ title: t("drive"), back: () => go("/driver/home"), body: holder, actions });
    let lastKey = "", banner = null;
    const callPassenger = async () => { try { const c = await api("/rides/" + encodeURIComponent(id) + "/contact"); location.href = "tel:" + c.phone; } catch (e) { toast(e.message, "error"); } };

    const advance = async (r, btn) => {
        const [to] = NEXT[r.status];
        try {
            if (to === "COMPLETED") await api("/rides/" + encodeURIComponent(id) + "/complete", { method: "PATCH", body: {} });
            else await api("/rides/" + encodeURIComponent(id), { method: "PATCH", body: { status: to } });
            await refresh();
        } catch (e) { toast(e.message, "error"); }
    };
    const cancel = () => {
        const close = openSheet(h("h2", null, t("cancel") + "?"),
            h("button", { class: "btn danger", onClick: async () => { try { await api("/rides/" + encodeURIComponent(id), { method: "PATCH", body: { status: "CANCELLED" } }); close(); go("/driver/home"); } catch (e) { toast(e.message, "error"); close(); } } }, t("cancel")),
            h("button", { class: "btn ghost", onClick: () => close() }, t("back")));
    };

    const draw = r => {
        holder.replaceChildren(); actions.replaceChildren();
        if (r.status === "COMPLETED") {
            put(holder, h("h1", null, t("tripDone")), ticket(r.fare, [h("b", null, r.paymentMethod === "cash" ? "Collect cash" : "Mobile money"), r.paymentMethod === "cash" ? "from the passenger" : "ask the passenger to pay your number"]));
            put(actions, h("button", { class: "btn", onClick: () => go("/driver/home") }, t("done"))); return;
        }
        if (r.status === "CANCELLED") { put(holder, h("div", { class: "empty" }, h("b", null, t("status_CANCELLED")))); put(actions, h("button", { class: "btn", onClick: () => go("/driver/home") }, t("done"))); return; }
        const toPickup = ["DRIVER_ASSIGNED", "DRIVER_ARRIVED"].includes(r.status);
        put(holder, h("div", { class: "status", style: "margin-bottom:14px" }, h("span", { class: "pulse" }), t("status_" + r.status)),
            routeBlock(r.pickup, r.dropoff), r.notes ? h("p", { class: "muted", style: "margin-top:12px" }, "“" + r.notes + "”") : null,
            h("div", { style: "margin-top:16px" }, ticket(r.fare, [h("b", null, r.paymentMethod === "cash" ? t("cash") : t("mobileMoney")), r.distanceKm + " " + t("km")])));
        const [, labelKey] = NEXT[r.status] || [];
        if (labelKey) { const b = h("button", { class: "btn go" }, t(labelKey)); b.onclick = () => busy(b, () => advance(r, b)); put(actions, b); }
        put(actions, h("a", { class: "btn quiet", href: navUrl(toPickup ? r.pickup : r.dropoff), target: "_blank", rel: "noopener" }, icon("nav"), "Navigate"),
            h("button", { class: "btn ghost", onClick: callPassenger }, icon("phone"), t("callPassenger")),
            h("button", { class: "btn quiet", onClick: () => sosSheet(r) }, icon("shield"), t("safety")));
        if (toPickup) put(actions, h("button", { class: "link", onClick: cancel }, t("cancel")));
    };
    const refresh = async () => {
        const { ride: r } = await api("/rides/" + encodeURIComponent(id));
        const key = r.status; if (key !== lastKey) { lastKey = key; draw(r); }
        if (banner) { banner.remove(); banner = null; } return r;
    };
    put(holder, spinner());
    const stop = poll(async () => {
        try { const r = await refresh(); if (["COMPLETED", "CANCELLED"].includes(r.status)) stop(); }
        catch (e) { if (!banner) { banner = h("div", { class: "banner" }, t("weakConnection")); el.querySelector("#net").append(banner); } throw e; }
    }, 5000);
    return { el, dispose: stop };
}

// ------------------------------------------------------------- earnings
export async function earnings() {
    const me = store.account, body = h("div", null, skeleton(4));
    const el = screen({ title: t("earnings"), body, tabs: driverTabs() });
    api("/rides/mine").then(({ rides }) => {
        const done = completedBy(rides, me).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const now = Date.now(), week = done.filter(r => now - new Date(r.createdAt) < 7 * 864e5), todayKey = dayKey(new Date().toISOString()), today = done.filter(r => dayKey(r.createdAt) === todayKey);
        body.replaceChildren(h("div", { class: "big-stat" },
            h("div", null, h("b", null, money(sum(today))), h("small", { class: "muted" }, t("today"))), h("div", null, h("b", null, money(sum(week))), h("small", { class: "muted" }, t("thisWeek"))),
            h("div", null, h("b", null, money(sum(done))), h("small", { class: "muted" }, t("allTime"))), h("div", null, h("b", null, String(done.length)), h("small", { class: "muted" }, t("tripsDone")))),
            done.length ? h("div", { class: "list" }, done.slice(0, 30).map(r => h("div", { class: "item" }, h("span", { class: "grow" }, h("b", null, r.dropoff), h("small", null, ago(r.createdAt))), h("b", null, money(r.fare)))))
                : h("div", { class: "empty" }, h("b", null, t("noTrips")), t("noTripsSub")));
    }).catch(e => body.replaceChildren(h("div", { class: "empty" }, h("b", null, e.message))));
    return { el };
}
