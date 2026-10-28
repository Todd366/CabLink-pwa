import { h, icon, toast, busy, spinner, ago } from "../ui.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { go } from "../router.js";
import { screen, riderTabs, driverTabs } from "../shell.js";

const KIND = { RIDE_CLAIM: "Ride reward", REFERRAL_BONUS: "Referral bonus", THB_REWARD: "Driver reward" };
const STATE = { CONFIRMED: "Paid", PENDING_TRANSFER: "Sending", SIMULATION: "Test mode, no real transfer", FAILED: "Could not be sent", SKIPPED: "Waiting for your wallet" };
const fmt = n => (Math.round(n * 100) / 100).toString();

export async function rewards() {
    const me = store.account;
    const body = h("div", null, spinner());
    const el = screen({ title: t("rewards"), back: () => go("/account"), body, tabs: me.role === "APPROVED_DRIVER" ? driverTabs() : riderTabs() });
    const draw = async () => {
        let d;
        try { d = await api("/rewards/mine"); } catch (e) { return void body.replaceChildren(h("div", { class: "empty" }, h("b", null, e.message))); }
        const dots = h("div", { style: "display:flex;gap:8px;margin:8px 0 2px" }, Array.from({ length: 7 }, (_, i) => h("span", { style: "width:14px;height:14px;border-radius:50%;background:" + (i < Math.min(d.streak, 7) ? "var(--taxi)" : "var(--line)") })));
        const kids = [
            h("div", { class: "big-stat" },
                h("div", null, h("b", null, fmt(d.confirmed) + " THB"), h("small", { class: "muted" }, "Received")),
                h("div", null, h("b", null, fmt(d.pending) + " THB"), h("small", { class: "muted" }, "On the way"))),
            d.testMode ? h("p", { class: "muted small" }, fmt(d.testMode) + " THB recorded in test mode (not sent on the blockchain).") : null,
            d.waiting ? h("p", { class: "small muted" }, fmt(d.waiting) + " THB is waiting for your wallet. Add it in Account and it can be sent.") : null,
            d.problem ? h("p", { class: "small", style: "color:var(--bad)" }, fmt(d.problem) + " THB could not be sent. Check your wallet address in Account.") : null,
            d.hasWallet
                ? h("div", { class: "list", style: "margin-bottom:14px" }, h("div", { class: "item", style: "cursor:default" }, h("span", { class: "lead" }, icon("wallet")), h("span", { class: "grow" }, h("b", null, "Wallet connected"), h("small", null, d.wallet + " · BSC Testnet"))))
                : h("button", { class: "status", style: "width:100%;border:0;cursor:pointer;margin-bottom:14px;background:#fff3e0;color:var(--warn)", onClick: () => go("/account") }, icon("alert"), "Add your wallet in Account to receive THB"),
            h("div", { class: "list", style: "margin-bottom:14px" }, h("div", { class: "item", style: "cursor:default" }, h("span", { class: "lead" }, icon("star")),
                h("span", { class: "grow" }, h("b", null, d.streak + (d.streak === 1 ? " day streak" : " day streak")), h("small", null, d.ridesDone + " " + t("tripsDone")), dots)))
        ];
        if (d.claimable.length) {
            kids.push(h("h3", null, "Ready to claim"), h("div", { class: "list" }, d.claimable.map(c => {
                const b = h("button", { class: "chip" }, "Claim 1 THB");
                b.onclick = () => busy(b, async () => {
                    try { const r = await api("/rewards/claim-ride", { method: "POST", body: { rideId: c.id } }); toast(r.status === "ALREADY_CLAIMED" ? "Already claimed" : t("claimed"), "ok"); draw(); }
                    catch (e) { toast(/wallet/i.test(e.message) ? t("needWallet") : e.message, "error"); }
                });
                return h("div", { class: "item", style: "cursor:default" }, h("span", { class: "grow" }, h("b", null, c.dropoff), h("small", null, "P" + c.fare)), b);
            })));
        }
        if (d.referral.code) {
            const link = location.origin + "/?ref=" + d.referral.code;
            kids.push(h("h3", null, "Invite friends"), h("div", { class: "list" },
                h("button", { class: "item", onClick: () => window.open("https://wa.me/?text=" + encodeURIComponent("Join me on CabLink, rides across Botswana. Use my code " + d.referral.code + ": " + link), "_blank", "noopener") },
                    h("span", { class: "lead" }, icon("share")), h("span", { class: "grow" }, h("b", null, "Code " + d.referral.code), h("small", null, "You earn " + d.referral.bonusAmount + " THB when a friend completes their first ride · " + d.referral.invited + " invited, " + d.referral.bonusesPaid + " paid")))));
        }
        kids.push(h("h3", null, "History"), d.items.length ? h("div", { class: "list" }, d.items.map(i => h("div", { class: "item", style: "cursor:default" },
            h("span", { class: "grow" }, h("b", null, (KIND[i.type] || i.type) + " · " + fmt(i.amount) + " THB"), h("small", null, STATE[i.status] || i.status)),
            i.txHash && i.status === "CONFIRMED" ? h("a", { class: "chip", href: "https://testnet.bscscan.com/tx/" + i.txHash, target: "_blank", rel: "noopener" }, "View") : null)))
            : h("div", { class: "empty" }, h("b", null, "No rewards yet"), "Complete a trip and claim your first THB."));
        body.replaceChildren(...kids.filter(Boolean));
    };
    draw();
    return { el };
}
