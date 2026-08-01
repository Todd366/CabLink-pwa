"use strict";

/*
 * CABLINK — CANONICAL RIDE LEGACY ADAPTER
 *
 * Purpose:
 * Provide compatibility for old modules while ensuring that
 * all ride creation, lookup, update and acceptance operations
 * resolve through the canonical ride engine/repository.
 *
 * This file does NOT own ride data.
 * This file does NOT maintain a second ride store.
 */

const engine = require("./ride_engine");

function createRide(data) {
  return engine.createRide(data);
}

function getRide(id) {
  return engine.getRide(id);
}

function getAllRides() {
  return engine.getAllRides();
}

function updateRide(id, patch) {
  return engine.transition(
    id,
    patch && patch.status,
    patch
  );
}

function acceptRide(id, driverId) {
  return engine.acceptRide(id, driverId);
}

module.exports = {
  createRide,
  getRide,
  getAllRides,
  updateRide,
  acceptRide
};
