// Client-side fare ESTIMATE. Mirrors backend/pricing/fare.js —
// the server recomputes the real fare, and tests/parity.test.js
// fails if these two ever drift apart.
const E = { fuel: 14.8, maint: 0.45, tyres: 0.18, service: 0.22, margin: 0.35, fee: 0.12, min: 15, stop: 5, rural: 0.2 };
const KMPL = { standard: 14, premium: 10, xl: 8, moto: 28, eco: 18, quiet: 12, delivery: 20 };

export function estimateFare({ vehicle, km, stops = 0, task }) {
    const d = Math.min(Math.max(Number(km) || 0, 0), 1500);
    if (task === "delivery") return Math.round(20 + 5 * d);
    const op = (d / (KMPL[vehicle] || 14)) * E.fuel + d * (E.maint + E.tyres + E.service);
    const rural = d > 40 ? (d - 40) * E.rural : 0;
    const sub = op + op * E.margin + rural;
    return Math.round(Math.max(sub * (1 + E.fee), E.min) + Math.min(stops, 3) * E.stop);
}
