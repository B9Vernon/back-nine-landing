import test from "node:test";
import assert from "node:assert/strict";
import { generatePersonalEmail } from "../index.js";

test("email generation obeys the required introduction, length, and no-sign-off rules", () => {
  const email = generatePersonalEmail({
    id: 1,
    name: "Example Motors",
    description: "Example Motors is a local automotive retailer serving Vernon drivers and commercial customers.",
    jobTitle: "Sales Consultant",
    category: "sales",
    multiplePostings: false,
    offers: ["Corporate Membership", "Client Hosting", "Sales Team Night", "Customer Appreciation Event"],
    contactType: "email",
    contactValue: "info@examplemotors.example",
  });
  assert.ok(email.body.startsWith("Hey Example Motors,\n\nI'm Neil, owner of Back Nine Golf here in Vernon."));
  const words = email.body.split(/\s+/).length;
  assert.ok(words >= 150 && words <= 250, `expected 150-250 words, got ${words}`);
  assert.doesNotMatch(email.body, /\b(sincerely|regards|cheers),?\s*$/i);
});
