import { haversineKm } from "./places.js";

// Honest, simple estimate: straight-line distance x road factor at a typical
// mixed town/rural speed. Shown as "about N min", never as a promise.
export function etaMinutes(driver, pickup) {
    if (!driver || !pickup) return null;
    const km = haversineKm(driver, pickup) * 1.3;
    if (!Number.isFinite(km) || km > 300) return null;
    return Math.max(1, Math.round(km / 35 * 60));
}
