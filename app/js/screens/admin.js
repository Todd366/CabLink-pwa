import { h, icon, toast, spinner, ago, showPhone, money } from "../ui.js";
import { t } from "../i18n.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen } from "../shell.js";
import { statusLabel, isActive } from "./common.js";

const TABS = [["apps", "applications"], ["veh", "vehicles"], ["rides", "rides"], ["safety", "incidents"], ["people", "people"], ["stats", "overview"]];
const card = (...kids) => h("div", { class: "list", style: "margin-bottom:14px" }, ...kids);
const row = (...kids) => h("div", { class: "item", style: "cursor:default" }, ...kids);
const pair = (a, b) => h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px" }, a, b);
const empty = () => h("div", { class: "empty" }, h("b", null, t("nothingHere")));

export function admin() {
    let tab = "apps";
    const body = h("div"), chips = h("div", { class: "chips", style: "margin-bottom:16px" });
    const el = screen({ title: t("admin"), body: [chips, body], right: h("button", { class: "icon-btn", "aria-label": t("account"), onClick: () => go("/account") }, icon("user")) });

    const act = async (fn, again = true) => { try { await fn(); toast(t("saved"), "ok"); if (again) draw(); } catch (e) { toast(e.message, "error"); } };

    const views = {
        async apps() {
            const { applications } = await api("/admin/driver-applications?status=PENDING");
            if (!applications.length) return empty();
            return h("div", null, applications.map(a => card(
                row(h("span", { class: "grow" }, h("b", null, a.name), h("small", null, "+267 " + showPhone(a.phone)), h("small", null, "Licence " + a.license), h("small", null, a.vehicle), h("small", null, ago(a.createdAt)))),
                pair(h("button", { class: "btn", onClick: () => act(() => api("/admin/driver-applications/" + encodeURIComponent(a.id) + "/approve", { method: "POST", body: {} })) }, t("approve")),
                    h("button", { class: "btn danger", onClick: () => act(() => api("/admin/driver-applications/" + encodeURIComponent(a.id) + "/reject", { method: "POST", body: {} })) }, t("reject"))))));
        },
        async veh() {
            const { vehicles } = await api("/admin/vehicles");
            if (!vehicles.length) return empty();
            const set = (v, s) => act(() => api("/admin/vehicles/" + encodeURIComponent(v.id), { method: "PATCH", body: { verificationStatus: s } }));
            return h("div", null, vehicles.map(v => card(
                row(h("span", { class: "lead" }, icon("car")), h("span", { class: "grow" }, h("b", null, (v.makeModel || "Vehicle") + (v.plate ? " · " + v.plate : "")), h("small", null, (v.serviceClass || "") + (v.capacity ? " · " + v.capacity + " seats" : "")), h("small", null, v.verificationStatus || ""))),
                v.verificationStatus === "VERIFIED" ? null : pair(h("button", { class: "btn", onClick: () => set(v, "VERIFIED") }, "Verify"), h("button", { class: "btn danger", onClick: () => set(v, "REJECTED") }, t("reject"))))));
        },
        async rides() {
            const { rides } = await api("/rides");
            const list = rides.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 40);
            if (!list.length) return empty();
            const live = list.filter(r => isActive(r.status)).length;
            return h("div", null, h("p", { class: "muted" }, live + " active · " + list.length + " shown"), list.map(r => card(
                row(h("span", { class: "grow" }, h("b", null, r.pickup.replace(/\s*\(-?\d+\.\d+,-?\d+\.\d+\)/, "") + " → " + r.dropoff), h("small", null, statusLabel(r.status) + " · " + money(r.fare) + " · " + ago(r.createdAt) + (r.driverName ? " · " + r.driverName : ""))),
                    isActive(r.status) ? h("button", { class: "chip", onClick: () => act(() => api("/rides/" + encodeURIComponent(r.id), { method: "PATCH", body: { status: "CANCELLED" } })) }, t("cancel")) : null))));
        },
        async safety() {
            const { incidents } = await api("/admin/incidents");
            if (!incidents.length) return empty();
            return h("div", null, incidents.slice().reverse().map(i => card(
                row(h("span", { class: "grow" }, h("b", null, (i.type || "Report") + " · " + (i.status || "OPEN")), h("small", null, i.description || ""), h("small", null, (i.reporterName || "") + " · " + ago(i.createdAt) + (i.rideId ? " · " + i.rideId : "")))),
                i.status === "RESOLVED" ? null : h("div", { style: "padding:12px" }, h("button", { class: "btn quiet", onClick: () => act(() => api("/admin/incidents/" + encodeURIComponent(i.id), { method: "PATCH", body: { status: "RESOLVED" } })) }, "Mark resolved")))));
        },
        async people() {
            const { accounts } = await api("/admin/accounts");
            const by = {}; accounts.forEach(a => { by[a.role] = (by[a.role] || 0) + 1; });
            return h("div", null, h("p", { class: "muted" }, Object.entries(by).map(([k, v]) => v + " " + k.toLowerCase().replace("_", " ")).join(" · ")),
                card(accounts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(a => row(h("span", { class: "grow" }, h("b", null, a.name), h("small", null, "+267 " + showPhone(a.phone) + " · " + a.role.toLowerCase().replace("_", " ") + " · " + ago(a.createdAt)))))));
        },
        async stats() {
            const { insights } = await api("/admin/insights");
            const flat = Object.entries(insights || {}).filter(([, v]) => typeof v !== "object");
            return flat.length ? card(flat.map(([k, v]) => row(h("span", { class: "grow" }, h("small", null, k.replace(/([A-Z])/g, " $1")), h("b", null, String(v)))))) : empty();
        }
    };

    const draw = async () => {
        chips.replaceChildren(...TABS.map(([k, label]) => h("button", { class: "chip", "aria-pressed": tab === k ? "true" : "false", onClick: () => { tab = k; draw(); } }, t(label))));
        body.replaceChildren(spinner());
        try { body.replaceChildren(await views[tab]()); }
        catch (e) { body.replaceChildren(h("div", { class: "empty" }, h("b", null, e.message))); }
    };
    draw();
    return { el };
}
