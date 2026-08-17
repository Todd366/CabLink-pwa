import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons reference image files via a
// bundler-relative path that breaks under Vite. Point them at
// the CDN copies instead — small, reliable, no build config needed.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const driverIcon = L.divIcon({
    className: "cablink-driver-marker",
    html: "🚕",
    iconSize: [28, 28]
});

/**
 * LiveMap
 *
 * props:
 *  - pickup:   { lat, lng, name }
 *  - dropoff:  { lat, lng, name }
 *  - driver:   { lat, lng, name } | null   (live position, if assigned)
 *  - height:   CSS height string (default "300px")
 */
export default function LiveMap({ pickup, dropoff, driver, height = "300px" }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layersRef = useRef({ pickup: null, dropoff: null, driver: null, route: null });

    // Initialize map once.
    useEffect(() => {
        if (mapRef.current || !containerRef.current) return;

        const map = L.map(containerRef.current, {
            zoomControl: true
        }).setView([-24.6282, 25.9231], 12); // default: Gaborone CBD

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        ).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers/route whenever pickup, dropoff, or driver change.
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const layers = layersRef.current;
        const bounds = [];

        if (pickup) {
            if (layers.pickup) map.removeLayer(layers.pickup);
            layers.pickup = L.marker([pickup.lat, pickup.lng])
                .addTo(map)
                .bindPopup(`Pickup: ${pickup.name || "Passenger"}`);
            bounds.push([pickup.lat, pickup.lng]);
        }

        if (dropoff) {
            if (layers.dropoff) map.removeLayer(layers.dropoff);
            layers.dropoff = L.marker([dropoff.lat, dropoff.lng])
                .addTo(map)
                .bindPopup(`Dropoff: ${dropoff.name || "Destination"}`);
            bounds.push([dropoff.lat, dropoff.lng]);
        }

        if (driver) {
            if (layers.driver) map.removeLayer(layers.driver);
            layers.driver = L.marker([driver.lat, driver.lng], { icon: driverIcon })
                .addTo(map)
                .bindPopup(`Driver: ${driver.name || "En route"}`);
            bounds.push([driver.lat, driver.lng]);
        } else if (layers.driver) {
            map.removeLayer(layers.driver);
            layers.driver = null;
        }

        if (layers.route) {
            map.removeLayer(layers.route);
            layers.route = null;
        }

        let cancelled = false;

        function drawStraightLineFallback() {
            if (cancelled || !pickup || !dropoff) return;
            if (layers.route) map.removeLayer(layers.route);
            layers.route = L.polyline(
                [
                    [pickup.lat, pickup.lng],
                    [dropoff.lat, dropoff.lng]
                ],
                { color: "#0ea5a5", weight: 4, opacity: 0.6, dashArray: "6 6" }
            ).addTo(map);
        }

        if (pickup && dropoff) {
            // Try to fetch a real road route from OSRM's free public
            // routing API. If it's unreachable (offline, rate-limited),
            // fall back to a straight-line indicator so the map still
            // shows something useful.
            const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}` +
                `?overview=full&geometries=geojson`;

            fetch(url)
                .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
                .then(data => {
                    if (cancelled) return;

                    const coords =
                        data?.routes?.[0]?.geometry?.coordinates;

                    if (!coords || coords.length < 2) {
                        drawStraightLineFallback();
                        return;
                    }

                    if (layers.route) map.removeLayer(layers.route);

                    // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
                    const latLngs = coords.map(([lng, lat]) => [lat, lng]);

                    layers.route = L.polyline(latLngs, {
                        color: "#0ea5a5",
                        weight: 5,
                        opacity: 0.85
                    }).addTo(map);

                    map.fitBounds(latLngs, { padding: [40, 40] });
                })
                .catch(() => drawStraightLineFallback());
        }

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [40, 40] });
        } else if (bounds.length === 1) {
            map.setView(bounds[0], 14);
        }

        return () => {
            cancelled = true;
        };
    }, [pickup, dropoff, driver]);

    return (
        <div
            ref={containerRef}
            style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden" }}
        />
    );
}
