import { h } from "./ui.js";

const routes = [];
let dispose = null;
let token = 0;

export function route(pattern, handler) {
    const keys = [];
    const re = new RegExp("^" + pattern.replace(/:([a-z]+)/gi, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
    routes.push({ re, keys, handler });
}
export const go = (path, replace) => {
    if (replace) location.replace("#" + path); else location.hash = "#" + path;
};
export const current = () => location.hash.replace(/^#/, "") || "/";

export async function render() {
    const my = ++token;
    const path = current().split("?")[0];
    if (dispose) { try { dispose(); } catch (e) { /* ignore */ } dispose = null; }
    for (const r of routes) {
        const m = path.match(r.re);
        if (!m) continue;
        const params = {};
        r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
        let view;
        try { view = await r.handler(params); } catch (e) { view = { el: h("div", { class: "page" }, h("h1", null, "Something went wrong"), h("p", { class: "muted" }, e.message)) }; }
        if (my !== token || !view) { if (view && view.dispose) view.dispose(); return; }
        dispose = view.dispose || null;
        const root = document.getElementById("app");
        root.replaceChildren(view.el);
        const focus = view.el.querySelector("[autofocus], h1, h2");
        if (focus) { if (!focus.hasAttribute("tabindex")) focus.setAttribute("tabindex", "-1"); focus.focus({ preventScroll: true }); }
        return;
    }
    go("/welcome", true);
}
window.addEventListener("hashchange", render);
