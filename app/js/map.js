// Optional maps (Leaflet + OpenStreetMap). Loaded only when someone taps
// "Show map", so people on weak or expensive data never pay for it.
// If the library or tiles cannot load, the app keeps working without it.
const LEAFLET = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
let loading = null;

export function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
        const css = document.createElement("link");
        css.rel = "stylesheet"; css.href = LEAFLET + "leaflet.min.css"; document.head.append(css);
        const js = document.createElement("script");
        js.src = LEAFLET + "leaflet.min.js"; js.async = true;
        js.onload = () => (window.L ? resolve(window.L) : reject(new Error("map library missing")));
        js.onerror = () => { loading = null; reject(new Error("offline")); };
        document.head.append(js);
    });
    return loading;
}

const dot = (L, cls, label) => L.divIcon({ className: "mk " + cls, html: "<span>" + (label || "") + "</span>", iconSize: [28, 28], iconAnchor: [14, 14] });
const GABORONE = [-24.6541, 25.9086];

async function base(container, { center = GABORONE, zoom = 12 } = {}) {
    try {
        const L = await loadLeaflet();
        container.replaceChildren();
        const map = L.map(container, { zoomControl: true, attributionControl: true }).setView(center, zoom);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map);
        setTimeout(() => map.invalidateSize(), 50);
        return { L, map };
    } catch (e) {
        container.textContent = "Map not available right now. You can continue without it.";
        container.classList.add("map-off");
        return null;
    }
}

// Route preview / live tracking. update() can be called repeatedly.
export async function routeMap(container, { from, to } = {}) {
    const m = await base(container);
    if (!m) return { update() {}, destroy() {} };
    const { L, map } = m;
    const marks = {};
    const place = (key, pt, icon) => {
        if (!pt) { if (marks[key]) { marks[key].remove(); delete marks[key]; } return; }
        if (marks[key]) marks[key].setLatLng([pt.lat, pt.lng]); else marks[key] = L.marker([pt.lat, pt.lng], { icon, interactive: false }).addTo(map);
    };
    const fit = () => {
        const pts = Object.values(marks).map(x => x.getLatLng());
        if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15 });
        else if (pts.length === 1) map.setView(pts[0], 14);
    };
    const update = ({ from, to, driver } = {}) => {
        place("from", from, dot(L, "mk-a", "A")); place("to", to, dot(L, "mk-b", "B")); place("car", driver, dot(L, "mk-car", "●"));
        if (!update.fitted) { fit(); update.fitted = Object.keys(marks).length > 1; }
    };
    update({ from, to });
    return { update, destroy: () => map.remove() };
}

// Drop-a-pin picker for places with no address. Returns {get(), destroy()}.
export async function pinPicker(container, start, onMove) {
    const m = await base(container, { center: start ? [start.lat, start.lng] : GABORONE, zoom: start ? 14 : 11 });
    if (!m) return null;
    const { L, map } = m;
    const marker = L.marker(map.getCenter(), { draggable: true, icon: dot(L, "mk-b", "●") }).addTo(map);
    const moved = () => { const p = marker.getLatLng(); onMove({ lat: p.lat, lng: p.lng }); };
    marker.on("dragend", moved);
    map.on("click", e => { marker.setLatLng(e.latlng); moved(); });
    moved();
    return { get: () => { const p = marker.getLatLng(); return { lat: p.lat, lng: p.lng }; }, destroy: () => map.remove() };
}
