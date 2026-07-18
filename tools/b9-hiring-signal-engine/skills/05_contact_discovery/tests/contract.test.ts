import test from "node:test";
import assert from "node:assert/strict";
import { extractPublicContacts } from "../index.js";

test("contact discovery prefers a public business email over a form", () => {
  const html = '<a href="mailto:hr@company.example">HR</a><form action="/contact"><button>Send message</button></form>';
  const contacts = extractPublicContacts([{ url: "https://company.example/contact", html, status: 200, contentType: "text/html", title: "Contact", description: "", text: "hr@company.example", links: [] }]);
  assert.equal(contacts[0]?.type, "email");
  assert.equal(contacts[0]?.value, "hr@company.example");
});
