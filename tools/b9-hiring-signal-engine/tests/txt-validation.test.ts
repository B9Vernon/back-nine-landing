import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROJECT_ROOT } from "../src/config.js";
import { validateTxtContent } from "../scripts/validate-txt.js";

test("the committed fictional demo output passes the strict TXT validator", () => {
  const result = validateTxtContent(readFileSync(resolve(PROJECT_ROOT, "data/samples/demo-output.txt"), "utf8"));
  assert.deepEqual(result, { valid: true, blocks: 1, errors: [] });
});
