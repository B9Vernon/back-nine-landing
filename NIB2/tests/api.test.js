import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-api-"));
delete process.env.NIB2_PASSWORD;

const { createApp } = await import("../server.js");
const { dataPath } = await import("../lib/store.js");

// Mock Anthropic client — no network, no key spent.
const mockClient = {
  messages: {
    create: async () => ({
      stop_reason: "end_turn",
      content: [{ type: "text", text: "**Pickup Where You Left Off**\n\nMock reply from NIB2." }],
    }),
  },
};

// A mock that calls add_task once, then answers — exercises the tool loop.
function makeToolUsingClient() {
  let call = 0;
  return {
    messages: {
      create: async () => {
        call++;
        if (call === 1) {
          return {
            stop_reason: "tool_use",
            content: [
              { type: "text", text: "Adding that." },
              { type: "tool_use", id: "tu_1", name: "add_task", input: { title: "Buy new grips", priority: "low" } },
            ],
          };
        }
        return { stop_reason: "end_turn", content: [{ type: "text", text: "Task added. You're welcome." }] };
      },
    },
  };
}

let server;
let base;

function startServer(deps) {
  return new Promise((resolve) => {
    const app = createApp(deps);
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
}

before(async () => {
  server = await startServer({ makeClient: () => mockClient });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

async function req(pathname, options = {}) {
  const res = await fetch(`${base}${pathname}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

test("dashboard HTML is served at /", async () => {
  const res = await fetch(`${base}/`);
  const html = await res.text();
  assert.equal(res.status, 200);
  assert.match(html, /NIB2/);
  assert.match(html, /chat-log/);
});

test("GET /api/status reports model and key state", async () => {
  const { status, body } = await req("/api/status");
  assert.equal(status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.model);
});

test("POST /api/chat rejects an empty message list", async () => {
  const { status, body } = await req("/api/chat", { method: "POST", body: JSON.stringify({ messages: [] }) });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("POST /api/chat rejects a blank user message", async () => {
  const { status } = await req("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: "   " }] }),
  });
  assert.equal(status, 400);
});

test("POST /api/chat handles a missing API key cleanly", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const { status, body } = await req("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
    });
    assert.equal(status, 503);
    assert.match(body.error, /API key/i);
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});

test("POST /api/chat returns a reply for a valid message (mocked client)", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  const { status, body } = await req("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: "Hello NIB2" }] }),
  });
  assert.equal(status, 200);
  assert.match(body.reply, /Mock reply/);
});

test("chat tool loop executes add_task and reports the action", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  const toolServer = await startServer({ makeClient: makeToolUsingClient });
  try {
    const res = await fetch(`http://127.0.0.1:${toolServer.address().port}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Remind me to buy new grips" }] }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.actions.length, 1);
    assert.equal(body.actions[0].action, "task_added");
    assert.equal(body.actions[0].detail.title, "Buy new grips");
  } finally {
    toolServer.close();
  }
});

test("task CRUD via the API", async () => {
  const created = await req("/api/tasks", { method: "POST", body: JSON.stringify({ title: "API task", priority: "high" }) });
  assert.equal(created.status, 201);
  const id = created.body.task.id;

  const updated = await req(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "in_progress" }) });
  assert.equal(updated.body.task.status, "in_progress");

  const bad = await req(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status: "nonsense" }) });
  assert.equal(bad.status, 400);

  const done = await req(`/api/tasks/${id}/complete`, { method: "POST" });
  assert.equal(done.body.task.status, "complete");

  const list = await req("/api/tasks");
  assert.ok(list.body.tasks.some((t) => t.id === id && t.status === "complete"));
});

test("POST /api/tasks rejects missing title", async () => {
  const { status } = await req("/api/tasks", { method: "POST", body: JSON.stringify({}) });
  assert.equal(status, 400);
});

test("memory endpoints read and write", async () => {
  const saved = await req("/api/memory/preference", { method: "POST", body: JSON.stringify({ key: "sport", value: "golf" }) });
  assert.equal(saved.status, 200);
  const { body } = await req("/api/memory");
  assert.equal(body.memory.preferences.sport, "golf");
});

test("a corrupted memory file does not take the API down", async () => {
  fs.writeFileSync(dataPath("memory.json"), "TOTALLY{{{BROKEN", "utf8");
  const { status, body } = await req("/api/memory");
  assert.equal(status, 200);
  assert.deepEqual(body.memory.facts, []);
});

test("session handoff saves a summary with the required heading", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  const { status, body } = await req("/api/sessions/handoff", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: "We built NIB2 today." }] }),
  });
  assert.equal(status, 200);
  assert.match(body.session.summary, /Pickup Where You Left Off/);

  const list = await req("/api/sessions");
  assert.ok(list.body.sessions.length >= 1);
});

test("handoff with empty conversation is rejected", async () => {
  const { status } = await req("/api/sessions/handoff", { method: "POST", body: JSON.stringify({ messages: [] }) });
  assert.equal(status, 400);
});

