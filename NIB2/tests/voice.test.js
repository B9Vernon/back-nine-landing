import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { hasElevenLabs, elevenLabsStatus, synthesize } from "../lib/voice.js";

const saved = { key: process.env.ELEVENLABS_API_KEY, voice: process.env.ELEVENLABS_VOICE_ID };
afterEach(() => {
  if (saved.key === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = saved.key;
  if (saved.voice === undefined) delete process.env.ELEVENLABS_VOICE_ID; else process.env.ELEVENLABS_VOICE_ID = saved.voice;
});

test("hasElevenLabs is false when key/voice missing", () => {
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
  assert.equal(hasElevenLabs(), false);
  assert.equal(elevenLabsStatus().reason, "no_key_no_voice");
});

test("elevenLabsStatus flags a missing voice id specifically", () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  delete process.env.ELEVENLABS_VOICE_ID;
  assert.equal(elevenLabsStatus().reason, "no_voice");
});

test("synthesize throws not_configured when keys are missing", async () => {
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
  await assert.rejects(() => synthesize("hello"), (e) => e.code === "not_configured");
});

test("synthesize returns an audio Buffer with a mocked fetch", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  const fakeAudio = Buffer.from("ID3-fake-mp3-bytes");
  const fetchImpl = async (url, opts) => {
    assert.match(url, /text-to-speech\/test-voice/);
    assert.equal(opts.headers["xi-api-key"], "test-key");
    const body = JSON.parse(opts.body);
    assert.ok(body.text.length > 0);
    return { ok: true, arrayBuffer: async () => fakeAudio.buffer.slice(fakeAudio.byteOffset, fakeAudio.byteOffset + fakeAudio.byteLength) };
  };
  const out = await synthesize("NIB, this is a test.", { fetchImpl });
  assert.ok(Buffer.isBuffer(out));
  assert.ok(out.length > 0);
});

test("synthesize runs text through the speech-director pipeline (markdown stripped)", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  let sentText = "";
  const fetchImpl = async (url, opts) => {
    sentText = JSON.parse(opts.body).text;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) };
  };
  await synthesize("**Bold claim** — check the [site](https://example.com) for `details`.", { fetchImpl });
  assert.doesNotMatch(sentText, /\*\*|`|\[|\]|https?:\/\//, "markdown/links should be stripped before reaching ElevenLabs");
});

test("synthesize turns a code block into the dry omission line, not raw code", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  process.env.ELEVENLABS_VOICE_ID = "test-voice";
  let sentText = "";
  const fetchImpl = async (url, opts) => {
    sentText = JSON.parse(opts.body).text;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) };
  };
  await synthesize("Here: ```js\nconst x = 1;\n```", { fetchImpl });
  assert.doesNotMatch(sentText, /const x = 1/);
  assert.match(sentText, /act of cruelty/i);
});

test("synthesize surfaces a clean error on a bad key (401)", async () => {
  process.env.ELEVENLABS_API_KEY = "bad";
  process.env.ELEVENLABS_VOICE_ID = "v";
  const fetchImpl = async () => ({ ok: false, status: 401, text: async () => "unauthorized" });
  await assert.rejects(() => synthesize("hi", { fetchImpl }), (e) => e.code === "bad_key");
});
