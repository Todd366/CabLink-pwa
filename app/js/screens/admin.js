import { h, icon, toast, spinner, ago, showPhone } from "../ui.js";
import { t } from "../i18n.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen } from "../shell.js";

export function admin() {
    let tab = "apps";
    const body = h("div"), chips = h("div", { class: "chips", style: "margin-bottom:16px" });
    const el = screen({ title: t("admin"), body: [chips, body], right: h("button", { class: "icon-btn", "aria-label": t("account"), onClick: () => go("/account") }, icon("user")) });
    const draw = async () => {
        chips.replaceChildren(...[["apps", t("applications")], ["safety", t("incidents")], ["stats", t("overview")]].map(([k, l]) => h("button", { class: "chip", "aria-pressed": tab === k ? "true" : "false", onClick: () => { tab = k; draw(); } }, l)));
        body.replaceChildren(spinner());
        try {
            if (tab === "apps") {
                const { applications } = await api("/admin/driver-applications?status=PENDING");
                const decide = async (a, verb) => { try { await api("/admin/driver-applications/" + encodeURIComponent(a.id) + "/" + verb, { method: "POST", body: {} }); toast(t("saved"), "ok"); draw(); } catch (e) { toast(e.message, "error"); } };
                body.replaceChildren(applications.length ? h("div", null, applications.map(a => h("div", { class: "list", style: "margin-bottom:14px" }, h("div", { class: "item", style: "cursor:default" }, h("span", { class: "grow" }, h("b", null, a.name), h("small", null, "+267 " + showPhone(a.phone)), h("small", null, "Licence " + a.license), h("small", null, a.vehicle), h("small", null, ago(a.createdAt)))),
                    h("div", { style: "display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px" }, h("button", { class: "btn", onClick: () => decide(a, "approve") }, t("approve")), h("button", { class: "btn danger", onClick: () => decide(a, "reject") }, t("reject")))))) : h("div", { class: "empty" }, h("b", null, t("nothingHere"))));
            } else if (tab === "safety") {
                const { incidents } = await api("/admin/incidents");
                body.replaceChildren(incidents.length ? h("div", { class: "list" }, incidents.slice().reverse().map(i => h("div", { class: "item", style: "cursor:default" }, h("span", { class: "grow" }, h("b", null, (i.type || "Report") + " · " + (i.status || "OPEN")), h("small", null, i.description || ""), h("small", null, (i.reporterName || "") + " · " + ago(i.createdAt)))))) : h("div", { class: "empty" }, h("b", null, t("nothingHere"))));
            } else {
                const { insights } = await api("/admin/insights");
                const flat = Object.entries(insights || {}).filter(([, v]) => typeof v !== "object");
                body.replaceChildren(h("div", { class: "list" }, flat.map(([k, v]) => h("div", { class: "item", style: "cursor:default" }, h("span", { class: "grow" }, h("small", null, k.replace(/([A-Z])/g, " $1")), h("b", null, String(v)))))));
            }
        } catch (e) { body.replaceChildren(h("div", { class: "empty" }, h("b", null, e.message))); }
    };
    draw();
    return { el };
}
