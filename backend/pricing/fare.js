// ============================================================
// SERVER-SIDE FARE — the only fare that counts.
// The client shows an estimate; the server recomputes it so a
// tampered request can never lower a price or inflate rewards.
// Tariff is cost-based (fuel + upkeep + driver margin + fee).
// Override at deploy time with FUEL_PRICE_BWP etc.
// ============================================================
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d);

const ECONOMY = {
    fuelPrice: num(process.env.FUEL_PRICE_BWP, 14.8),
    maintenancePerKm: 0.45,
    tyresPerKm: 0.18,
    servicePerKm: 0.22,
    driverMarginPct: 0.35,
    platformFeePct: 0.12,
    minimumFare: 15,
    stopFee: 5,
    ruralPerKmUplift: 0.2   // long empty return legs outside towns
};

// BSTM delivery rule (from the original delivery engine): P20 base + P5 per km,
// 80% to the driver, 20% to BSTM.
const DELIVERY = { base: 20, perKm: 5, driverShare: 0.8 };

const KM_PER_LITRE = { standard: 14, premium: 10, xl: 8, moto: 28, eco: 18, quiet: 12, delivery: 20 };
const MAX_KM = 1500;

function calcFare({ vehicle, distanceKm, stops, taskType }) {
    const km = Math.min(Math.max(Number(distanceKm) || 0, 0), MAX_KM);
    if (taskType === "delivery") {
        const total = Math.round(DELIVERY.base + DELIVERY.perKm * km);
        return { total, distanceKm: +km.toFixed(2), platformFee: +(total * (1 - DELIVERY.driverShare)).toFixed(2), driverShare: +(total * DELIVERY.driverShare).toFixed(2), currency: "BWP" };
    }
    const kmpl = KM_PER_LITRE[vehicle] || KM_PER_LITRE.standard;
    const e = ECONOMY;
    const operating = (km / kmpl) * e.fuelPrice + km * (e.maintenancePerKm + e.tyresPerKm + e.servicePerKm);
    const rural = km > 40 ? (km - 40) * e.ruralPerKmUplift : 0;
    const subtotal = operating + operating * e.driverMarginPct + rural;
    const withFee = subtotal * (1 + e.platformFeePct);
    const extra = (Array.isArray(stops) ? Math.min(stops.length, 3) : 0) * e.stopFee;
    const total = Math.round(Math.max(withFee, e.minimumFare) + extra);
    return {
        total,
        distanceKm: +km.toFixed(2),
        platformFee: +(subtotal * e.platformFeePct).toFixed(2),
        driverShare: +(total - subtotal * e.platformFeePct).toFixed(2),
        currency: "BWP"
    };
}

// What the driver keeps from a fare, for showing on request cards.
function splitFare(fare, taskType) {
    const f = Number(fare) || 0;
    if (taskType === "delivery") return { driverEarns: Math.round(f * DELIVERY.driverShare), platformFee: Math.round(f * (1 - DELIVERY.driverShare)) };
    const fee = f * ECONOMY.platformFeePct / (1 + ECONOMY.platformFeePct);
    return { driverEarns: Math.round(f - fee), platformFee: Math.round(fee) };
}

module.exports = { calcFare, splitFare, DELIVERY, ECONOMY, KM_PER_LITRE, MAX_KM };
