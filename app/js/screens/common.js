import { h, icon, money, toast, busy } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api } from "../api.js";

export function openSheet(...kids) {
    const bg = h("div", { class: "sheet-bg", onClick: e => { if (e.target === bg) close(); } });
    const close = () => bg.remove();
    bg.append(h("div", { class: "sheet", role: "dialog", "aria-modal": "true" }, ...kids));
    document.body.append(bg);
    return close;
}

export const ticket = (amount, lines) => h("div", { class: "ticket", role: "group", "aria-label": t("estimate") },
    h("div", { class: "amt" }, money(amount)),
    h("div", { class: "rest" }, lines.map(l => h("div", null, l))));

export function routeBlock(from, to, onFrom, onTo) {
    const row = (cls, label, value, fn) => h(fn ? "button" : "div", { class: "stop", onClick: fn || null },
        h("span", { class: cls }), h("span", null, h("small", null, label), h("b", null, String(value || "—").replace(/\s*\(-?\d+\.\d+,-?\d+\.\d+\)/, ""))));
    return h("div", { class: "route" }, row("dot", t("pickup"), from, onFrom), row("sq", t("dropoff"), to, onTo));
}

export const statusLabel = s => t("status_" + s);
export const isActive = s => ["REQUESTED", "MATCHING", "DRIVER_ASSIGNED", "DRIVER_ARRIVED", "PICKED_UP", "STARTED"].includes(s);

// Safety sheet shared by riders and drivers.
export function sosSheet(ride) {
    let close;
    const shareText = ride
        ? "I'm on a CabLink trip from " + ride.pickup + " to " + ride.dropoff +
          (ride.driverName ? ". Driver: " + ride.driverName : "") +
          (ride.assignedVehicle ? " (" + ride.assignedVehicle.makeModel + ", " + ride.assignedVehicle.plate + ")" : "") + ". Trip ID: " + ride.id
        : "";
    const contact = store.contact;
    const wa = () => {
        const num = contact && contact.phone ? "267" + contact.phone : "";
        window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(shareText), "_blank", "noopener");
    };
    const alertBtn = h("button", { class: "btn sos" }, icon("alert"), "Alert CabLink");
    alertBtn.onclick = () => busy(alertBtn, async () => {
        try {
            await api("/incidents", { method: "POST", body: { type: "SOS", description: "Emergency alert from trip screen", rideId: ride && ride.id } });
            toast("CabLink has been alerted", "ok"); close();
        } catch (e) { toast(e.message, "error"); }
    });
    const sup = h("div", { style: "display:grid;gap:12px" });
    supportButtons().then(b => sup.append(...b));
    close = openSheet(
        h("h2", null, t("emergency")),
        h("a", { class: "btn sos", href: "tel:999" }, icon("phone"), "Police 999"),
        h("a", { class: "btn ghost", href: "tel:997" }, icon("phone"), "Ambulance 997"),
        ride ? h("button", { class: "btn quiet", onClick: wa }, icon("share"), t("shareTrip")) : null,
        alertBtn,
        sup,
        h("button", { class: "link", onClick: () => close() }, t("cancel")));
}

export function stars(onPick) {
    let value = 0;
    const btns = [1, 2, 3, 4, 5].map(n => {
        const b = h("button", { type: "button", "aria-label": n + " / 5", "aria-pressed": "false" }, icon("star", 44));
        b.onclick = () => { value = n; btns.forEach((x, i) => x.setAttribute("aria-pressed", i < n ? "true" : "false")); onPick(n); };
        return b;
    });
    return h("div", { class: "stars", role: "group", "aria-label": t("rateDriver") }, btns);
}

// append() that skips null/false (native append would print "null").
export const put = (el, ...kids) => el.append(...kids.flat(Infinity).filter(x => x != null && x !== false));

// Team announcements (pilot news, safety notices). Dismissible per device.
export async function announcements() {
    const box = h("div", { style: "margin:4px 0 8px" });
    try {
        const { announcements: list } = await api("/announcements");
        const gone = store.dismissed;
        list.filter(a => !gone.includes(a.id)).slice(0, 2).forEach(a => {
            const card = h("div", { class: "status", style: "align-items:flex-start;margin-bottom:10px;background:var(--taxi);color:var(--taxi-ink)" },
                icon("alert"), h("span", { style: "flex:1" }, h("b", null, a.title), h("br"), a.message),
                h("button", { class: "icon-btn", style: "width:36px;height:36px;margin:-6px -8px 0 0", "aria-label": t("close"), onClick: () => { store.dismiss(a.id); card.remove(); } }, icon("x", 18)));
            box.append(card);
        });
    } catch (e) { /* announcements are optional */ }
    return box;
}

let cfg = null;
export async function getConfig() {
    if (cfg) return cfg;
    try { cfg = await api("/config", { auth: false }); } catch (e) { cfg = {}; }
    return cfg;
}
// "Call CabLink" / "WhatsApp CabLink" buttons, shown only if a support number is configured.
export async function supportButtons(kind = "ghost") {
    const c = await getConfig();
    const out = [];
    if (c.supportPhone) out.push(h("a", { class: "btn " + kind, href: "tel:+" + c.supportPhone }, icon("phone"), "Call CabLink"));
    if (c.supportWhatsapp) out.push(h("a", { class: "btn " + kind, href: "https://wa.me/" + c.supportWhatsapp, target: "_blank", rel: "noopener" }, icon("share"), "WhatsApp CabLink"));
    return out;
}
