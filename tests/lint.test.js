const test = require("node:test");
const assert = require("node:assert");
const { found } = require("../scripts/check_duplicates.js");
test("no file declares the same top-level function or variable twice", () => {
  assert.deepEqual(found, [], "duplicates:\n" + found.join("\n"));
});
