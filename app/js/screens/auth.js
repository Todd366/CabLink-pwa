import { h, cleanPhone, busy, toast } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen } from "../shell.js";

function phoneField(value) {
    const input = h("input", { id: "phone", type: "tel", inputmode: "numeric", autocomplete: "tel-national", placeholder: t("phoneHint"), value: value || "", maxlength: "16" });
    const err = h("div", { class: "err", role: "alert" });
    return { input, err, el: h("div", { class: "field" }, h("label", { for: "phone" }, t("phone")), h("div", { class: "phone" }, h("span", null, "+267"), input), err) };
}
function pinField(id, label, hint) {
    const input = h("input", { id, type: "password", inputmode: "numeric", autocomplete: id === "pin" ? "current-password" : "new-password", maxlength: "6", placeholder: hint || t("pinHint") });
    const err = h("div", { class: "err", role: "alert" });
    return { input, err, el: h("div", { class: "field" }, h("label", { for: id }, label), input, err) };
}
const validPin = v => /^\d{4,6}$/.test(v);

export async function afterLogin(account) {
    store.setAccount(account);
    go("/", true);
}

export function login() {
    const phone = phoneField(), pin = pinField("pin", t("pin"));
    const submit = h("button", { class: "btn", type: "button" }, t("login"));
    submit.onclick = () => busy(submit, async () => {
        phone.err.textContent = pin.err.textContent = "";
        const p = cleanPhone(phone.input.value);
        if (!p) return void (phone.err.textContent = t("badPhone"));
        if (!validPin(pin.input.value)) return void (pin.err.textContent = t("pinShort"));
        try {
            const r = await api("/auth/login", { method: "POST", body: { phone: p, pin: pin.input.value }, auth: false });
            store.setSession(r.token, r.account);
            await afterLogin(r.account);
        } catch (e) { toast(e.message, "error"); }
    });
    const el = screen({
        back: () => go("/welcome"),
        body: [h("h1", null, store.intent === "driver" ? t("driveWith") : t("login")), phone.el, pin.el],
        actions: [submit, h("button", { class: "link", onClick: () => go("/auth/register") }, t("newHere"))]
    });
    return { el };
}

export function register() {
    const name = h("input", { id: "name", autocomplete: "name", maxlength: "60" });
    const nameErr = h("div", { class: "err", role: "alert" });
    const phone = phoneField(), pin = pinField("pin", t("pin")), pin2 = pinField("pin2", t("pinConfirm"));
    const submit = h("button", { class: "btn", type: "button" }, t("register"));
    submit.onclick = () => busy(submit, async () => {
        [nameErr, phone.err, pin.err, pin2.err].forEach(e => e.textContent = "");
        const p = cleanPhone(phone.input.value);
        if (!name.value.trim()) return void (nameErr.textContent = t("required"));
        if (!p) return void (phone.err.textContent = t("badPhone"));
        if (!validPin(pin.input.value)) return void (pin.err.textContent = t("pinShort"));
        if (pin.input.value !== pin2.input.value) return void (pin2.err.textContent = t("pinMismatch"));
        try {
            await api("/auth/register", { method: "POST", body: { name: name.value.trim(), phone: p, pin: pin.input.value }, auth: false });
            const r = await api("/auth/login", { method: "POST", body: { phone: p, pin: pin.input.value }, auth: false });
            store.setSession(r.token, r.account);
            await afterLogin(r.account);
        } catch (e) { toast(e.message, "error"); }
    });
    const el = screen({
        back: () => go("/auth/login"),
        body: [h("h1", null, t("register")),
            h("div", { class: "field" }, h("label", { for: "name" }, t("name")), name, nameErr), phone.el, pin.el, pin2.el],
        actions: [submit, h("button", { class: "link", onClick: () => go("/auth/login") }, t("haveAccount"))]
    });
    return { el };
}
