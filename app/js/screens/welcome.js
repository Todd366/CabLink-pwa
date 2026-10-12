import { h, icon, logo } from "../ui.js";
import { t, LANGS } from "../i18n.js";
import { store } from "../store.js";
import { go, render } from "../router.js";
import { screen } from "../shell.js";

export function langSwitch() {
    return h("div", { class: "lang", role: "group", "aria-label": t("language") },
        LANGS.map(([code, label]) => h("button", {
            "aria-pressed": store.lang === code ? "true" : "false",
            onClick: () => { store.setLang(code); document.documentElement.lang = code === "tn" ? "tn" : "en"; render(); }
        }, label)));
}

export function welcome() {
    const choose = intent => { store.setIntent(intent); go("/auth/login"); };
    const el = h("div", { class: "screen" },
        h("div", { class: "panel" },
            h("div", { style: "display:flex;justify-content:space-between;align-items:center" }, logo(36), langSwitch()),
            h("h1", null, t("welcomeTitle")), h("p", null, t("welcomeSub")), h("div", { class: "roadline" })),
        h("main", { class: "page" }, h("ul", { class: "trust" },
            [["shield", "Drivers are approved by CabLink"], ["wallet", "Pay cash or mobile money"], ["pin", "Works for villages, towns and cities"], ["phone", "Light on data, works on weak signal"]]
                .map(([ic, tx]) => h("li", null, h("span", { class: "lead" }, icon(ic)), tx)))),
        h("div", { class: "actions" },
            h("button", { class: "btn go", onClick: () => choose("rider") }, t("getRide")),
            h("button", { class: "btn ghost", onClick: () => choose("driver") }, t("driveWith")),
            h("a", { class: "link small", style: "text-align:center", href: "/legal.html", target: "_blank", rel: "noopener" }, t("terms"))));
    return { el };
}
