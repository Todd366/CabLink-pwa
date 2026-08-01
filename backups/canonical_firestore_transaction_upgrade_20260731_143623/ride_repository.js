const persistence =
    require("./ride_persistence");

async function create(
    ride
) {

    return persistence.create(
        ride
    );

}

async function findById(
    id
) {

    return persistence.findById(
        id
    );

}

async function all() {

    return persistence.all();

}

async function update(
    id,
    changes
) {

    return persistence.update(
        id,
        changes
    );

}

async function accept(
    id,
    driverId,
    driverName
) {

    return persistence.accept(
        id,
        driverId,
        driverName
    );

}

function status() {

    return persistence.status();

}

module.exports = {

    create,

    findById,

    all,

    update,

    accept,

    status

};
