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

const KM_PER_LITRE = { standard: 14, premium: 10, xl: 8, moto: 28, eco: 18, quiet: 12, delivery: 20 };
const MAX_KM = 1500;

function calcFare({ vehicle, distanceKm, stops }) {
    const km = Math.min(Math.max(Number(distanceKm) || 0, 0), MAX_KM);
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

module.exports = { calcFare, ECONOMY, KM_PER_LITRE, MAX_KM };
