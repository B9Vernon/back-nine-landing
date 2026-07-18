import test from "node:test";
import assert from "node:assert/strict";
import { companyNameSimilarity } from "../index.js";

test("deduplication recognizes conservative company-name variants", () => {
  assert.ok(companyNameSimilarity("North Valley Motors Ltd.", "North Valley Motors") >= 0.9);
  assert.ok(companyNameSimilarity("North Valley Motors", "Monashee Lodge") < 0.9);
});
