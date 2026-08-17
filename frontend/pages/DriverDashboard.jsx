import React, { useEffect, useState, useRef } from "react";
import LiveMap from "../components/LiveMap.jsx";
import { findLocation } from "../config/gaborone_locations.js";

const POLL_INTERVAL_MS = 4000;
const DRIVER_ID = "DRIVER001"; // TODO: replace with real logged-in driver identity once auth is wired up

// Canonical forward transitions a driver can trigger after accepting.
const NEXT_STATE = {
    DRIVER_ASSIGNED: { label: "Arrived at pickup", state: "DRIVER_ARRIVED" },
    DRIVER_ARRIVED: { label: "Picked up passenger", state: "PICKED_UP" },
    PICKED_UP: { label: "Start trip", state: "STARTED" }
};

export default function DriverDashboard() {
    const [economy, setEconomy] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [availableRides, setAvailableRides] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [error, setError] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [walletInput, setWalletInput] = useState("");
    const [walletSaving, setWalletSaving] = useState(false);
    const [walletError, setWalletError] = useState(null);
    const pollRef = useRef(null);

    useEffect(() => {
        fetch(`/api/driver/${DRIVER_ID}/economy`)
            .then(r => r.json())
            .then(setEconomy)
            .catch(() => {});

        fetch("/api/driver/hotspots")
            .then(r => r.json())
            .then(d => setHotspots(d.hotspots || []))
            .catch(() => {});

        fetch(`/api/driver/${DRIVER_ID}/wallet`)
            .then(r => r.json())
            .then(d => setWallet(d.wallet || null))
            .catch(() => {});
    }, []);

    async function saveWallet() {
        setWalletError(null);
        setWalletSaving(true);

        try {
            const res = await fetch(`/api/driver/${DRIVER_ID}/wallet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet: walletInput.trim() })
            });
            const data = await res.json();

            if (!data.success) {
                setWalletError(data.error || "Could not save wallet");
            } else {
                setWallet(data.wallet);
                setWalletInput("");
            }
        } catch (_) {
            setWalletError("Network error saving wallet.");
        } finally {
            setWalletSaving(false);
        }
    }

    // Poll the canonical ride list: pick up any ride this driver already
    // owns (in progress), otherwise show what's available to accept.
    useEffect(() => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch("/api/rides");
                const data = await res.json();
                if (!data.success) return;

                const mine = data.rides.find(
                    r => r.driverId === DRIVER_ID && !["COMPLETED", "CANCELLED"].includes(r.status)
                );

                setActiveRide(mine || null);

                setAvailableRides(
                    mine ? [] : data.rides.filter(r => r.status === "MATCHING")
                );
            } catch (_) {
                // transient network error — retry next tick
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(pollRef.current);
    }, []);

    async function acceptRide(rideId) {
        setError(null);
        try {
            const res = await fetch(`/api/rides/${rideId}/accept`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ driverId: DRIVER_ID, driverName: "Driver One" })
            });
            const data = await res.json();

            if (!data.success) {
                setError(
                    data.code === "ALREADY_ACCEPTED"
                        ? "Another driver already took that ride."
                        : data.error || "Could not accept ride"
                );
                return;
            }

            setActiveRide(data.ride);
        } catch (_) {
            setError("Network error accepting ride.");
        }
    }

    async function advanceRide() {
        if (!activeRide) return;
        const next = NEXT_STATE[activeRide.status];
        if (!next) return;

        try {
            const res = await fetch(`/api/rides/${activeRide.id}/state`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state: next.state })
            });
            const data = await res.json();
            if (data.success) setActiveRide(data.ride);
        } catch (_) {
            setError("Network error updating ride.");
        }
    }

    async function completeRide() {
        if (!activeRide) return;

        try {
            const res = await fetch(`/api/rides/${activeRide.id}/complete`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ driverId: DRIVER_ID })
            });
            const data = await res.json();

            if (data.success) {
                setActiveRide(null); // back to available-rides view
            } else {
                setError(data.error || "Could not complete ride");
            }
        } catch (_) {
            setError("Network error completing ride.");
        }
    }

    const pickup = activeRide ? findLocation(pickupIdFromName(activeRide.pickup)) : null;
    const dropoff = activeRide ? findLocation(pickupIdFromName(activeRide.dropoff)) : null;

    return (
        <div className="cablink-screen">
            <h1>🚕 Driver Dashboard</h1>

            {error && <p className="cab-error">{error}</p>}

            <div className="cab-card">
                <h2>💰 THB Wallet</h2>
                {wallet ? (
                    <p>Linked wallet: {wallet}</p>
                ) : (
                    <div>
                        <p>
                            No wallet linked yet — you won't receive THB rewards until
                            you add one.
                        </p>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={walletInput}
                            onChange={e => setWalletInput(e.target.value)}
                        />
                        <button onClick={saveWallet} disabled={walletSaving || !walletInput.trim()}>
                            {walletSaving ? "Saving..." : "Link Wallet"}
                        </button>
                        {walletError && <p className="cab-error">{walletError}</p>}
                    </div>
                )}
            </div>

            <div className="cab-card">
                <h2>Economy</h2>
                {economy && (
                    <div>
                        <p>Rides: {economy.rides}</p>
                        <p>Completed: {economy.completed}</p>
                        <p>THB Earned: {economy.thbEarned}</p>
                        <p>Revenue: {economy.totalFare}</p>
                    </div>
                )}
            </div>

            {activeRide ? (
                <div className="cab-card">
                    <h2>Active Ride</h2>
                    <p>Pickup: {activeRide.pickup}</p>
                    <p>Dropoff: {activeRide.dropoff}</p>
                    <p>Status: {activeRide.status}</p>
                    <p>Fare: P{activeRide.fare}</p>

                    <LiveMap pickup={pickup} dropoff={dropoff} driver={pickup} height="240px" />

                    {NEXT_STATE[activeRide.status] && (
                        <button onClick={advanceRide}>
                            {NEXT_STATE[activeRide.status].label}
                        </button>
                    )}

                    {activeRide.status === "STARTED" && (
                        <button onClick={completeRide}>Complete trip</button>
                    )}
                </div>
            ) : (
                <div className="cab-card">
                    <h2>Available Rides</h2>
                    {!wallet && (
                        <p className="cab-warning">
                            Link a wallet above before accepting rides, or you won't
                            receive the THB reward for them.
                        </p>
                    )}
                    {availableRides.length === 0 && <p>No ride requests right now.</p>}
                    {availableRides.map(ride => (
                        <div key={ride.id} className="cab-ride-request">
                            <p>{ride.pickup} → {ride.dropoff}</p>
                            <p>Fare: P{ride.fare}</p>
                            <button onClick={() => acceptRide(ride.id)} disabled={!wallet}>
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="cab-card">
                <h2>🔥 Demand Areas</h2>
                {hotspots.map((h, i) => (
                    <div key={i}>{h.location} — Score: {h.score}</div>
                ))}
            </div>
        </div>
    );
}

// Ride records currently store pickup/dropoff as free-text names
// (e.g. "Gaborone CBD"), not location IDs. This maps the name back
// to a known landmark for the map. Once ride creation stores the
// lat/lng directly (cleaner), this lookup can be removed.
function pickupIdFromName(name) {
    const match = {
        "Gaborone CBD": "cbd",
        "Sir Seretse Khama Airport": "airport",
        "Game City Mall": "game_city",
        "Riverwalk Mall": "riverwalk",
        "University of Botswana": "ub",
        "Broadhurst": "broadhurst",
        "Gaborone Bus Rank": "bus_rank",
        "Main Mall": "main_mall",
        "Phakalane": "phakalane",
        "Gaborone West": "gaborone_west"
    };
    return match[name] || "cbd";
}
