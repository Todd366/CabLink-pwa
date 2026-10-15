import { h, icon } from "../ui.js";
import { t } from "../i18n.js";
import { go } from "../router.js";
import { screen } from "../shell.js";

// The BSTM ecosystem CabLink belongs to (links from the original hub).
const LINKS = [
    ["BSTM Marketplace", "Digital Mall: shopping, business tasks, deliveries", "https://todd366.github.io/bstm-marketplace-app/index.html"],
    ["THoBoCoin", "Blockchain economy", "https://thobocoin-project-frontend.vercel.app/"],
    ["FlowLedger", "Business management", "https://bstm-flowledger.vercel.app/"],
    ["Business Hub", "Business services", "https://business-hub-bstm.vercel.app/"],
    ["BSTM ELOS", "Learning intelligence system", "https://todd366.github.io/bstm-elos/"],
    ["BSTM Ecosystem Network", "Network map", "https://todd366.github.io/bstm-ecosystem-network/"],
    ["BSTM Trading Department", "Financial intelligence", "https://todd366.github.io/BSTM-Trading-Department-Room/"]
];

export function ecosystem() {
    const el = screen({
        title: t("ecosystem"), back: () => go("/account"),
        body: [h("p", { class: "muted" }, t("ecosystemSub")),
            h("div", { class: "list" }, LINKS.map(([name, sub, url]) =>
                h("a", { class: "item", href: url, target: "_blank", rel: "noopener noreferrer" },
                    h("span", { class: "lead" }, icon("box")), h("span", { class: "grow" }, h("b", null, name), h("small", null, sub)))))]
    });
    return { el };
}
