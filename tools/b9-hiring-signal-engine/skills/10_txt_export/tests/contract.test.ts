import test from "node:test";
import assert from "node:assert/strict";
import { renderTxtBlock } from "../index.js";

test("TXT block contains only the required field labels", () => {
  const text = renderTxtBlock({ company: "Example Co", email: "info@example.example", subject: "Team idea", body: "Hey Example Co,\n\nBody" });
  assert.deepEqual(text.match(/^[A-Z ]+:/gm), ["COMPANY:", "EMAIL:", "EMAIL SUBJECT:", "EMAIL BODY:"]);
  assert.doesNotMatch(text, /SCORE|SOURCE URL|RESEARCH NOTES/);
});
