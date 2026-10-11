import { h, icon } from "../ui.js";
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
    const el = screen({
        right: langSwitch(),
        body: h("div", { class: "hero" },
            h("div", { class: "mark" }, icon("car", 34)),
            h("h1", null, t("welcomeTitle")),
            h("p", { class: "muted" }, t("welcomeSub"))),
        actions: [
            h("button", { class: "btn go", onClick: () => choose("rider") }, t("getRide")),
            h("button", { class: "btn ghost", onClick: () => choose("driver") }, t("driveWith"))
        ]
    });
    return { el };
}
