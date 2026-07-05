import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stripMarkdownForSpeech,
  formatListsForSpeech,
  createSpokenText,
  chunkSpokenText,
  sanitizeTTSInput,
  prepareTextForTTS,
  CODE_OMISSION,
} from "../lib/speech-director.js";

test("stripMarkdownForSpeech removes bold, links, headers, code fences", () => {
  const out = stripMarkdownForSpeech("# Title\n**bold** and [a link](https://x.com) and `code`.");
  assert.doesNotMatch(out, /[*#`]/);
  assert.doesNotMatch(out, /https?:\/\//);
  assert.match(out, /a link/);
});

test("stripMarkdownForSpeech swaps a code block for the omission line by default", () => {
  const out = stripMarkdownForSpeech("before\n```js\nconsole.log(1)\n```\nafter");
  assert.doesNotMatch(out, /console\.log/);
  assert.match(out, new RegExp(CODE_OMISSION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("formatListsForSpeech turns bullets into spoken 'First/Next/Also' phrasing", () => {
  const out = formatListsForSpeech("Steps:\n- one\n- two\n- three");
  assert.match(out, /First, one/);
  assert.match(out, /Next, two/);
  assert.match(out, /Also, three/);
});

test("formatListsForSpeech caps long lists with an on-screen note", () => {
  const out = formatListsForSpeech("- a\n- b\n- c\n- d\n- e\n- f");
  assert.match(out, /remaining details are on screen/);
});

test("createSpokenText addresses NIB exactly once, not per occurrence", () => {
  const out = createSpokenText("NIB, thanks. NIB, one more thing for NIB.");
  const count = (out.match(/\bNIB\b/g) || []).length;
  assert.equal(count, 1);
});

test("createSpokenText prepends NIB when the reply doesn't already address him", () => {
  const out = createSpokenText("The task is done.");
  assert.match(out, /^NIB/i);
});

test("createSpokenText shortens very long replies with an on-screen note", () => {
  const long = "This is a sentence. ".repeat(120);
  const out = createSpokenText(long);
  assert.match(out, /full detail is on screen/i);
  assert.ok(out.length < long.length);
});

test("createSpokenText handles empty input without throwing", () => {
  assert.equal(createSpokenText(""), "");
  assert.equal(createSpokenText(null), "");
});

test("sanitizeTTSInput strips control characters and normalizes quotes/dashes", () => {
  const out = sanitizeTTSInput("Hello\x01World — test “quoted”");
  assert.doesNotMatch(out, /[\x00-\x1f]/);
  assert.match(out, /- test/);
  assert.match(out, /"quoted"/);
});

test("chunkSpokenText splits long text into pieces under the max size", () => {
  const long = "Sentence number one. Sentence number two. Sentence number three. ".repeat(10);
  const chunks = chunkSpokenText(long, { maxChunkChars: 100 });
  assert.ok(chunks.length > 1);
  for (const c of chunks) assert.ok(c.length <= 120); // small slack for sentence boundaries
});

test("prepareTextForTTS returns displayText, spokenText, and chunks together", () => {
  const result = prepareTextForTTS("**NIB**, here's the plan:\n- step one\n- step two");
  assert.equal(typeof result.displayText, "string");
  assert.equal(typeof result.spokenText, "string");
  assert.ok(Array.isArray(result.chunks));
  assert.doesNotMatch(result.spokenText, /\*\*/);
});

test("prepareTextForTTS defaults to punctuation pauses (no literal break tags) for a non-v3 model", () => {
  const result = prepareTextForTTS("Point one: detail here.", { modelId: "eleven_turbo_v2_5" });
  assert.equal(result.pauseMode, "punctuation");
  assert.doesNotMatch(result.spokenText, /<break/);
});
