import { h, icon, money, toast, busy, spinner, ago, logo, avatar, plate, skeleton } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api, poll } from "../api.js";
import { go } from "../router.js";
import { screen, riderTabs } from "../shell.js";
import { search, roadKm, describeGps } from "../places.js";
import { estimateFare } from "../fare.js";
import { put, ticket, routeBlock, statusLabel, isActive, sosSheet, stars, openSheet } from "./common.js";

// The trip being built. Lives in memory so each screen only asks one thing.
export const draft = { task: "ride", dest: null, pickup: null, km: null, vehicle: "standard", pay: "cash", notes: "" };
const resetDraft = () => Object.assign(draft, { task: "ride", dest: null, pickup: null, km: null, vehicle: "standard", pay: "cash", notes: "" });
const placeLabel = p => p ? (p.region ? p.name + ", " + p.region : p.name) : "";
const KM_CHOICES = [2, 5, 10, 20, 40, 80];

// ---------------------------------------------------------------- home
export async function home() {
    const me = store.account;
    const body = h("div", null);
    const el = screen({ body, tabs: riderTabs() });
    put(body, 
        h("div", { class: "brandbar", style: "padding:0 0 10px" }, logo(32)),
        h("h1", { style: "margin-top:6px" }, t("hello", { name: (me.name || "").split(" ")[0] })),
        h("button", { class: "item", style: "background:var(--surface);border:2px solid var(--line);border-radius:18px;min-height:68px;font-size:20px;font-weight:700", onClick: () => { draft.task = "ride"; go("/rider/where/dest"); } },
            icon("search", 26), h("span", { class: "grow" }, t("whereTo"))),
        h("div", { id: "active" }));
    const list = h("div", { class: "list", style: "margin-top:16px" },
        h("button", { class: "item", onClick: () => { draft.task = "delivery"; go("/rider/where/dest"); } },
            h("span", { class: "lead" }, icon("box")), h("span", { class: "grow" }, h("b", null, t("sendParcel")), h("small", null, t("parcelSub")))));
    put(body, list);
    const recents = store.recents;
    if (recents.length) {
        put(body, h("h3", null, t("recent")), h("div", { class: "list" }, recents.map(r =>
            h("button", { class: "item", onClick: () => { draft.task = "ride"; draft.dest = r; draft.km = r.km || null; go("/rider/trip"); } },
                h("span", { class: "lead" }, icon("pin")), h("span", { class: "grow" }, h("b", null, r.name), h("small", null, r.region))))));
    }
    // Resume an unfinished ride.
    const rid = store.activeRide;
    if (rid) {
        try {
            const { ride } = await api("/rides/" + encodeURIComponent(rid));
            if (isActive(ride.status)) {
                el.querySelector("#active").append(h("button", { class: "status", style: "margin-top:14px;width:100%;border:0;cursor:pointer", onClick: () => go("/rider/ride/" + rid) },
                    h("span", { class: "pulse" }), statusLabel(ride.status)));
            } else store.setActiveRide(null);
        } catch (e) { if (e.status === 404 || e.status === 403) store.setActiveRide(null); }
    }
    return { el };
}

