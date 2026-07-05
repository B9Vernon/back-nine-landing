import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chunkSpokenText,
  CODE_OMISSION,
  prepareTextForTTS,
  stripMarkdownForSpeech,
} from "../lib/speech-director.js";

test("speech director strips markdown and suppresses URLs", () => {
  const spoken = stripMarkdownForSpeech("**Done**: see [docs](https://example.com) and https://example.com/raw");
  assert.doesNotMatch(spoken, /\*\*/);
  assert.doesNotMatch(spoken, /https?:\/\//);
  assert.match(spoken, /Done/);
  assert.match(spoken, /docs/);
});

test("speech director suppresses code blocks unless asked to read them", () => {
  const spoken = stripMarkdownForSpeech("```js\nconsole.log('hi')\n```");
  assert.equal(spoken.trim(), CODE_OMISSION);
  assert.match(stripMarkdownForSpeech("```js\nconsole.log('hi')\n```", { readCodeAloud: true }), /console\.log/);
});

test("prepareTextForTTS adds NIB once and creates natural chunks", () => {
  const result = prepareTextForTTS("NIB, first sentence. NIB, second sentence with **markdown**.", {
    maxChunkChars: 40,
  });
  assert.equal((result.spokenText.match(/\bNIB\b/g) || []).length, 1);
  assert.ok(result.chunks.length >= 2);
  assert.doesNotMatch(result.spokenText, /\*\*/);
});

test("break tags are used only when requested for non-v3 models", () => {
  const withTags = prepareTextForTTS("NIB, I found it: fixed.", {
    modelId: "eleven_turbo_v2_5",
    pauseMode: "ssml",
  });
  assert.equal(withTags.usedBreakTags, true);
  assert.match(withTags.spokenText, /<break time="0\.3s" \/>/);

  const v3 = prepareTextForTTS("NIB, I found it: fixed.", {
    modelId: "eleven_v3",
    pauseMode: "ssml",
  });
  assert.equal(v3.usedBreakTags, false);
  assert.doesNotMatch(v3.spokenText, /<break/);
});

test("chunkSpokenText avoids one giant TTS request", () => {
  const chunks = chunkSpokenText("NIB, one sentence. Two sentence. Three sentence. Four sentence.", {
    maxChunkChars: 24,
  });
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((chunk) => chunk.length <= 32));
});
