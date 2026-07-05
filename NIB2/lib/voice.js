// NIB2 voice engine: ElevenLabs text-to-speech.
// API keys stay server-side. The browser requests finished audio from
// /api/speak and never sees ELEVENLABS_API_KEY.
import { prepareTextForTTS } from "./speech-director.js";

const ELEVEN_BASE = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_MODEL = "eleven_turbo_v2_5";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

function envNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(raw).toLowerCase());
}

function isV3Model(modelId) {
  return /v3/i.test(String(modelId || ""));
}

export function getElevenLabsConfig() {
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL;
  const requestedSpeed = envNumber("ELEVENLABS_SPEED", 0.92);
  const voiceSettings = {
    stability: envNumber("ELEVENLABS_STABILITY", 0.42),
    similarity_boost: envNumber("ELEVENLABS_SIMILARITY_BOOST", 0.85),
    style: envNumber("ELEVENLABS_STYLE", 0.35),
    use_speaker_boost: envBool("ELEVENLABS_USE_SPEAKER_BOOST", true),
  };

  // Eleven v3 controls speed through prompting/audio tags. For v2/v2.5 we send
  // speed when available, and retry without it if the API rejects the field.
  if (!isV3Model(modelId) && requestedSpeed > 0) voiceSettings.speed = requestedSpeed;

  return {
    modelId,
    outputFormat: process.env.ELEVENLABS_OUTPUT_FORMAT || DEFAULT_OUTPUT_FORMAT,
    pauseMode: process.env.ELEVENLABS_PAUSE_MODE || "punctuation",
    maxChunkChars: envNumber("ELEVENLABS_MAX_CHUNK_CHARS", 420),
    requestedSpeed,
    speedSentInPayload: Object.hasOwn(voiceSettings, "speed"),
    voiceSettings,
  };
}

export function voiceSettingsForClient() {
  const cfg = getElevenLabsConfig();
  return {
    model: cfg.modelId,
    outputFormat: cfg.outputFormat,
    pauseMode: cfg.pauseMode,
    maxChunkChars: cfg.maxChunkChars,
    speed: cfg.requestedSpeed,
    speedSentInPayload: cfg.speedSentInPayload,
    voiceSettings: cfg.voiceSettings,
  };
}

export function hasElevenLabs() {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

// Returns { ok, reason } describing why voice is not ready, for /api/status.
export function elevenLabsStatus() {
  const key = Boolean(process.env.ELEVENLABS_API_KEY);
  const voice = Boolean(process.env.ELEVENLABS_VOICE_ID);
  const settings = voiceSettingsForClient();
  if (key && voice) return { ok: true, settings };
  if (!key && !voice) return { ok: false, reason: "no_key_no_voice", settings };
  if (!key) return { ok: false, reason: "no_key", settings };
  return { ok: false, reason: "no_voice", settings };
}

export function buildTTSRequest(text, { config = getElevenLabsConfig(), previousText, nextText } = {}) {
  const body = {
    text,
    model_id: config.modelId,
    voice_settings: config.voiceSettings,
  };
  if (previousText) body.previous_text = previousText;
  if (nextText) body.next_text = nextText;
  return body;
}

export function contentTypeForOutput(format) {
  if (String(format || "").startsWith("wav")) return "audio/wav";
  if (String(format || "").startsWith("pcm")) return "application/octet-stream";
  return "audio/mpeg";
}

async function postToElevenLabs(fetchImpl, url, headers, body) {
  return fetchImpl(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

// Generate speech audio for `text`. Returns a Buffer.
// `fetchImpl` is injectable for tests; defaults to global fetch.
export async function synthesize(text, { fetchImpl = fetch, previousText, nextText } = {}) {
  if (!hasElevenLabs()) {
    const err = new Error("ElevenLabs is not configured.");
    err.code = "not_configured";
    throw err;
  }

  const config = getElevenLabsConfig();
  const prepared = prepareTextForTTS(text, {
    modelId: config.modelId,
    pauseMode: config.pauseMode,
    maxChunkChars: config.maxChunkChars,
  });
  if (!prepared.spokenText) {
    const err = new Error("Nothing to speak.");
    err.code = "empty";
    throw err;
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const url = `${ELEVEN_BASE}/${voiceId}?output_format=${encodeURIComponent(config.outputFormat)}`;
  const headers = {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
    Accept: contentTypeForOutput(config.outputFormat),
  };

  let body = buildTTSRequest(prepared.spokenText, { config, previousText, nextText });
  let res = await postToElevenLabs(fetchImpl, url, headers, body);

  // Some voices/models reject speed. Keep the voice working and document the
  // limitation through status rather than failing the whole speech request.
  if (res.status === 422 && Object.hasOwn(body.voice_settings || {}, "speed")) {
    const retryConfig = { ...config, voiceSettings: { ...config.voiceSettings } };
    delete retryConfig.voiceSettings.speed;
    body = buildTTSRequest(prepared.spokenText, { config: retryConfig, previousText, nextText });
    res = await postToElevenLabs(fetchImpl, url, headers, body);
  }

  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {
      // ignore non-text errors
    }
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
