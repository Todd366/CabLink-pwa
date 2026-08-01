"use strict";

/*
 * CABLINK — RIDE STATE SERVICE
 *
 * CANONICAL ADAPTER
 *
 * This service intentionally owns NO ride state.
 *
 * Architecture:
 *
 *   Legacy/API callers
 *          ↓
 *   ride_state_service
 *          ↓
 *   canonical compatibility layer
 *          ↓
 *   canonical ride engine
 *          ↓
 *   canonical repository
 *          ↓
 *   backend/data/rides.json
 *
 * All ride state transitions are enforced by the
 * canonical ride state machine.
 */

const compat =
    require("../canonical/ride_compatibility");


/**
 * Create a new canonical ride.
 *
 * Legacy callers may continue calling:
 *
 *     state.create(data)
 *
 * The compatibility layer routes this to:
 *
 *     canonical ride_engine.createRide()
 */
function create(data) {

    return compat.create(
        data || {}
    );

}


/**
 * Transition a ride through the canonical state machine.
 *
 * Legacy callers may continue calling:
 *
 *     state.update(id, status)
 *
 * The actual state mutation is now handled by:
 *
 *     canonical ride_engine.transition()
 *
 * Invalid transitions are rejected by the canonical engine.
 */
function update(
    id,
    status,
    metadata = {}
) {

    return compat.transition(
        id,
        status,
        metadata
    );

}


/**
 * Retrieve one canonical ride.
 */
function get(id) {

    return compat.findById(
        id
    );

}


/**
 * Retrieve all canonical rides.
 */
function all() {

    return compat.all();

}


module.exports = {
    create,
    update,
    get,
    all
};
