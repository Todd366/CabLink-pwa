"use strict";

/*
 * CABLINK — CANONICAL RIDE LEGACY ADAPTER
 *
 * Compatibility facade only.
 *
 * This module owns NO ride data.
 * All persistent ride operations resolve through:
 *
 *   canonical ride_engine
 *       ↓
 *   canonical ride_repository
 *       ↓
 *   backend/data/rides.json
 */

const engine = require("./ride_engine");
const repository = require("./ride_repository");

function createRide(data) {
  return engine.createRide(data);
}

function getRide(id) {
  return engine.getRide(id);
}

function getRides() {
  return engine.getAllRides();
}

function getAllRides() {
  return engine.getAllRides();
}

function updateRide(id, patch = {}) {
  const current = engine.getRide(id);

  if (!current) {
    return null;
  }

  /*
   * If this is a canonical state transition,
   * use the canonical engine.
   */
  if (patch.status) {
    const result = engine.transition(
      id,
      patch.status,
      patch
    );

    /*
     * Canonical engine implementations may return
     * the ride directly or a structured result.
     */
    if (result && result.ride) {
      return result.ride;
    }

    return result;
  }

  /*
   * Non-state metadata updates belong to the canonical
   * repository, not to a second store.
   */
  const updated = {
    ...current,
    ...patch,
    id: current.id,
    status: current.status
  };

  return repository.update(
    id,
    updated
  );
}

function acceptRide(id, driverId) {
  return engine.acceptRide(
    id,
    driverId
  );
}

module.exports = {
  createRide,
  getRide,
  getRides,
  getAllRides,
  updateRide,
  acceptRide
};
