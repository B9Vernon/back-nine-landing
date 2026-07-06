import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isN8nConfigured, fetchUnreadViaN8n, clearN8nCache } from "../lib/gmail-n8n.js";

const URL_SAVED = process.env.N8N_GMAIL_WEBHOOK_URL;
beforeEach(() => {
  clearN8nCache();
  process.env.N8N_GMAIL_WEBHOOK_URL = "https://example.app.n8n.cloud/webhook/nib2-gmail";
});
afterEach(() => {
  if (URL_SAVED === undefined) delete process.env.N8N_GMAIL_WEBHOOK_URL;
  else process.env.N8N_GMAIL_WEBHOOK_URL = URL_SAVED;
});

test("isN8nConfigured follows the env var", () => {
  assert.equal(isN8nConfigured(), true);
  delete process.env.N8N_GMAIL_WEBHOOK_URL;
  assert.equal(isN8nConfigured(), false);
});

test("normalizes n8n simplified Gmail output (array of {json})", async () => {
  const body = [
    { json: { id: "a1", From: "Golf Canada <info@golfcanada.ca>", Subject: "League invite", snippet: "Hi Vernon..." } },
    { json: { id: "a2", from: "customer@x.com", subject: "Booking question", textSnippet: "Do you have..." } },
  ];
  const emails = await fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: true, json: async () => body }) });
  assert.equal(emails.length, 2);
  assert.equal(emails[0].from, "Golf Canada <info@golfcanada.ca>");
  assert.equal(emails[0].subject, "League invite");
  assert.equal(emails[1].subject, "Booking question");
});

test("normalizes raw Gmail API shape (payload.headers) and single-object bodies", async () => {
  const body = {
    id: "z9",
    snippet: "Your invoice is ready",
    payload: { headers: [{ name: "From", value: "billing@fullswing.com" }, { name: "Subject", value: "Invoice #42" }] },
  };
  const emails = await fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: true, json: async () => body }) });
  assert.equal(emails.length, 1);
  assert.equal(emails[0].from, "billing@fullswing.com");
  assert.equal(emails[0].subject, "Invoice #42");
});

test("drops non-email items instead of rendering junk", async () => {
  const body = [{ json: { someWorkflowMeta: true } }, { json: { From: "a@b.c", Subject: "Real" } }];
  const emails = await fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: true, json: async () => body }) });
  assert.equal(emails.length, 1);
  assert.equal(emails[0].subject, "Real");
});

test("404 produces the 'workflow not activated' hint", async () => {
  await assert.rejects(
    () => fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: false, status: 404 }) }),
    (e) => e.code === "webhook_error" && /ACTIVATED/i.test(e.message)
  );
});

test("non-JSON response produces the respond-mode hint", async () => {
  await assert.rejects(
    () => fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: true, json: async () => { throw new Error("nope"); } }) }),
    (e) => e.code === "bad_response" && /When Last Node Finishes/.test(e.message)
  );
});

test("caches results between calls", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: true, json: async () => [{ json: { From: "a@b.c", Subject: "S" } }] }; };
  await fetchUnreadViaN8n({ fetchImpl });
  await fetchUnreadViaN8n({ fetchImpl });
  assert.equal(calls, 1);
});