test("invalid JSON body gets a readable error, not a crash", async () => {
  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{not json",
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /JSON/i);
});

test("password gate blocks and admits correctly", async () => {
  process.env.NIB2_PASSWORD = "opensesame";
  try {
    const blocked = await req("/api/tasks");
    assert.equal(blocked.status, 401);
    const admitted = await fetch(`${base}/api/tasks`, { headers: { "x-nib2-auth": "opensesame" } });
    assert.equal(admitted.status, 200);
    const statusOk = await req("/api/status"); // status stays open
    assert.equal(statusOk.status, 200);
  } finally {
    delete process.env.NIB2_PASSWORD;
  }
});

// ---------- New integration routes ----------

test("/api/status reports voice and gmail sections", async () => {
  const { body } = await req("/api/status");
  assert.ok(body.voice, "voice section present");
  assert.ok(body.gmail, "gmail section present");
  assert.equal(typeof body.voice.elevenLabs, "boolean");
});

test("/api/speak returns 503 fallback when ElevenLabs is not configured", async () => {
  const savedKey = process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_API_KEY;
  try {
    const { status, body } = await req("/api/speak", { method: "POST", body: JSON.stringify({ text: "hi" }) });
    assert.equal(status, 503);
    assert.equal(body.fallback, true);
  } finally {
    if (savedKey !== undefined) process.env.ELEVENLABS_API_KEY = savedKey;
  }
});

test("/api/speak rejects empty text", async () => {
  const { status } = await req("/api/speak", { method: "POST", body: JSON.stringify({ text: "   " }) });
  assert.equal(status, 400);
});

test("/api/speak streams audio when synthesize is provided (mocked)", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  const audioServer = await startServer({
    makeClient: () => mockClient,
    synthesize: async () => Buffer.from("fake-mp3-bytes"),
  });
  try {
    const res = await fetch(`http://127.0.0.1:${audioServer.address().port}/api/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "NIB, testing voice." }),
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /audio\/mpeg/);
    const buf = Buffer.from(await res.arrayBuffer());
    assert.ok(buf.length > 0);
  } finally {
    audioServer.close();
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_VOICE_ID;
  }
});

test("/api/weather serves data from the injected weather source", async () => {
  const weatherServer = await startServer({
    makeClient: () => mockClient,
    getWeather: async () => ({ location: "Vernon, BC", temperature: 21.5, humidity: 40 }),
  });
  try {
    const res = await fetch(`http://127.0.0.1:${weatherServer.address().port}/api/weather`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.temperature, 21.5);
  } finally {
    weatherServer.close();
  }
});

test("/api/weather reports a clean 503 when the source fails", async () => {
  const weatherServer = await startServer({
    makeClient: () => mockClient,
    getWeather: async () => { throw new Error("Environment Canada is napping."); },
  });
  try {
    const res = await fetch(`http://127.0.0.1:${weatherServer.address().port}/api/weather`);
    const body = await res.json();
    assert.equal(res.status, 503);
    assert.match(body.error, /napping/);
  } finally {
    weatherServer.close();
  }
});

test("/api/command-centre GET returns the stored centre state", async () => {
  const { status, body } = await req("/api/command-centre");
  assert.equal(status, 200);
  assert.ok("brief" in body && "intel" in body);
});

test("/api/command-centre/brief uses the injected generator and 503s without a key", async () => {
  const briefServer = await startServer({
    makeClient: () => mockClient,
    generateBrief: async () => ({ brief: { headline: "test" }, briefGeneratedAt: "now" }),
  });
  const port = briefServer.address().port;
  try {
    const savedKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "test-key";
    const ok = await fetch(`http://127.0.0.1:${port}/api/command-centre/brief`, { method: "POST" });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).brief.headline, "test");

    delete process.env.ANTHROPIC_API_KEY;
    const noKey = await fetch(`http://127.0.0.1:${port}/api/command-centre/brief`, { method: "POST" });
    assert.equal(noKey.status, 503);
    if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey;
  } finally {
    briefServer.close();
  }
});

test("/api/command-centre/intel refreshes via the injected gatherer", async () => {
  const intelServer = await startServer({
    makeClient: () => mockClient,
    gatherIntel: async () => ({ fetchedAt: "now", weather: { temperature: 20 }, news: [], errors: [] }),
  });
  try {
    const res = await fetch(`http://127.0.0.1:${intelServer.address().port}/api/command-centre/intel`, { method: "POST" });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).weather.temperature, 20);
  } finally {
    intelServer.close();
  }
});

test("/api/gmail/status reports not_configured cleanly", async () => {
  const { status, body } = await req("/api/gmail/status");
  assert.equal(status, 200);
  assert.equal(body.connected, false);
});

test("system prompt instructs NIB2 to address the user as NIB", async () => {
  const { getSystemPrompt } = await import("../lib/claude.js");
  const prompt = getSystemPrompt();
  assert.match(prompt, /address him as \*\*NIB\*\*/i);
});
