import { h, icon, toast, busy, showPhone, cleanPhone } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen, riderTabs, driverTabs } from "../shell.js";
import { openSheet } from "./common.js";
import { langSwitch } from "./welcome.js";

let installEvent = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvent = e; });

const field = (id, label, props) => { const input = h("input", Object.assign({ id }, props)); return { input, el: h("div", { class: "field" }, h("label", { for: id }, label), input) }; };

export async function account() {
    const me = store.account, isDriver = me.role === "APPROVED_DRIVER", isAdmin = me.role === "ADMIN";
    const body = h("div", null);
    const el = screen({ title: t("account"), body, tabs: isAdmin ? null : isDriver ? driverTabs() : riderTabs(), back: isAdmin ? () => go("/admin") : null });
    const row = (ic, title, sub, fn) => h("button", { class: "item", onClick: fn }, h("span", { class: "lead" }, icon(ic)), h("span", { class: "grow" }, h("b", null, title), sub ? h("small", null, sub) : null));

    body.append(h("h1", null, me.name), h("p", { class: "muted" }, "+267 " + showPhone(me.phone) + (isDriver ? " · " + t("driver") : "")),
        h("div", { class: "list" },
            row("user", t("name"), me.name, () => {
                const f = field("nm", t("name"), { value: me.name, maxlength: "60" });
                const save = h("button", { class: "btn" }, t("save"));
                const close = openSheet(h("h2", null, t("name")), f.el, save);
                save.onclick = () => busy(save, async () => { try { const r = await api("/auth/profile", { method: "PATCH", body: { name: f.input.value } }); store.setAccount(r.account); close(); go("/account", true); setTimeout(() => location.reload(), 0); } catch (e) { toast(e.message, "error"); } });
            }),
            row("shield", t("changePin"), "", () => {
                const a = field("p1", t("currentPin"), { type: "password", inputmode: "numeric", maxlength: "6" }), b = field("p2", t("newPin"), { type: "password", inputmode: "numeric", maxlength: "6" });
                const save = h("button", { class: "btn" }, t("save"));
                const close = openSheet(h("h2", null, t("changePin")), a.el, b.el, save);
                save.onclick = () => busy(save, async () => {
                    if (!/^\d{4,6}$/.test(b.input.value)) return toast(t("pinShort"), "error");
                    try { await api("/auth/pin", { method: "PATCH", body: { currentPin: a.input.value, newPin: b.input.value } }); toast(t("saved"), "ok"); close(); } catch (e) { toast(e.message, "error"); }
                });
            }),
            isDriver ? row("phone", t("payoutNumber"), me.payoutNumber ? "+267 " + showPhone(me.payoutNumber) : t("payoutSub"), () => {
                const f = field("po", t("payoutNumber"), { type: "tel", inputmode: "numeric", value: me.payoutNumber || "" });
                const save = h("button", { class: "btn" }, t("save"));
                const close = openSheet(h("h2", null, t("payoutNumber")), h("p", { class: "muted small" }, t("payoutSub")), f.el, save);
                save.onclick = () => busy(save, async () => {
                    try { const r = await api("/auth/profile", { method: "PATCH", body: { payoutNumber: f.input.value } }); store.setAccount(r.account); toast(t("saved"), "ok"); close(); location.reload(); }
                    catch (e) { toast(e.message, "error"); }
                });
            }) : null,
            row("wallet", t("wallet"), me.walletAddress ? me.walletAddress.slice(0, 8) + "…" + me.walletAddress.slice(-4) : t("walletHint"), () => {
                const f = field("w", t("walletHint"), { value: me.walletAddress || "", autocomplete: "off", spellcheck: "false" });
                const save = h("button", { class: "btn" }, t("save"));
                const close = openSheet(h("h2", null, t("wallet")), h("p", { class: "muted small" }, t("rewards") + ": THB"), f.el, save);
                save.onclick = () => busy(save, async () => {
                    const w = f.input.value.trim();
                    if (!/^0x[a-fA-F0-9]{40}$/.test(w)) return toast("Wallet address must start with 0x and be 42 characters", "error");
                    try {
                        if (isDriver) await api("/driver/" + encodeURIComponent(me.id) + "/wallet", { method: "POST", body: { wallet: w } });
                        else await api("/auth/wallet", { method: "PATCH", body: { walletAddress: w } });
                        store.setAccount(Object.assign({}, me, { walletAddress: w })); toast(t("saved"), "ok"); close();
                    } catch (e) { toast(e.message, "error"); }
                });
            }),
            row("phone", t("safetyContact"), store.contact ? store.contact.name : t("safetyContactSub"), () => {
                const n = field("cn", t("contactName"), { value: (store.contact || {}).name || "", maxlength: "40" }), p = field("cp", t("contactPhone"), { type: "tel", inputmode: "numeric", value: (store.contact || {}).phone || "" });
                const save = h("button", { class: "btn" }, t("save"));
                const close = openSheet(h("h2", null, t("safetyContact")), h("p", { class: "muted small" }, t("safetyContactSub")), n.el, p.el, save);
                save.onclick = () => { const ph = cleanPhone(p.input.value); if (!ph) return toast(t("badPhone"), "error"); store.setContact({ name: n.input.value.trim(), phone: ph }); toast(t("saved"), "ok"); close(); };
            })),
        h("h3", null, t("language")), langSwitch(),
        installEvent ? h("button", { class: "btn quiet", style: "margin-top:20px", onClick: async () => { installEvent.prompt(); installEvent = null; } }, t("install")) : null,
        h("button", { class: "btn ghost", style: "margin-top:28px", onClick: () => { store.clear(); go("/welcome"); } }, t("logout")));
    return { el };
}
