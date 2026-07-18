import test from "node:test";
import assert from "node:assert/strict";
import { extractSitePage } from "../index.js";

test("company research extracts public page context and relevant links", () => {
  const page = extractSitePage({ url: "https://company.example/", status: 200, contentType: "text/html", html: '<title>Example Company</title><meta name="description" content="Local service team"><a href="/contact">Contact</a><main>Serving Vernon.</main>' });
  assert.equal(page.description, "Local service team");
  assert.deepEqual(page.links, ["https://company.example/contact"]);
});
