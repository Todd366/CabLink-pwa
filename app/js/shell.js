import { h, icon } from "./ui.js";
import { t } from "./i18n.js";
import { go, current } from "./router.js";

// Builds one screen: top bar, scrolling page, pinned actions,
// optional bottom tabs. Every screen in the app goes through here
// so spacing, focus and safe areas stay identical.
export function screen({ title, back, body, actions, tabs, right }) {
    const top = (title || back || right) && h("div", { class: "top" },
        back ? h("button", { class: "icon-btn", "aria-label": t("back"), onClick: () => (typeof back === "function" ? back() : history.length > 1 ? history.back() : go("/")) }, icon("back")) : null,
        title ? h("h2", null, title) : h("span", { style: "flex:1" }),
        right || null);
    const el = h("div", { class: "screen" },
        top || null,
        h("div", { id: "net" }),
        h("main", { class: "page" }, body),
        actions ? h("div", { class: "actions" }, actions) : null,
        tabs ? tabBar(tabs) : null);
    return el;
}

function tabBar(tabs) {
    const here = current().split("?")[0];
    return h("nav", { class: "tabs", "aria-label": "Main" },
        tabs.map(([path, ic, label]) => h("a", { href: "#" + path, "aria-current": here === path || (path !== "/" && here.startsWith(path + "/")) ? "page" : null }, icon(ic), label)));
}

export const riderTabs = () => [["/rider/home", "car", t("ride")], ["/rider/trips", "clock", t("trips")], ["/account", "user", t("account")]];
export const driverTabs = () => [["/driver/home", "car", t("drive")], ["/driver/earnings", "wallet", t("earnings")], ["/account", "user", t("account")]];