// --------------------------------------------------------------- where
export function where({ kind }) {
    const isDest = kind === "dest";
    const input = h("input", { type: "search", autofocus: true, placeholder: t("whereToHint"), "aria-label": t("whereToHint"), autocomplete: "off", style: "width:100%;min-height:56px;border-radius:14px;border:2px solid var(--line);padding:0 16px;background:var(--surface)" });
    const results = h("div", { class: "list", style: "margin-top:14px" });
    const body = h("div", null, input, results);

    const choose = (place, km) => {
        const p = Object.assign({}, place);
        if (km) { p.km = km; draft.km = km; } else { draft.km = null; }
        if (isDest) { draft.dest = p; store.addRecent(p); } else draft.pickup = p;
        go("/rider/trip", true);
    };
    const askDistance = name => {
        results.replaceChildren();
        body.replaceChildren(h("h1", null, t("howFar")), h("p", { class: "muted" }, name),
            h("div", { class: "chips" }, KM_CHOICES.map(k => h("button", { class: "chip", onClick: () => choose({ name }, k) }, k + " " + t("km")))));
    };
    const useGps = () => {
        results.replaceChildren(spinner(t("locating")));
        if (!navigator.geolocation) return draw(), toast(t("locationDenied"), "error");
        navigator.geolocation.getCurrentPosition(
            pos => { const { latitude: lat, longitude: lng } = pos.coords; choose({ name: describeGps(lat, lng), lat, lng }); },
            () => { toast(t("locationDenied"), "error"); draw(); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    };
    const draw = () => {
        const q = input.value.trim();
        results.replaceChildren();
        if (!isDest && !q) results.append(h("button", { class: "item", onClick: useGps }, h("span", { class: "lead" }, icon("nav")), h("span", { class: "grow" }, h("b", null, t("useMyLocation")))));
        search(q).forEach(p => results.append(h("button", { class: "item", onClick: () => choose(p) },
            h("span", { class: "lead" }, icon("pin")), h("span", { class: "grow" }, h("b", null, p.name), h("small", null, p.region)))));
        if (q.length >= 2) results.append(h("button", { class: "item", onClick: () => askDistance(q) },
            h("span", { class: "lead" }, icon("pin")), h("span", { class: "grow" }, h("b", null, t("cantFind")), h("small", null, q))));
    };
    input.addEventListener("input", draw);
    draw();
    const el = screen({ title: isDest ? t("dropoff") : t("setPickup"), back: () => (isDest ? go("/rider/home") : go("/rider/trip")), body });
    return { el };
}

// ---------------------------------------------------------------- trip
export function trip() {
    if (!draft.dest) { go("/rider/home", true); return null; }
    const body = h("div", null);
    const actions = h("div", { style: "display:grid;gap:10px" });
    const el = screen({ title: draft.task === "delivery" ? t("sendParcel") : t("requestRide"), back: () => go("/rider/home"), body, actions });

    const kmNow = () => draft.km ?? (draft.pickup && draft.pickup.lat != null && draft.dest.lat != null ? roadKm(draft.pickup, draft.dest) : null);

    const paint = () => {
        const km = kmNow();
        body.replaceChildren();
        put(body, routeBlock(draft.pickup ? draft.pickup.name : t("setPickup"), placeLabel(draft.dest), () => go("/rider/where/pickup"), () => go("/rider/where/dest")),
            km != null ? h("div", { class: "rline", style: "margin-top:12px" }, h("span", { class: "a" }), h("i"), km + " " + t("km"), h("i"), h("span", { class: "b" })) : null);
        if (km == null) {
            put(body, h("h3", null, t("howFar")), h("div", { class: "chips" }, KM_CHOICES.map(k => h("button", { class: "chip", onClick: () => { draft.km = k; paint(); } }, k + " " + t("km")))));
            actions.replaceChildren();
            return;
        }
        const fare = estimateFare({ vehicle: draft.vehicle, km });
        put(body, h("div", { style: "margin:18px 0" }, ticket(fare, [h("b", null, t("estimate")), "≈ " + km + " " + t("km")])));
        if (draft.task === "ride") {
            put(body, h("h3", null, t("rideType")), h("div", { class: "opts" },
                [["standard", "standardSub"], ["premium", "premiumSub"], ["xl", "xlSub"]].map(([v, sub]) =>
                    h("button", { class: "opt", "aria-pressed": draft.vehicle === v ? "true" : "false", onClick: () => { draft.vehicle = v; paint(); } },
                        icon("car"), h("span", { class: "grow" }, h("b", null, t(v)), h("small", null, t(sub))), h("b", null, money(estimateFare({ vehicle: v, km })))))));
        }
        put(body, h("h3", null, t("payWith")), h("div", { class: "opts" },
            [["cash", "cash", "cashSub"], ["mobile_money", "mobileMoney", "mobileMoneySub"]].map(([v, l, s]) =>
                h("button", { class: "opt", "aria-pressed": draft.pay === v ? "true" : "false", onClick: () => { draft.pay = v; paint(); } },
                    icon("wallet"), h("span", { class: "grow" }, h("b", null, t(l)), h("small", null, t(s)))))));
        const notes = h("textarea", { id: "notes", rows: "2", maxlength: "300", placeholder: t("notesHint"), value: draft.notes, style: "width:100%;border-radius:14px;border:2px solid var(--line);padding:12px 16px;background:var(--surface)" });
        notes.addEventListener("input", () => { draft.notes = notes.value; });
        put(body, h("h3", null, t("notes")), notes);

        const go2 = h("button", { class: "btn go" }, (draft.task === "delivery" ? t("requestParcel") : t("requestRide")) + " · " + money(fare));
        go2.onclick = () => busy(go2, async () => {
            if (!draft.pickup) return go("/rider/where/pickup");
            try {
                const { ride } = await api("/rides", { method: "POST", body: {
                    pickup: draft.pickup.name, dropoff: placeLabel(draft.dest), vehicle: draft.vehicle, distanceKm: km,
                    notes: draft.notes, paymentMethod: draft.pay, taskType: draft.task === "delivery" ? "delivery" : undefined } });
                store.setActiveRide(ride.id); resetDraft(); go("/rider/ride/" + ride.id, true);
            } catch (e) { toast(e.message, "error"); }
        });
        actions.replaceChildren(go2);
    };

    paint();
    if (!draft.pickup && navigator.geolocation) {
        body.prepend(spinner(t("locating")));
        navigator.geolocation.getCurrentPosition(
            pos => { const { latitude: lat, longitude: lng } = pos.coords; draft.pickup = { name: describeGps(lat, lng), lat, lng }; paint(); },
            () => { toast(t("locationDenied"), "error"); go("/rider/where/pickup", true); },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    } else if (!draft.pickup) { go("/rider/where/pickup", true); }
    return { el };
}

// ---------------------------------------------------------------- ride
export function ride({ id }) {
    const holder = h("div", null);
    const actions = h("div", { style: "display:grid;gap:10px" });
    const el = screen({ title: t("ride"), back: () => go("/rider/home"), body: holder, actions });
    let lastKey = "", startedAt = Date.now(), banner = null;

    const callOther = async () => {
        try { const c = await api("/rides/" + encodeURIComponent(id) + "/contact"); location.href = "tel:" + c.phone; }
        catch (e) { toast(e.message, "error"); }
    };
    const cancel = () => {
        const close = openSheet(h("h2", null, t("cancelRide") + "?"),
            h("button", { class: "btn danger", onClick: async () => { try { await api("/rides/" + encodeURIComponent(id), { method: "PATCH", body: { status: "CANCELLED" } }); close(); refresh(); } catch (e) { toast(e.message, "error"); close(); } } }, t("cancelRide")),
            h("button", { class: "btn ghost", onClick: () => close() }, t("back")));
    };

    const draw = r => {
        holder.replaceChildren(); actions.replaceChildren();
        const route = routeBlock(r.pickup, r.dropoff);
        if (r.status === "MATCHING" || r.status === "REQUESTED") {
            put(holder, h("div", { class: "status", style: "margin-bottom:16px" }, h("span", { class: "pulse" }), t("finding")),
                h("p", { class: "muted", id: "wait" }, t("findingSub")), route, h("div", { style: "margin-top:18px" }, ticket(r.fare, [h("b", null, money(r.fare)), r.paymentMethod === "cash" ? t("cash") : t("mobileMoney")])));
            put(actions, h("button", { class: "btn danger", onClick: cancel }, t("cancelRide")));
        } else if (["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"].includes(r.status)) {
            const head = r.status === "DRIVER_ASSIGNED" ? t("driverComing") : r.status === "DRIVER_ARRIVED" ? t("driverArrived") : t("onTrip");
            const lvl = { DRIVER_ASSIGNED: 1, DRIVER_ARRIVED: 2, PICKED_UP: 3, STARTED: 3 }[r.status];
            put(holder, h("h1", null, head),
                h("div", { class: "steps" }, [t("status_DRIVER_ASSIGNED"), t("status_DRIVER_ARRIVED"), t("status_STARTED")].map((s, i) => h("div", { class: i + 1 <= lvl ? "on" : "" }, s))),
                h("div", { class: "list", style: "margin-bottom:16px" }, h("div", { class: "item", style: "cursor:default" }, avatar(r.driverName),
                    h("span", { class: "grow" }, h("b", null, r.driverName || t("driver")), h("small", null, r.assignedVehicle ? r.assignedVehicle.makeModel : "")), r.assignedVehicle ? plate(r.assignedVehicle.plate) : null)),
                route, h("div", { style: "margin-top:18px" }, ticket(r.fare, [h("b", null, money(r.fare)), r.paymentMethod === "cash" ? t("cash") : t("mobileMoney")])));
            put(actions, h("button", { class: "btn", onClick: callOther }, icon("phone"), t("callDriver")),
                h("button", { class: "btn quiet", onClick: () => sosSheet(r) }, icon("shield"), t("safety")));
            if (r.status === "DRIVER_ASSIGNED" || r.status === "DRIVER_ARRIVED") put(actions, h("button", { class: "link", onClick: cancel }, t("cancelRide")));
        } else if (r.status === "COMPLETED") {
            store.setActiveRide(null);
            let rating = 0, comment = "";
            const note = h("textarea", { rows: "2", maxlength: "200", placeholder: "Add a comment (optional)", style: "width:100%;border-radius:14px;border:2px solid var(--line);padding:12px 16px;background:var(--surface)" });
            note.addEventListener("input", () => { comment = note.value; });
            put(holder, h("h1", null, t("tripDone")), h("p", { class: "muted" }, t("payDriver")),
                ticket(r.fare, [h("b", null, r.paymentMethod === "cash" ? t("cash") : t("mobileMoney")), r.paymentMethod === "cash" ? "" : t("askDriverNumber")]),
                r.reward && r.reward.amount ? h("p", { class: "small muted", style: "margin-top:12px" }, "Reward earned: " + r.reward.amount + " THB") : null,
                r.rating ? h("p", { class: "muted", style: "margin-top:16px" }, t("thanks")) : [h("h3", null, t("rateDriver")), stars(n => { rating = n; }), note]);
            if (!r.rating) {
                const send = h("button", { class: "btn" }, t("sendRating"));
                send.onclick = () => busy(send, async () => {
                    if (!rating) return toast("Tap a star first", "error");
                    try { await api("/rides/" + encodeURIComponent(id) + "/rate", { method: "PATCH", body: { rating, comment } }); toast(t("thanks"), "ok"); go("/rider/home"); }
                    catch (e) { toast(e.message, "error"); }
                });
                put(actions, send);
            }
            put(actions, h("button", { class: r.rating ? "btn" : "link", onClick: () => go("/rider/home") }, t("done")));
        } else {
            store.setActiveRide(null);
            put(holder, h("div", { class: "empty" }, h("b", null, t("status_CANCELLED")), h("p", null, r.pickup + " → " + r.dropoff)));
            put(actions, h("button", { class: "btn", onClick: () => go("/rider/home") }, t("done")));
        }
    };

    const refresh = async () => {
        const { ride: r } = await api("/rides/" + encodeURIComponent(id));
        const key = r.status + "|" + (r.driverId || "") + "|" + (r.rating || "");
        if (key !== lastKey) { lastKey = key; draw(r); }
        const w = el.querySelector("#wait");
        if (w && Date.now() - startedAt > 180000) w.textContent = t("stillLooking");
        if (banner) { banner.remove(); banner = null; }
        return r;
    };
    put(holder, spinner());
    const stop = poll(async () => {
        try { const r = await refresh(); if (["COMPLETED", "CANCELLED"].includes(r.status)) stop(); }
        catch (e) {
            if (e.status === 404 || e.status === 403) { store.setActiveRide(null); go("/rider/home", true); return; }
            if (!banner) { banner = h("div", { class: "banner" }, t("weakConnection")); el.querySelector("#net").append(banner); }
            throw e;
        }
    }, 4000);
    return { el, dispose: stop };
}

// --------------------------------------------------------------- trips
export async function trips() {
    const body = h("div", null, skeleton(4));
    const el = screen({ title: t("trips"), body, tabs: riderTabs() });
    api("/rides/mine").then(({ rides }) => {
        const mine = rides.filter(r => r.passengerAccountId === store.account.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        body.replaceChildren(mine.length ? h("div", { class: "list" }, mine.map(r => h("button", { class: "item", onClick: () => go("/rider/ride/" + r.id) },
            h("span", { class: "lead" }, icon(r.taskType === "delivery" ? "box" : "car")),
            h("span", { class: "grow" }, h("b", null, r.dropoff), h("small", null, statusLabel(r.status) + " · " + ago(r.createdAt))), h("b", null, money(r.fare)))))
            : h("div", { class: "empty" }, h("b", null, t("noTrips")), t("noTripsSub")));
    }).catch(e => body.replaceChildren(h("div", { class: "empty" }, h("b", null, e.message), h("button", { class: "link", onClick: () => location.reload() }, t("retry")))));
    return { el };
}
