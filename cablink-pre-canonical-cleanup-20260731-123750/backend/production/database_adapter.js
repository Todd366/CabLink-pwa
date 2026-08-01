require("dotenv").config();

const firestore =
    require("../firebase/firestore_adapter");

function provider() {

    return {

        type:
            "FIRESTORE",

        configured:
            firestore.status().configured,

        project:
            firestore.status().project,

        timestamp:
            new Date().toISOString()

    };

}

async function write(
    collection,
    id,
    data
) {

    return firestore.write(
        collection,
        id,
        data
    );

}

async function read(
    collection,
    id
) {

    return firestore.read(
        collection,
        id
    );

}

module.exports = {

    provider,

    write,

    read

};
