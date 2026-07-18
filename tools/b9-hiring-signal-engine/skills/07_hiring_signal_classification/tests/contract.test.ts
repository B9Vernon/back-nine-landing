import test from "node:test";
import assert from "node:assert/strict";
import { classifyJob } from "../index.js";

test("classification emits category and seasonal growth context", () => {
  const result = classifyJob("Seasonal guest services role at a growing resort");
  assert.notEqual(result.category, "other");
  assert.ok(result.signalTypes.includes("seasonal_ramp"));
  assert.ok(result.signalTypes.includes("growth"));
  assert.equal(classifyJob("Guest Services Coordinator").category, "customer_service");
});
