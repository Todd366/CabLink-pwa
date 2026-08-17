import React, { useState, useEffect, useRef } from "react";

import PassengerTripStatus from "../components/passenger_trip_status.jsx";
import THBRewardPanel from "../components/thb_reward_panel.jsx";
import LiveMap from "../components/LiveMap.jsx";
import { GABORONE_LOCATIONS, findLocation, distanceKm } from "../config/gaborone_locations.js";

const POLL_INTERVAL_MS = 4000;

export default function PassengerRide() {
    const [pickupId, setPickupId] = useState("cbd");
    const [dropoffId, setDropoffId] = useState("airport");
    const [ride, setRide] = useState(null);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(false);
    const pollRef = useRef(null);

    const pickup = findLocation(pickupId);
    const dropoff = findLocation(dropoffId);

    const estimatedKm = pickup && dropoff ? distanceKm(pickup, dropoff) : 0;
    const estimatedFare = Math.max(20, Math.round(estimatedKm * 6)); // rough BWP/km estimate

    async function requestRide() {
        setError(null);
        setBooking(true);

        try {
            const res = await fetch("/api/rides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    passenger: "USER001",
                    pickup: pickup.name,
                    dropoff: dropoff.name,
                    distanceKm: Number(estimatedKm.toFixed(1)),
                    fare: estimatedFare
                })
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Could not create ride");
                setBooking(false);
                return;
            }

            setRide(data.ride);
        } catch (err) {
            setError("Network error creating ride — check your connection.");
            setBooking(false);
        }
    }

    // Poll the canonical ride while it's active, so status/driver/reward
    // update live without the passenger refreshing anything.
    useEffect(() => {
        if (!ride || !ride.id) return;

        if (pollRef.current) clearInterval(pollRef.current);

        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/rides/${ride.id}`);
                const data = await res.json();

                if (data.success) {
                    setRide(data.ride);

                    if (
                        data.ride.status === "COMPLETED" ||
                        data.ride.status === "CANCELLED"
                    ) {
                        clearInterval(pollRef.current);
                    }
                }
            } catch (_) {
                // Transient network error during polling — try again next tick.
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(pollRef.current);
    }, [ride?.id]);

    const rideActive = ride && !["COMPLETED", "CANCELLED"].includes(ride.status);

    // Driver marker: once a driver's device reports its live location via
    // /api/driver/:id/location, that would be threaded in here. Until that
    // pipeline is connected, show the driver at the pickup point once
    // assigned as a placeholder so the map isn't empty mid-ride.
    const driverMarker =
        ride && ride.driverId && rideActive
            ? { lat: pickup.lat, lng: pickup.lng, name: ride.driverName || ride.driverId }
            : null;

    return (
        <div className="cablink-screen">
            <h1>🚖 Request a Ride</h1>

            {!rideActive && (
                <div className="cab-card">
                    <label>
                        Pickup
                        <select value={pickupId} onChange={e => setPickupId(e.target.value)}>
                            {GABORONE_LOCATIONS.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Dropoff
                        <select value={dropoffId} onChange={e => setDropoffId(e.target.value)}>
                            {GABORONE_LOCATIONS.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </label>

                    <p>Estimated distance: {estimatedKm.toFixed(1)} km — Estimated fare: P{estimatedFare}</p>

                    <button onClick={requestRide} disabled={booking || pickupId === dropoffId}>
                        {booking ? "Booking..." : "Book Ride"}
                    </button>

                    {pickupId === dropoffId && (
                        <p className="cab-warning">Pickup and dropoff can't be the same place.</p>
                    )}

                    {error && <p className="cab-error">{error}</p>}
                </div>
            )}

            <LiveMap pickup={pickup} dropoff={dropoff} driver={driverMarker} />

            <PassengerTripStatus
                rideId={ride?.id}
                status={ride?.status || "Ready"}
                driver={ride?.driverName || ride?.driverId}
            />

            {ride?.status === "COMPLETED" && (
                <THBRewardPanel
                    reward={ride.reward?.amount ?? 0}
                    currency="THB"
                    status={ride.reward?.status || "Pending"}
                />
            )}

            {ride?.status === "COMPLETED" && (
                <button onClick={() => setRide(null)}>Book another ride</button>
            )}
        </div>
    );
}
