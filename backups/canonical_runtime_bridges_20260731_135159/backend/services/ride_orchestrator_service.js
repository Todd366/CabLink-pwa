"use strict";

/*
 * CABLINK — CANONICAL RIDE ORCHESTRATOR
 *
 * Orchestration layer only.
 *
 * Ride persistence and lifecycle authority:
 *
 *   canonical ride_engine
 *       ↓
 *   canonical ride_repository
 *
 * This service may coordinate notifications and external
 * side effects, but it must not own ride state.
 */

const engine =
  require("../canonical/ride_engine");

const notify =
  require("./notification_service");

function createRide(data) {
  return engine.createRide(data);
}

function assignDriver(id, driver) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    console.log(
      "❌ Ride not found:",
      id
    );

    return null;
  }

  /*
   * Canonical state:
   *
   * MATCHING
   *    ↓
   * DRIVER_ASSIGNED
   *
   * Driver identity is passed through the canonical
   * transition metadata.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.DRIVER_ASSIGNED,
      {
        driver
      }
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver,
      user: updated.passenger,
      type: "DRIVER_ASSIGNED",
      message: "Driver has been assigned"
    });
  }

  return updated;
}

function driverArrived(id) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  const result =
    engine.transition(
      id,
      engine.STATES.DRIVER_ARRIVED
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "DRIVER_ARRIVED",
      message: "Your driver has arrived"
    });
  }

  return updated;
}

function startTrip(id) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  /*
   * Canonical lifecycle:
   *
   * PICKED_UP → STARTED
   *
   * The old TRIP_STARTED state is not a canonical
   * ride status.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.STARTED
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "TRIP_STARTED",
      message: "Trip started"
    });
  }

  return updated;
}

function finishTrip(id, fare) {

  const ride =
    engine.getRide(id);

  if (!ride) {
    return null;
  }

  /*
   * Fare is metadata.
   * Completion is a canonical state transition.
   *
   * The canonical completion service should be preferred
   * by production completion routes.
   */
  const result =
    engine.transition(
      id,
      engine.STATES.COMPLETED,
      {
        fare
      }
    );

  const updated =
    result && result.ride
      ? result.ride
      : result;

  if (updated) {
    notify.notify({
      ride: id,
      driver: updated.driver,
      user: updated.passenger,
      type: "TRIP_COMPLETED",
      message: "Ride completed successfully"
    });
  }

  return updated;
}

module.exports = {
  createRide,
  assignDriver,
  driverArrived,
  startTrip,
  finishTrip
};
