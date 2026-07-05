// NIB2 voice engine — ElevenLabs text-to-speech.
// The API key lives server-side only; the browser requests finished audio from
// /api/speak and never sees the key. Browser Speech Synthesis is the fallback
// (handled in the frontend) when ElevenLabs is not configured or errors.

import { prepareTextForTTS } from "./speech-director.js";

const ELEVEN_BASE = "https://api.elevenlabs.io/v1/text-to-speech";

// Default model: turbo v2.5 — low latency, good quality, cheaper per character.
// Override with ELEVENLABS_MODEL_ID if you prefer eleven_multilingual_v2, etc.
const DEFAULT_MODEL = "eleven_turbo_v2_5";

export function hasElevenLabs() {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

// Returns { ok, reason } describing why voice isn't ready, for the status endpoint.
export function elevenLabsStatus() {
  const key = Boolean(process.env.ELEVENLABS_API_KEY);
  const voice = Boolean(process.env.ELEVENLABS_VOICE_ID);
  if (key && voice) return { ok: true };
  if (!key && !voice) return { ok: false, reason: "no_key_no_voice" };
  if (!key) return { ok: false, reason: "no_key" };
  return { ok: false, reason: "no_voice" };
}

// Generate speech audio (mp3) for `text`. Returns a Buffer.
// `fetchImpl` is injectable for tests; defaults to global fetch.
//
// Text prep goes through lib/speech-director.js instead of a naive strip: it
// removes markdown properly, turns lists into spoken phrasing, swaps code
// blocks for a dry one-liner instead of reading code aloud, weaves "NIB" in
// once naturally, and trims absurdly long replies with a "the rest is on
// screen" note. We use the prepared `spokenText` in one TTS call — the
// director also exposes pre-split `chunks` for sequential multi-request
// playback, which isn't wired up yet (see README's upgrade list).
export async function synthesize(text, { fetchImpl = fetch } = {}) {
  if (!hasElevenLabs()) {
    const err = new Error("ElevenLabs is not configured.");
    err.code = "not_configured";
    throw err;
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL;
  const { spokenText: clean } = prepareTextForTTS(text, { modelId });
  if (!clean) {
    const err = new Error("Nothing to speak.");
    err.code = "empty";
    throw err;
  }

  const res = await fetchImpl(`${ELEVEN_BASE}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: clean,
      model_id: modelId,
      // Tuned for a calm, composed, human read — not bouncy or robotic.
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    let detail = "";
    try { detail = (await res.text()).slice(0, 300); } catch { /* ignore */ }
    const err = new Error(
      res.status === 401
        ? "ElevenLabs rejected the API key. Check ELEVENLABS_API_KEY in .env.local."
        : `ElevenLabs error (${res.status}). ${detail}`
    );
    err.code = res.status === 401 ? "bad_key" : "api_error";
    err.status = res.status;
    throw err;
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}
