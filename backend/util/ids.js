// Collision-proof IDs. A clock alone is not unique: two requests in the same
// millisecond would get the same ID and overwrite each other.
const crypto = require("crypto");
const newId = prefix => prefix + "-" + Date.now() + "-" + crypto.randomBytes(3).toString("hex");
module.exports = { newId };
