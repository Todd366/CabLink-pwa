// Offline gazetteer of Botswana towns and villages.
// Most villages have no street addresses, so riders pick a
// place by name and the distance is computed on the phone —
// no maps, no data, works with no signal.
// Coordinates are approximate (village centres); the server
// still recomputes the fare and drivers confirm the pickup.

export const PLACES = [
    // [name, region, lat, lng]
    ["Gaborone", "South-East", -24.6541, 25.9086],
    ["Gaborone Main Mall", "South-East", -24.6537, 25.9112],
    ["Sir Seretse Khama Airport", "South-East", -24.5552, 25.9182],
    ["University of Botswana", "South-East", -24.6628, 25.9392],
    ["Phakalane", "South-East", -24.5830, 25.9190],
    ["Mogoditshane", "Kweneng", -24.6300, 25.8700],
    ["Tlokweng", "South-East", -24.6800, 26.0200],
    ["Gabane", "Kweneng", -24.6667, 25.7833],
    ["Ramotswa", "South-East", -24.8667, 25.8667],
    ["Lobatse", "Southern", -25.2233, 25.6783],
    ["Kanye", "Southern", -24.9667, 25.3333],
    ["Moshupa", "Southern", -24.7667, 25.4333],
    ["Otse", "South-East", -25.0333, 25.7167],
    ["Molepolole", "Kweneng", -24.4067, 25.4950],
    ["Thamaga", "Kweneng", -24.6667, 25.5333],
    ["Letlhakeng", "Kweneng", -24.1000, 25.0300],
    ["Lentsweletau", "Kweneng", -24.2333, 25.6667],
    ["Mochudi", "Kgatleng", -24.3833, 26.1500],
    ["Oodi", "Kgatleng", -24.4700, 26.0300],
    ["Jwaneng", "Southern", -24.6000, 24.7300],
    ["Mahalapye", "Central", -23.1000, 26.8167],
    ["Palapye", "Central", -22.5467, 27.1250],
    ["Serowe", "Central", -22.3833, 26.7167],
    ["Selebi-Phikwe", "Central", -22.0000, 27.8500],
    ["Mmadinare", "Central", -21.8667, 27.7500],
    ["Bobonong", "Central", -21.9667, 28.4333],
    ["Letlhakane", "Central", -21.4167, 25.5833],
    ["Orapa", "Central", -21.3000, 25.3667],
    ["Rakops", "Central", -21.0333, 24.3667],
    ["Tonota", "North-East", -21.4500, 27.4667],
    ["Francistown", "North-East", -21.1700, 27.5084],
    ["Tutume", "Central", -20.4500, 27.0167],
    ["Nata", "Central", -20.2167, 26.1833],
    ["Sowa", "Central", -20.5667, 26.2167],
    ["Maun", "North-West", -19.9833, 23.4167],
    ["Gumare", "North-West", -19.3667, 22.1667],
    ["Shakawe", "North-West", -18.3667, 21.8500],
    ["Kasane", "Chobe", -17.8000, 25.1500],
    ["Kazungula", "Chobe", -17.7833, 25.2667],
    ["Pandamatenga", "Chobe", -18.5333, 25.6167],
    ["Ghanzi", "Ghanzi", -21.7000, 21.6500],
    ["Hukuntsi", "Kgalagadi", -23.9833, 21.7667],
    ["Tsabong", "Kgalagadi", -26.0167, 22.4000],
    ["Werda", "Kgalagadi", -25.2667, 23.2833]
].map(([name, region, lat, lng]) => ({ name, region, lat, lng }));

const toRad = v => v * Math.PI / 180;
export function haversineKm(a, b) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
}

// Roads are longer than straight lines. Town streets wind more.
export function roadKm(a, b) {
    const d = haversineKm(a, b);
    const factor = d < 12 ? 1.4 : 1.25;
    return Math.max(1, Math.round(d * factor * 10) / 10);
}

export function nearest(point, maxKm = 20) {
    let best = null, bd = Infinity;
    for (const p of PLACES) {
        const d = haversineKm(point, p);
        if (d < bd) { bd = d; best = p; }
    }
    return bd <= maxKm ? best : null;
}

const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "");
export function search(q) {
    const n = norm(q).trim();
    if (!n) return PLACES.slice(0, 8);
    return PLACES.filter(p => norm(p.name).includes(n) || norm(p.region).includes(n))
        .sort((a, b) => (norm(a.name).startsWith(n) ? 0 : 1) - (norm(b.name).startsWith(n) ? 0 : 1))
        .slice(0, 12);
}

// Label sent to the server for a GPS pickup.
export function describeGps(lat, lng) {
    const near = nearest({ lat, lng });
    const coords = lat.toFixed(5) + "," + lng.toFixed(5);
    return (near ? "My location, near " + near.name : "My location") + " (" + coords + ")";
}

// Recover coordinates from a ride label: either "(lat,lng)" written by GPS or
// pin pickup, or a known place name from the gazetteer.
export function coordsFromLabel(label) {
    const text = String(label || "");
    const m = /\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/.exec(text);
    if (m) return { lat: +m[1], lng: +m[2] };
    let best = null;
    for (const p of PLACES) if (text.toLowerCase().includes(p.name.toLowerCase()) && (!best || p.name.length > best.name.length)) best = p;
    return best ? { lat: best.lat, lng: best.lng } : null;
}
export function describePin(lat, lng) {
    const near = nearest({ lat, lng }, 25);
    return (near ? "Pin near " + near.name : "Pin") + " (" + lat.toFixed(5) + "," + lng.toFixed(5) + ")";
}
