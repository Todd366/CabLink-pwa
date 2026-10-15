// Server-side geography: distance maths and place lookup, so the server can
// rank ride requests by how close each one is to a driver.
const PLACES = require("./places.json");

const rad = v => v * Math.PI / 180;
function haversineKm(a, b) {
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(x));
}

// "(lat,lng)" inside a label, or the longest known place name in it.
function coordsFromLabel(label) {
    const text = String(label || "");
    const m = /\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/.exec(text);
    if (m) return { lat: +m[1], lng: +m[2] };
    let best = null;
    for (const p of PLACES) if (text.toLowerCase().includes(p.name.toLowerCase()) && (!best || p.name.length > best.name.length)) best = p;
    return best ? { lat: best.lat, lng: best.lng } : null;
}

module.exports = { haversineKm, coordsFromLabel, PLACES };
