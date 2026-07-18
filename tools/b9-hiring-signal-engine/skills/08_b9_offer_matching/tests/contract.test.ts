import test from "node:test";
import assert from "node:assert/strict";
import { matchOffers } from "../index.js";

test("offer matching adds a new-hire idea for multiple postings", () => {
  const offers = matchOffers("sales", true);
  assert.ok(offers.includes("New-Hire Welcome Night"));
  assert.ok(offers.length >= 3 && offers.length <= 5);
});
