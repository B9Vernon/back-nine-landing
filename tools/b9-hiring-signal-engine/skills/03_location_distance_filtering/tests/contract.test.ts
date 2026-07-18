import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLocation } from "../index.js";
import { normalizeJobSignal } from "../../../src/normalize.js";

test("distance rules accept Vernon and exclude Kelowna and golf", () => {
  const settings = { radiusKm: 40, includeKelowna: false, includeGolfCourses: false };
  assert.equal(evaluateLocation(normalizeJobSignal({ companyName: "Example Motors", jobTitle: "Sales Rep", city: "Vernon" }), settings).accepted, true);
  assert.match(evaluateLocation(normalizeJobSignal({ companyName: "Example Motors", jobTitle: "Sales Rep", city: "Kelowna" }), settings).reason, /Kelowna/);
  assert.equal(evaluateLocation(normalizeJobSignal({ companyName: "Example Golf Club", jobTitle: "Manager", city: "Vernon" }), settings).accepted, false);
});
