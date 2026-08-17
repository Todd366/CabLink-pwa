// ============================================================
// GABORONE PILOT LOCATIONS
//
// Curated landmark list with approximate coordinates.
// This exists so the map / fare engine have real lat/lng to
// work with during the pilot, without requiring a paid
// geocoding API key. Coordinates are approximate (landmark
// centroid) — good enough for pickup/dropoff selection and
// distance estimation, not survey-accurate.
//
// TODO (post-pilot): replace with a real geocoding provider
// (e.g. OpenStreetMap Nominatim) once volume justifies it.
// ============================================================

export const GABORONE_LOCATIONS = [
    { id: "cbd", name: "Gaborone CBD", lat: -24.6282, lng: 25.9231 },
    { id: "airport", name: "Sir Seretse Khama Airport", lat: -24.5559, lng: 25.9182 },
    { id: "game_city", name: "Game City Mall", lat: -24.6541, lng: 25.9087 },
    { id: "riverwalk", name: "Riverwalk Mall", lat: -24.6698, lng: 25.9159 },
    { id: "ub", name: "University of Botswana", lat: -24.6839, lng: 25.9506 },
    { id: "broadhurst", name: "Broadhurst", lat: -24.6280, lng: 25.9500 },
    { id: "bus_rank", name: "Gaborone Bus Rank", lat: -24.6560, lng: 25.9080 },
    { id: "main_mall", name: "Main Mall", lat: -24.6560, lng: 25.9145 },
    { id: "phakalane", name: "Phakalane", lat: -24.5850, lng: 25.9500 },
    { id: "gaborone_west", name: "Gaborone West", lat: -24.6600, lng: 25.8950 }
];

export function findLocation(id) {
    return GABORONE_LOCATIONS.find(loc => loc.id === id) || null;
}

// Straight-line distance in km (haversine). Real road distance
// will differ, but this is a reasonable fare-estimation input
// until a routing engine is wired in.
export function distanceKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
