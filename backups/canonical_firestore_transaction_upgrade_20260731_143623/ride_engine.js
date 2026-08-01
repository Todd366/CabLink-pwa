const repository =
    require("./ride_repository");

const STATES =
    Object.freeze({

        REQUESTED:
            "REQUESTED",

        MATCHING:
            "MATCHING",

        DRIVER_ASSIGNED:
            "DRIVER_ASSIGNED",

        DRIVER_ARRIVED:
            "DRIVER_ARRIVED",

        PICKED_UP:
            "PICKED_UP",

        STARTED:
            "STARTED",

        COMPLETED:
            "COMPLETED",

        CANCELLED:
            "CANCELLED"

    });

const TRANSITIONS = {

    REQUESTED: [
        "MATCHING",
        "CANCELLED"
    ],

    MATCHING: [
        "DRIVER_ASSIGNED",
        "CANCELLED"
    ],

    DRIVER_ASSIGNED: [
        "DRIVER_ARRIVED",
        "CANCELLED"
    ],

    DRIVER_ARRIVED: [
        "PICKED_UP",
        "CANCELLED"
    ],

    PICKED_UP: [
        "STARTED"
    ],

    STARTED: [
        "COMPLETED"
    ],

    COMPLETED: [],

    CANCELLED: []

};

async function createRide(
    data
) {

    const ride = {

        id:
            data.id ||
            "RIDE-" +
            Date.now(),

        pickup:
            data.pickup ||
            "",

        dropoff:
            data.dropoff ||
            data.destination ||
            "",

        vehicle:
            data.vehicle ||
            "standard",

        fare:
            Number(
                data.fare
            ) ||
            20,

        distanceKm:
            Number(
                data.distanceKm
            ) ||
            0,

        wallet:
            data.wallet ||
            null,

        notes:
            data.notes ||
            "",

        passenger:
            data.passenger ||
            null,

        driverId:
            null,

        driverName:
            null,

        status:
            STATES.REQUESTED,

        createdAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString()

    };

    return repository.create(
        ride
    );

}

async function getRide(
    id
) {

    return repository.findById(
        id
    );

}

async function getAllRides() {

    return repository.all();

}

function canTransition(
    from,
    to
) {

    if (
        !STATES[to]
    ) {

        return false;

    }

    return Boolean(

        TRANSITIONS[from] &&

        TRANSITIONS[from]
            .includes(to)

    );

}

async function acceptRide(
    id,
    driverId,
    driverName
) {

    return repository.accept(
        id,
        driverId,
        driverName
    );

}

async function transition(
    id,
    nextState,
    metadata = {}
) {

    const ride =
        await repository.findById(
            id
        );

    if (!ride) {

        return {

            success:
                false,

            error:
                "Ride not found"

        };

    }

    if (
        !canTransition(
            ride.status,
            nextState
        )
    ) {

        return {

            success:
                false,

            error:
                "Invalid ride transition: " +
                ride.status +
                " → " +
                nextState

        };

    }

    const changes = {

        status:
            nextState

    };

    if (
        metadata.driverId !==
        undefined
    ) {

        changes.driverId =
            metadata.driverId;

    }

    if (
        metadata.driverName !==
        undefined
    ) {

        changes.driverName =
            metadata.driverName;

    }

    if (
        metadata.rating !==
        undefined
    ) {

        changes.rating =
            metadata.rating;

    }

    if (
        metadata.comment !==
        undefined
    ) {

        changes.comment =
            metadata.comment;

    }

    if (
        nextState ===
        STATES.COMPLETED
    ) {

        changes.completedAt =
            new Date()
                .toISOString();

    }

    const updated =
        await repository.update(
            id,
            changes
        );

    return {

        success:
            Boolean(
                updated
            ),

        ride:
            updated

    };

}

function persistenceStatus() {

    return repository.status();

}

module.exports = {

    STATES,

    TRANSITIONS,

    createRide,

    getRide,

    getAllRides,

    transition,

    canTransition,

    acceptRide,

    persistenceStatus

};
