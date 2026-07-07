import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../public/command.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../public/command.js", import.meta.url), "utf8");

test("Command Centre includes the N8N Commands panel", () => {
  assert.match(html, /Test n8n Connection/);
  assert.match(html, /Gmail Summary/);
  assert.match(html, /Weekly B9 Brief/);
  assert.match(html, /Create Gmail Draft/);
  assert.match(html, /id="n8n-badge"/);
  assert.match(html, /id="n8n-readout"/);
});

test("frontend posts only commands and never exposes the n8n secret", () => {
  assert.match(js, /\/n8n\/command/);
  assert.doesNotMatch(html + js, /N8N_WEBHOOK_SECRET/);
  assert.doesNotMatch(html + js, /x-nib2-secret/);
});

test("frontend Gmail draft button requires recipient + subject before calling the API", () => {
  assert.match(js, /runN8nCommand\("gmail_draft"/);
  assert.match(js, /if \(!to \|\| !subject\)/);
});
