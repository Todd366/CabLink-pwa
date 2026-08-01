"use strict";

/*
 * CABLINK — CANONICAL RIDE COMPATIBILITY LAYER
 *
 * PURPOSE:
 * Provide a temporary compatibility API for legacy modules
 * while migrating the entire application to the canonical
 * ride engine.
 *
 * ARCHITECTURE RULE:
 *
 *   Legacy module
 *        ↓
 *   Compatibility Layer
 *        ↓
 *   Canonical Ride Engine
 *        ↓
 *   Canonical Repository
 *        ↓
 *   backend/data/rides.json
 *
 * This module does NOT own ride state.
 * This module does NOT maintain a second ride database.
 * This module does NOT write ride files directly.
 */

const engine = require("./ride_engine");

/**
 * Create a canonical ride.
 */
function create(data) {
    return engine.createRide(data);
}

/**
 * Get one canonical ride.
 */
function findById(id) {
    return engine.getRide(id);
}

/**
 * Get all canonical rides.
 */
function all() {
    return engine.getAllRides();
}

/**
 * Update canonical ride through the state machine.
 */
function transition(id, nextState, metadata = {}) {
    return engine.transition(
        id,
        nextState,
        metadata
    );
}

/**
 * Accept a canonical ride.
 */
async function accept(
    id,
    driverId,
    driverName
) {
    return engine.acceptRide(
        id,
        driverId,
        driverName
    );
}

module.exports = {
    create,
    findById,
    all,
    transition,
    accept
};
