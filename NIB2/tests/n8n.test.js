import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  isN8nConfigured,
  callN8n,
  fetchUnreadViaN8n,
  testN8nConnection,
  createGmailDraftViaN8n,
  weeklyBriefViaN8n,
  clearN8nCache,
} from "../lib/n8n.js";

const URL_SAVED = process.env.N8N_WEBHOOK_URL;
const SECRET_SAVED = process.env.N8N_WEBHOOK_SECRET;
beforeEach(() => {
  clearN8nCache();
  process.env.N8N_WEBHOOK_URL = "https://example.app.n8n.cloud/webhook/nib2-router";
  process.env.N8N_WEBHOOK_SECRET = "shh-its-a-secret";
});
afterEach(() => {
  if (URL_SAVED === undefined) delete process.env.N8N_WEBHOOK_URL; else process.env.N8N_WEBHOOK_URL = URL_SAVED;
  if (SECRET_SAVED === undefined) delete process.env.N8N_WEBHOOK_SECRET; else process.env.N8N_WEBHOOK_SECRET = SECRET_SAVED;
});

test("isN8nConfigured follows N8N_WEBHOOK_URL", () => {
  assert.equal(isN8nConfigured(), true);
  delete process.env.N8N_WEBHOOK_URL;
  assert.equal(isN8nConfigured(), false);
});

test("callN8n POSTs the command and secret header", async () => {
  let captured;
  await callN8n("connection_test", { foo: "bar" }, {
    fetchImpl: async (url, opts) => {
      captured = { url, opts };
      return { ok: true, json: async () => ({ ok: true }) };
    },
  });
  assert.equal(captured.url, "https://example.app.n8n.cloud/webhook/nib2-router");
  assert.equal(captured.opts.method, "POST");
  assert.equal(captured.opts.headers["x-nib2-secret"], "shh-its-a-secret");
  const body = JSON.parse(captured.opts.body);
  assert.equal(body.command, "connection_test");
  assert.equal(body.foo, "bar");
});

test("throws not_configured when N8N_WEBHOOK_URL is missing", async () => {
  delete process.env.N8N_WEBHOOK_URL;
  await assert.rejects(() => callN8n("connection_test"), (e) => e.code === "not_configured");
});

test("404 produces the 'not activated' hint", async () => {
  await assert.rejects(
    () => callN8n("connection_test", {}, { fetchImpl: async () => ({ ok: false, status: 404 }) }),
    (e) => e.code === "webhook_error" && /ACTIVATED/i.test(e.message)
  );
});

test("401/403 produces the secret-mismatch hint", async () => {
  await assert.rejects(
    () => callN8n("connection_test", {}, { fetchImpl: async () => ({ ok: false, status: 401 }) }),
    (e) => e.code === "webhook_error" && /N8N_WEBHOOK_SECRET/.test(e.message)
  );
});

test("non-JSON response produces the respond-mode hint", async () => {
  await assert.rejects(
    () => callN8n("connection_test", {}, { fetchImpl: async () => ({ ok: true, json: async () => { throw new Error("nope"); } }) }),
    (e) => e.code === "bad_response" && /When Last Node Finishes/.test(e.message)
  );
});

test("fetchUnreadViaN8n normalizes an array-of-{json} gmail_summary response", async () => {
  const body = [
    { json: { id: "a1", From: "Golf Canada <info@golfcanada.ca>", Subject: "League invite", snippet: "Hi Vernon..." } },
    { json: { id: "a2", from: "customer@x.com", subject: "Booking question", textSnippet: "Do you have..." } },
  ];
  const emails = await fetchUnreadViaN8n({ fetchImpl: async () => ({ ok: true, json: async () => body }) });
  assert.equal(emails.length, 2);
  assert.equal(emails[0].subject, "League invite");
});

test("fetchUnreadViaN8n handles a plain summary string response", async () => {
  const emails = await fetchUnreadViaN8n({
    fetchImpl: async () => ({ ok: true, json: async () => ({ summary: "3 unread, nothing urgent" }) }),
  });
  assert.deepEqual(emails, []);
});

test("fetchUnreadViaN8n caches between calls", async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: true, json: async () => [{ json: { From: "a@b.c", Subject: "S" } }] }; };
  await fetchUnreadViaN8n({ fetchImpl });
  await fetchUnreadViaN8n({ fetchImpl });
  assert.equal(calls, 1);
});

test("testN8nConnection sends connection_test", async () => {
  let seenCommand;
  await testN8nConnection({
    fetchImpl: async (url, opts) => { seenCommand = JSON.parse(opts.body).command; return { ok: true, json: async () => ({ ok: true }) }; },
  });
  assert.equal(seenCommand, "connection_test");
});

test("createGmailDraftViaN8n sends gmail_draft with recipient fields", async () => {
  let seenBody;
  await createGmailDraftViaN8n({ to: "a@b.c", subject: "Hi", body: "Text" }, {
    fetchImpl: async (url, opts) => { seenBody = JSON.parse(opts.body); return { ok: true, json: async () => ({ ok: true }) }; },
  });
  assert.equal(seenBody.command, "gmail_draft");
  assert.equal(seenBody.to, "a@b.c");
  assert.equal(seenBody.subject, "Hi");
});

test("weeklyBriefViaN8n sends weekly_b9_brief", async () => {
  let seenCommand;
  await weeklyBriefViaN8n({
    fetchImpl: async (url, opts) => { seenCommand = JSON.parse(opts.body).command; return { ok: true, json: async () => ({ ok: true }) }; },
  });
  assert.equal(seenCommand, "weekly_b9_brief");
});
