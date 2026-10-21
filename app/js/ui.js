// Tiny DOM toolkit. Text is always set with textContent, never
// innerHTML, so names or notes typed by other users can never
// inject markup.
export function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const k in props || {}) {
        const v = props[k];
        if (v === false || v == null) continue;
        if (k === "class") el.className = v;
        else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "value") el.value = v;
        else if (k === "checked") el.checked = !!v;
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
        if (kid == null || kid === false) continue;
        el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
}

const ICONS = {
    car: "M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13h.01M16.5 13h.01",
    pin: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    wallet: "M4 7h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12M16 13.5h.01",
    phone: "M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z",
    box: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8",
    back: "M15 5l-7 7 7 7",
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12M18 6L6 18",
    search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
    share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3M8 7l4-4 4 4",
    alert: "M12 3l10 18H2L12 3zM12 10v5M12 18h.01",
    nav: "M3 11l18-8-8 18-2-8-8-2z",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
    star: "M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9L12 3z",
    power: "M12 3v9M6.4 6.4a8 8 0 1 0 11.2 0",
    gauge: "M4 18a8 8 0 1 1 16 0M12 18l4-6",
    list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
};
export function icon(name, size = 22) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size); s.setAttribute("height", size);
    s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2"); s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", ICONS[name] || ICONS.car); s.append(p);
    return s;
}

export const money = n => "P" + (Math.round(Number(n) * 100) / 100).toLocaleString("en-BW", { maximumFractionDigits: 2 });

// Botswana mobile numbers: 8 digits starting with 7, optional 267 / +267.
export function cleanPhone(raw) {
    let d = String(raw || "").replace(/[^\d+]/g, "");
    if (d.startsWith("+267")) d = d.slice(4);
    else if (d.startsWith("00267")) d = d.slice(5);
    else if (d.startsWith("267") && d.length === 11) d = d.slice(3);
    return /^7\d{7}$/.test(d) ? d : null;
}
export const showPhone = p => { const d = String(p || "").replace(/\D/g, "").slice(-8); return d.length === 8 ? d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5) : p || ""; };

export function toast(message, kind = "info") {
    let box = document.getElementById("toasts");
    if (!box) { box = h("div", { id: "toasts", role: "status", "aria-live": "polite" }); document.body.append(box); }
    const el = h("div", { class: "toast " + kind }, message);
    box.append(el);
    setTimeout(() => el.remove(), kind === "error" ? 5200 : 3200);
}

export function spinner(label) { return h("div", { class: "busy", role: "status" }, h("span", { class: "dot" }), label || ""); }

// Disable a button while an async action runs, so double taps
// never send two requests.
export async function busy(btn, fn) {
    if (btn.disabled) return;
    btn.disabled = true; btn.classList.add("loading");
    try { return await fn(); } finally { btn.disabled = false; btn.classList.remove("loading"); }
}

export function ago(iso) {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago";
    if (s < 86400) return Math.floor(s / 3600) + " h ago";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
// Local calendar day (Botswana is UTC+2), not the UTC day.
export const dayKey = iso => { const d = new Date(iso); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

export function logo(size = 36, word = true) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 48 48"); svg.setAttribute("width", size); svg.setAttribute("height", size); svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect width="48" height="48" rx="12" fill="#ffc21a"/><path d="M13 24h22" stroke="#241a00" stroke-width="3.5" stroke-linecap="round"/><circle cx="13" cy="24" r="4.5" fill="#241a00"/><rect x="30.5" y="19.5" width="9" height="9" rx="2" fill="#241a00"/>';
    return h("span", { class: "logo" }, svg, word ? h("span", { class: "wordmark" }, "Cab", h("b", null, "Link")) : null);
}
export const skeleton = (n = 3) => h("div", { class: "list", "aria-busy": "true" }, Array.from({ length: n }, () => h("div", { class: "item" }, h("span", { class: "skel", style: "width:40px;height:40px;border-radius:12px" }), h("span", { class: "grow" }, h("span", { class: "skel", style: "width:60%;height:14px;display:block;margin-bottom:8px" }), h("span", { class: "skel", style: "width:35%;height:11px;display:block" })))));
export const initials = name => String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
export const avatar = name => h("span", { class: "avatar", "aria-hidden": "true" }, initials(name));
export const plate = text => !String(text || "").trim() ? null : h("span", { class: "plate" }, String(text || "").toUpperCase());
