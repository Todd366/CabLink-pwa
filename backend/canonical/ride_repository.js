const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "rides.json");

function ensureStore() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, "[]", "utf8");
    }
}

function load() {
    ensureStore();

    try {
        const raw = fs.readFileSync(FILE, "utf8");
        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("❌ Ride database read error:", error);
        return [];
    }
}

function save(rides) {
    ensureStore();

    fs.writeFileSync(
        FILE,
        JSON.stringify(rides, null, 2),
        "utf8"
    );
}

function create(ride) {
    const rides = load();

    rides.push(ride);

    save(rides);

    return ride;
}

function findById(id) {
    return load().find(
        ride => ride.id === String(id)
    ) || null;
}

function all() {
    return load();
}

function update(id, changes) {
    const rides = load();

    const index = rides.findIndex(
        ride => ride.id === String(id)
    );

    if (index === -1) {
        return null;
    }

    rides[index] = {
        ...rides[index],
        ...changes,
        updatedAt: new Date().toISOString()
    };

    save(rides);

    return rides[index];
}

module.exports = {
    create,
    findById,
    all,
    update
};
