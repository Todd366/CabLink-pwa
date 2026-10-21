import { h, icon, toast, spinner, ago, showPhone, money } from "../ui.js";
import { t } from "../i18n.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen } from "../shell.js";
import { statusLabel, isActive, openSheet } from "./common.js";

const TABS = [["apps", "applications"], ["news", "updates"], ["veh", "vehicles"], ["rides", "rides"], ["safety", "incidents"], ["people", "people"], ["fees", "fees"], ["errors", "errors"], ["stats", "overview"]];
const card = (...kids) => h("div", { class: "list", style: "margin-bottom:14px" }, ...kids);
const row = (...kids) => h("div", { class: "item", style: "cursor:default" }, ...kids);
const pair = (a, b) => h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px" }, a, b);
const empty = () => h("div", { class: "empty" }, h("b", null, t("nothingHere")));

export function admin() {
    let tab = "apps";
    const body = h("div"), chips = h("div", { class: "chips", style: "margin-bottom:16px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch" });
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
        async news() {
            const { announcements } = await api("/admin/announcements");
            const title = h("input", { placeholder: t("updateTitle"), maxlength: "80", style: "width:100%;min-height:50px;padding:0 14px;border-radius:12px;border:2px solid var(--line);background:var(--surface);margin-bottom:8px" });
            const msg = h("textarea", { rows: "3", maxlength: "400", placeholder: t("updateMessage"), style: "width:100%;padding:12px 14px;border-radius:12px;border:2px solid var(--line);background:var(--surface);margin-bottom:8px" });
            const aud = h("select", { style: "width:100%;min-height:50px;padding:0 14px;border-radius:12px;border:2px solid var(--line);background:var(--surface);margin-bottom:10px" },
                [["ALL", t("everyone")], ["RIDERS", t("riders")], ["DRIVERS", t("drivers")]].map(([v, l]) => h("option", { value: v }, l)));
            const post = h("button", { class: "btn" }, t("publish"));
            post.onclick = () => act(() => api("/admin/announcements", { method: "POST", body: { title: title.value, message: msg.value, audience: aud.value, days: 14 } }));
            return h("div", null, h("h3", { style: "margin-top:0" }, t("postUpdate")), title, msg, aud, post,
                announcements.length ? h("div", { style: "margin-top:20px" }, announcements.map(a => card(row(h("span", { class: "grow" }, h("b", null, a.title), h("small", null, a.message), h("small", null, a.audience + " · " + ago(a.createdAt))),
                    h("button", { class: "chip", onClick: () => act(() => api("/admin/announcements/" + encodeURIComponent(a.id), { method: "DELETE" })) }, t("remove")))))) : null);
        },
        async errors() {
            const { errors } = await api("/admin/client-errors");
            if (!errors.length) return empty();
            return card(errors.map(e => row(h("span", { class: "grow" }, h("b", null, e.message), h("small", null, e.where + " " + e.page), h("small", null, e.account + " · " + ago(e.createdAt)), h("small", { style: "word-break:break-all" }, e.agent)))));
        },
        async fees() {
            const { balances } = await api("/admin/balances");
            if (!balances.length) return empty();
            const pay = b => {
                const amt = h("input", { type: "number", inputmode: "decimal", min: "0", step: "0.5", value: b.owed > 0 ? String(b.owed) : "", style: "width:100%;min-height:54px;padding:0 14px;border-radius:14px;border:2px solid var(--line);background:var(--surface)" });
                const note = h("input", { maxlength: "120", placeholder: t("note"), style: "width:100%;min-height:54px;padding:0 14px;border-radius:14px;border:2px solid var(--line);background:var(--surface)" });
                const save = h("button", { class: "btn" }, t("recordPayment"));
                const close = openSheet(h("h2", null, b.name), h("p", { class: "muted" }, t("feesOwed") + ": " + money(b.owed)), h("div", { class: "field" }, h("label", null, t("amount")), amt), h("div", { class: "field" }, h("label", null, t("note")), note), save);
                save.onclick = () => act(async () => { await api("/admin/settlements", { method: "POST", body: { driverId: b.driverId, driverName: b.name, amount: amt.value, note: note.value } }); close(); });
            };
            return card(balances.map(b => row(h("span", { class: "grow" }, h("b", null, b.name), h("small", null, b.rides + " " + t("tripsDone") + " · " + money(b.fees) + " fees · " + money(b.settled) + " paid")),
                h("button", { class: b.owed > 0 ? "chip" : "chip", style: b.owed > 0 ? "border-color:var(--bad);color:var(--bad)" : "", onClick: () => pay(b) }, money(b.owed)))));
        },
        async stats() {
            const { metrics: m, hotspots } = await api("/admin/metrics");
            const max = Math.max(1, ...m.days.map(d => d.requested));
            const tile = (v, label) => h("div", null, h("b", null, v), h("small", { class: "muted" }, label));
            const bars = h("div", { style: "display:flex;gap:6px;align-items:flex-end;height:110px;margin:6px 0 4px" }, m.days.map(d => h("div", { style: "flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;align-items:center", title: d.date + ": " + d.requested },
                h("div", { style: "width:100%;border-radius:6px 6px 2px 2px;background:var(--flag-soft);height:" + Math.round(d.requested / max * 100) + "%;position:relative;min-height:3px" },
                    h("div", { style: "position:absolute;bottom:0;left:0;right:0;border-radius:6px 6px 2px 2px;background:var(--flag);height:" + (d.requested ? Math.round(d.completed / d.requested * 100) : 0) + "%" })))));
            const labels = h("div", { style: "display:flex;gap:6px;font-size:12px;color:var(--muted);text-align:center" }, m.days.map(d => h("span", { style: "flex:1" }, d.date.slice(8))));
            return h("div", null,
                h("h3", { style: "margin-top:0" }, t("lastWeek")),
                h("div", { class: "big-stat" }, tile(String(m.week.requested), t("requests")), tile(String(m.week.completed), t("tripsDone")),
                    tile(m.completionRate == null ? "—" : m.completionRate + "%", t("completionRate")), tile(m.avgWaitMin == null ? "—" : m.avgWaitMin + " " + t("minutes"), t("avgWait")),
                    tile(money(m.grossFares), t("grossFares")), tile(money(m.platformFees), t("platformFees")),
                    tile(String(m.openNow), t("openNow")), tile(String(m.activeNow), t("activeNow"))),
                bars, labels,
                hotspots && hotspots.places.length ? h("p", { class: "muted small", style: "margin-top:16px" }, t("busyAreas") + ": " + hotspots.places.map(p => p.place).join(" · ")) : null);
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
