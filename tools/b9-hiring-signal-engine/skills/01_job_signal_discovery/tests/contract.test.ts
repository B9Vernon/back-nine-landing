import test from "node:test";
import assert from "node:assert/strict";
import { classifyJob } from "../index.js";

test("job discovery recognizes a priority hiring signal", () => {
  assert.equal(classifyJob("Sales consultant for a growing team").category, "sales");
});
