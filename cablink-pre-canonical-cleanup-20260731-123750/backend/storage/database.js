const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;
const FILE = path.join(DATA_DIR, "cablink_db.json");

console.log("CABLINK DATABASE FILE:", FILE);

function ensureStore() {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (_e) {
        // Directory may already exist or filesystem may be read-only
    }

    if (!fs.existsSync(FILE)) {
        try {
            fs.writeFileSync(
                FILE,
                JSON.stringify(
                    {
                        users: [],
                        rides: []
                    },
                    null,
                    2
                ),
                "utf8"
            );
        } catch (_e) {
            // Vercel/serverless filesystem may be read-only
        }
    }
}

function read() {
    ensureStore();

    try {
        const raw = fs.readFileSync(FILE, "utf8");
        return JSON.parse(raw);
    } catch (error) {
        console.error("❌ CabLink database read error:", error);

        return {
            users: [],
            rides: []
        };
    }
}

function write(data) {
    ensureStore();

    try {
        fs.writeFileSync(
            FILE,
            JSON.stringify(data, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("❌ CabLink database write error:", error);

        return false;
    }
}

module.exports = {
    read,
    write
};
