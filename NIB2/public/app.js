/* NIB2 dashboard logic: chat, voice in/out, tasks, memory, session handoffs. */
"use strict";

// ---------- State ----------
const conversation = []; // [{role: "user"|"assistant", content: string}]
let muted = false;
let listening = false;
let recognition = null;
let voices = [];
let currentAudio = null;        // active ElevenLabs <audio> playback, if any
let elevenLabsReady = false;    // does the server have ElevenLabs configured?
let speechRunId = 0;            // increments to cancel stale chunk playback
let lastSpeechResponse = null;  // prepared speech object for replay
const voiceSettings = loadVoiceSettings();

// ---------- Element handles ----------
const el = (id) => document.getElementById(id);
const chatLog = el("chat-log");
const chatInput = el("chat-input");
const btnSend = el("btn-send");
const btnPtt = el("btn-ptt");
const btnStop = el("btn-stop");
const btnReplay = el("btn-replay");
const btnInterrupt = el("btn-interrupt");
const btnMute = el("btn-mute");
const btnClear = el("btn-clear");
const btnExport = el("btn-export");
const liveTranscript = el("transcript-live");
const voiceStatus = el("voice-status");

// ---------- API helper with optional password gate ----------
function authHeaders() {
  const pw = localStorage.getItem("nib2_password");
  return pw ? { "x-nib2-auth": pw } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  let body = {};
  try { body = await res.json(); } catch { /* non-JSON error body */ }

  if (res.status === 401 && body.authRequired) {
    const pw = prompt("NIB2 password:");
    if (pw) {
      localStorage.setItem("nib2_password", pw);
      return api(path, options); // one retry with the new password
    }
    throw new Error("Password required.");
  }
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

// ---------- Chat rendering ----------
function addMessage(role, text, opts = {}) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  if (opts.actions?.length) {
    const note = document.createElement("span");
    note.className = "action-note";
    note.textContent = opts.actions
      .map((a) => `⚡ ${a.action.replace(/_/g, " ")}: ${a.detail?.title || a.detail?.value || a.detail?.kind || ""}`)
      .join("  ·  ");
    div.appendChild(note);
  }
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

function addSystemNote(text) {
  const div = document.createElement("div");
  div.className = "msg system";
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// ---------- Processing state: the interface visibly "thinks" ----------
// Speeds up the heartbeat strip + logo breathing and raises neural-field activity.
let brainView = false;
function setProcessing(on) {
  document.body.classList.toggle("processing", on);
  window.NeuralBG?.setActivity(on ? 1 : (brainView ? 0.7 : 0));
}

// ---------- Brain view: side panels away, master-brain logo centre stage ----------
// Chat stays available as a slim translucent strip at the bottom (CSS).
const btnBrain = el("btn-brain");
function setBrainView(on) {
  brainView = on;
  document.body.classList.toggle("brainview", on);
  btnBrain.classList.toggle("active", on);
  btnBrain.textContent = on ? "🧠 Exit brain view" : "🧠 Brain view";
  window.NeuralBG?.setActivity(on ? 0.7 : 0);
  window.NeuralBG?.setHub?.(on);
  if (on) {
    window.NeuralBG?.pulse?.();
    setTimeout(() => window.NeuralBG?.pulse?.(), 400);
  }
}
btnBrain.addEventListener("click", () => setBrainView(!brainView));
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && brainView) setBrainView(false);
});

// ---------- Sending ----------
async function sendMessage(text) {
  const clean = String(text || "").trim();
  if (!clean) return;

  chatInput.value = "";
  addMessage("user", clean);
  conversation.push({ role: "user", content: clean });

  btnSend.disabled = true;
  setProcessing(true);
  const thinkingEl = addMessage("nib2", "…processing. Try to look busy.", {});
  thinkingEl.classList.add("thinking");

  try {
    const { reply, actions, speech } = await api("/chat", {
      method: "POST",
      body: JSON.stringify({ messages: conversation }),
    });
    thinkingEl.remove();
    conversation.push({ role: "assistant", content: reply });
    addMessage("nib2", reply, { actions });
    window.NeuralBG?.pulse?.(); // a visible "thought" burst as the answer lands
    lastSpeechResponse = speech || { spokenText: reply, chunks: [reply] };
    speak(lastSpeechResponse);
    if (actions?.length) {
      refreshTasks();
      refreshMemory();
    }
  } catch (err) {
    thinkingEl.remove();
    addSystemNote(`⚠ ${err.message}`);
  } finally {
    setProcessing(false);
    btnSend.disabled = false;
    chatInput.focus();
  }
}

btnSend.addEventListener("click", () => sendMessage(chatInput.value));
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value);
  }
});

// ---------- Clear conversation ----------
btnClear.addEventListener("click", () => {
  if (conversation.length && !confirm("Clear the current conversation? (Saved memory and tasks are untouched.)")) return;
  conversation.length = 0;
  chatLog.innerHTML = "";
  addSystemNote("Conversation cleared. Memory, tasks, and handoffs remain intact.");
});

// ---------- Session handoff / export ----------
btnExport.addEventListener("click", async () => {
  if (!conversation.length) {
    addSystemNote("Nothing to summarize yet. An empty session is technically flawless, but unhelpful.");
    return;
  }
  btnExport.disabled = true;
  setProcessing(true);
  addSystemNote("Writing session handoff…");
  try {
    const { session } = await api("/sessions/handoff", {
      method: "POST",
      body: JSON.stringify({ messages: conversation }),
    });
    addMessage("nib2", session.summary);
    speak("Handoff saved.");
    downloadText(`NIB2-handoff-${session.createdAt.slice(0, 10)}-${session.id}.md`, session.summary);
    refreshSessions();
  } catch (err) {
    addSystemNote(`⚠ ${err.message}`);
  } finally {
    setProcessing(false);
    btnExport.disabled = false;
  }
});

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------- Voice input (speech recognition) ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function voiceInputAvailable() {
  return Boolean(SR) && (window.isSecureContext || location.hostname === "localhost");
}

const dictationSupported = voiceInputAvailable();

if (dictationSupported) {
  recognition = new SR();
  recognition.lang = "en-CA";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (const result of event.results) {
      if (result.isFinal) finalText += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (interim) {
      liveTranscript.hidden = false;
      liveTranscript.textContent = `“${interim}”`;
    }
    if (finalText) {
      liveTranscript.hidden = true;
      sendMessage(finalText);
    }
  };
  recognition.onstart = () => setListening(true);
  recognition.onend = () => setListening(false);
  recognition.onerror = (e) => {
    setListening(false);
    liveTranscript.hidden = true;
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      addSystemNote("Microphone blocked. Click the 🔒/camera icon in the address bar → allow the microphone, then try again. (Text still works.)");
    } else if (e.error === "no-speech") {
      addSystemNote("I was listening but heard nothing. Usually this means Windows is using the wrong microphone — check Settings → System → Sound → Input, pick the mic you're actually talking into, and make sure its input level moves when you speak.");
    } else if (e.error === "audio-capture") {
      addSystemNote("No working microphone found. Plug one in (or enable it in Settings → System → Sound → Input) and try again.");
    } else if (e.error === "network") {
      addSystemNote("Speech recognition couldn't reach its service. Chrome/Edge send audio to their cloud recognizer — check the internet connection and try again.");
    } else if (e.error !== "aborted") {
      addSystemNote(`⚠ Voice input error: ${e.error}`);
    }
  };
} else {
  btnPtt.disabled = true;
  btnPtt.title = "Voice input unavailable in this browser/context";
  voiceStatus.textContent = "Voice input unavailable";
  addSystemNote(
    SR
      ? "Voice input needs a secure context. It works on the server computer at http://localhost — from the other computer, typing works fine (see README for options)."
      : "This browser has no speech recognition (try Chrome or Edge). Typing works fine."
  );
}

function setListening(on) {
  listening = on;
  btnPtt.classList.toggle("active", on);
  btnPtt.textContent = on ? "● Listening…" : "🎙 Talk";
  voiceStatus.textContent = on ? "● Listening…" : (wakeWordEnabled ? "👂 Wake standby" : "Voice idle");
  voiceStatus.classList.toggle("listening", on);
  if (!on) {
    liveTranscript.hidden = true;
    // Command dictation just ended — resume listening for the wake phrase.
    if (wakeWordEnabled) startWakeListening();
  }
}

// Shared dictation flow used by BOTH the Talk button and the Ctrl+Q hotkey.
function startDictation() {
  if (!recognition) {
    addSystemNote("Voice input isn't available here (see the note above). Type instead.");
    return;
  }
  if (listening) return;
  stopSpeaking();                 // don't transcribe NIB2's own voice
  try { recognition.start(); }
  catch { /* already starting — harmless */ }
}
function stopDictation() {
  if (recognition && listening) recognition.stop();
}
function toggleDictation() {
  if (listening) stopDictation();
  else startDictation();
}

btnPtt.addEventListener("click", toggleDictation);

// ---------- Ctrl+Q hotkey: toggle microphone dictation ----------
// One module-level listener (never stacks). Ctrl+Q is free on Windows browsers
// (the quit shortcut is Cmd+Q on macOS); we preventDefault to be safe. If a
// browser ever claims it, the Talk button always works as the fallback.
function onHotkey(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "q" || e.key === "Q")) {
    e.preventDefault();
    toggleDictation();
  }
}
window.addEventListener("keydown", onHotkey);

// ---------- Wake word: "Hey NIB2" starts dictation hands-free ----------
// Opt-in (off by default) — it means the mic stays on in the background, so
// this only starts listening when you explicitly turn it on.
// Two-beat design on purpose: say the wake phrase, pause, THEN your command.
// Browser speech recognition can't reliably parse a wake phrase out of one
// run-on sentence, so this uses a dedicated listener that hands off to the
// normal dictation flow once it hears the phrase.
let wakeWordEnabled = false;
let wakeRecognition = null;
const btnWake = el("btn-wake");
const WAKE_PHRASE = /\bhey\s*n\.?\s*i\.?\s*b\.?\s*(2|two)?\b/i;

function startWakeListening() {
  if (!dictationSupported || !wakeWordEnabled || listening) return;
  wakeRecognition = new SR();
  wakeRecognition.lang = "en-CA";
  wakeRecognition.continuous = true;
  wakeRecognition.interimResults = true;
  wakeRecognition.onresult = (event) => {
    const last = event.results[event.results.length - 1];
    if (WAKE_PHRASE.test(last[0].transcript)) {
      wakeRecognition.onend = null; // this one-shot listener is done; don't auto-restart it
      wakeRecognition.stop();
      startDictation();
    }
  };
  wakeRecognition.onend = () => {
    if (wakeWordEnabled && !listening) setTimeout(startWakeListening, 250);
  };
  wakeRecognition.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      addSystemNote("Wake word turned off — microphone access was denied.");
      setWakeWord(false);
    }
    // "no-speech"/"aborted" happen constantly in always-on listening — ignore.
  };
  try { wakeRecognition.start(); } catch { /* already running */ }
}

function stopWakeListening() {
  if (wakeRecognition) {
    wakeRecognition.onend = null; // prevent the auto-restart loop
    wakeRecognition.stop();
    wakeRecognition = null;
  }
}

function setWakeWord(on) {
  wakeWordEnabled = on;
  btnWake.classList.toggle("active", on);
  btnWake.textContent = on ? "👂 Wake word on" : "👂 Wake word off";
  if (!listening) voiceStatus.textContent = on ? "👂 Wake standby" : "Voice idle";
  if (on) startWakeListening();
  else stopWakeListening();
}

if (dictationSupported) {
  btnWake.addEventListener("click", () => setWakeWord(!wakeWordEnabled));
} else {
  btnWake.disabled = true;
  btnWake.title = "Wake word needs voice input, which isn't available in this browser/context";
}

// ---------- Voice output (speech synthesis) ----------
function loadVoiceSettings() {
  try {
    return { rate: 0.92, pitch: 0.95, volume: 1.0, voiceName: null, ...JSON.parse(localStorage.getItem("nib2_voice") || "{}") };
  } catch {
    return { rate: 0.92, pitch: 0.95, volume: 1.0, voiceName: null };
  }
}
function saveVoiceSettings() {
  localStorage.setItem("nib2_voice", JSON.stringify(voiceSettings));
}

function pickDefaultVoice(list) {
  // Preference order: en-CA Natural/Online → en-CA any → best-quality English → any English → first voice.
  // "Natural"/"Online" voices are cloud-quality (Microsoft/Google); legacy SAPI voices
  // (plain "Microsoft David/Zira/Mark") are the robotic-sounding ones — ranked last.
  const qualityRank = ["natural", "neural", "premium", "online", "google"];

  const enCaQuality = list.find(
    (v) => v.lang?.toLowerCase().startsWith("en-ca") && qualityRank.some((k) => new RegExp(k, "i").test(v.name))
  );
  if (enCaQuality) return enCaQuality;

  const enCa = list.find((v) => v.lang?.toLowerCase().startsWith("en-ca"));
  if (enCa) return enCa;

  for (const keyword of qualityRank) {
    const match = list.find((v) => /^en/i.test(v.lang) && new RegExp(keyword, "i").test(v.name));
    if (match) return match;
  }
  return list.find((v) => /^en/i.test(v.lang)) || list[0] || null;
}

// Pick the best browser fallback voice silently (no dropdown — ElevenLabs is
// the main engine; the browser voice only speaks if ElevenLabs is down).
function refreshVoices() {
  if (!window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  let chosen = voices.find((v) => v.name === voiceSettings.voiceName);
  if (!chosen) chosen = pickDefaultVoice(voices);
  if (chosen) voiceSettings.voiceName = chosen.name;
}

if (window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
} else {
  el("voice-note").textContent = "This browser has no speech synthesis. NIB2 will remain eloquently silent.";
  btnMute.disabled = true;
}

// "Talking" state: the b9 hub logo blazes green and the field lights up.
function setTalking(on) {
  document.body.classList.toggle("talking", on);
  window.NeuralBG?.setTalking?.(on);
  if (on) {
    voiceStatus.textContent = "Speaking";
    stopWakeListening();
  } else if (!listening) {
    voiceStatus.textContent = wakeWordEnabled ? "👂 Wake standby" : "Voice idle";
    if (wakeWordEnabled) startWakeListening();
  }
}

// Stop any voice output — both the ElevenLabs audio element and browser TTS.
function stopSpeaking() {
  speechRunId++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  window.speechSynthesis?.cancel();
  setTalking(false);
}

// Speak a reply. Prefers ElevenLabs (server-side, human voice); if that isn't
// configured or fails, falls back to the browser's built-in speech synthesis.
async function speakLegacy(text) {
  if (muted || !text) return;
  stopSpeaking();

  if (elevenLabsReady) {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.volume = voiceSettings.volume;
        currentAudio = audio;
        audio.onended = () => { if (currentAudio === audio) { currentAudio = null; setTalking(false); } };
        audio.onpause = () => { if (currentAudio === audio) setTalking(false); };
        setTalking(true);
        await audio.play();
        return; // ElevenLabs handled it
      }
      // Non-OK (e.g. 503 not configured) → fall through to browser TTS.
    } catch {
      // Network/playback error → fall through to browser TTS.
    }
  }
  speakBrowser(text);
}

function normalizeSpeechInput(input) {
  if (typeof input === "string") return { spokenText: input, chunks: [input] };
  const spokenText = input?.spokenText || input?.text || "";
  const chunks = Array.isArray(input?.chunks) && input.chunks.length ? input.chunks : [spokenText];
  return { spokenText, chunks: chunks.filter(Boolean) };
}

function playAudioElement(audio, runId) {
  return new Promise((resolve, reject) => {
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onpause = () => {
      if (speechRunId !== runId) resolve();
    };
    audio.onerror = () => reject(new Error("Audio playback failed."));
    audio.play().catch(reject);
  });
}

async function playElevenLabsChunks(chunks, runId) {
  for (let i = 0; i < chunks.length; i++) {
    if (speechRunId !== runId) return;
    const res = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        text: chunks[i],
        previousText: chunks[i - 1] || "",
        nextText: chunks[i + 1] || "",
      }),
    });
    if (!res.ok) throw new Error("ElevenLabs unavailable.");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = voiceSettings.volume;
    currentAudio = audio;
    setTalking(true);
    await playAudioElement(audio, runId);
    URL.revokeObjectURL(url);
  }
}

async function speak(input) {
  const prepared = normalizeSpeechInput(input);
  if (muted || !prepared.spokenText) return;
  stopSpeaking();
  const runId = speechRunId;

  if (elevenLabsReady) {
    try {
      await playElevenLabsChunks(prepared.chunks, runId);
      setTalking(false);
      return;
    } catch {
      setTalking(false);
    }
  }
  speakBrowser(prepared.spokenText);
}

// Browser Speech Synthesis fallback.
function speakBrowser(text) {
  if (muted || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const clean = text
    .replace(/```[\s\S]*?```/g, " Code block omitted. ")
    .replace(/[*_#`>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
  const utter = new SpeechSynthesisUtterance(clean);
  const v = voices.find((x) => x.name === voiceSettings.voiceName);
  if (v) utter.voice = v;
  utter.rate = voiceSettings.rate;
  utter.pitch = voiceSettings.pitch;
  utter.volume = voiceSettings.volume;
  utter.onstart = () => setTalking(true);
  utter.onend = () => setTalking(false);
  utter.onerror = () => setTalking(false);
  window.speechSynthesis.speak(utter);
}

btnMute.addEventListener("click", () => {
  muted = !muted;
  if (muted) stopSpeaking();
  btnMute.textContent = muted ? "🔇 Voice off" : "🔊 Voice on";
  btnMute.classList.toggle("active", muted);
});

// Stop voice button: NIB2 shuts up immediately. The Talk button also cuts the
// voice off before it starts listening, so "interrupt and speak" is one press.
btnStop.addEventListener("click", stopSpeaking);
btnReplay.addEventListener("click", () => {
  if (!lastSpeechResponse) return addSystemNote("Nothing to replay yet.");
  speak(lastSpeechResponse);
});
btnInterrupt.addEventListener("click", () => {
  stopSpeaking();
  startDictation();
});

// Volume is the one knob that applies to BOTH ElevenLabs audio and the browser
// fallback. (Rate/pitch sliders were removed — ElevenLabs audio is pre-rendered
// and ignores them.)
{
  const input = el("voice-volume");
  input.value = voiceSettings.volume;
  el("volume-val").textContent = Number(voiceSettings.volume).toFixed(2);
  input.addEventListener("input", (e) => {
    voiceSettings.volume = Number(e.target.value);
    el("volume-val").textContent = Number(e.target.value).toFixed(2);
    if (currentAudio) currentAudio.volume = voiceSettings.volume;
    saveVoiceSettings();
  });
}

// ---------- Tasks panel ----------
async function refreshTasks() {
  const list = el("task-list");
  try {
    const { tasks } = await api("/tasks");
    list.innerHTML = "";
    const open = tasks.filter((t) => t.status !== "complete");
    if (!open.length) {
      list.innerHTML = `<li class="muted">No active tasks. Either impressive or worrying.</li>`;
      return;
    }
    for (const t of open) {
      const li = document.createElement("li");
      li.className = `task-item ${t.status}`;
      const badgeStatus = t.status !== "pending" ? `<span class="badge ${t.status}">${t.status.replace("_", " ")}</span>` : "";
      li.innerHTML = `
        <span class="badge ${t.priority}">${t.priority}</span>
        <span class="title"></span>
        ${badgeStatus}
        <button class="task-done-btn" title="Mark complete">✓</button>`;
      li.querySelector(".title").textContent = t.title;
      li.querySelector(".task-done-btn").addEventListener("click", async () => {
        try {
          await api(`/tasks/${t.id}/complete`, { method: "POST" });
          refreshTasks();
        } catch (err) { addSystemNote(`⚠ ${err.message}`); }
      });
      list.appendChild(li);
    }
  } catch (err) {
    list.innerHTML = `<li class="muted">Tasks unavailable: ${err.message}</li>`;
  }
}
el("btn-refresh-tasks").addEventListener("click", refreshTasks);

// ---------- Memory panel ----------
async function refreshMemory() {
  const panel = el("memory-panel");
  try {
    const { memory } = await api("/memory");
    const sections = [];
    const prefs = Object.entries(memory.preferences || {});
    if (prefs.length) sections.push(`<h3>Preferences</h3><ul>${prefs.map(([k, v]) => `<li><b>${esc(k)}</b>: ${esc(v)}</li>`).join("")}</ul>`);
    if (memory.facts?.length) sections.push(`<h3>Facts</h3><ul>${memory.facts.slice(-8).map((f) => `<li>${esc(f.text)}</li>`).join("")}</ul>`);
    if (memory.projects?.length) sections.push(`<h3>Projects</h3><ul>${memory.projects.slice(-6).map((p) => `<li>${esc(p.text)}</li>`).join("")}</ul>`);
    if (memory.decisions?.length) sections.push(`<h3>Decisions</h3><ul>${memory.decisions.slice(-6).map((d) => `<li>${esc(d.text)}</li>`).join("")}</ul>`);
    panel.classList.remove("muted");
    panel.innerHTML = sections.length ? sections.join("") : `<span class="muted">Nothing stored yet. Tell me something worth remembering.</span>`;
  } catch (err) {
    panel.textContent = `Memory unavailable: ${err.message}`;
  }
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}

// ---------- Sessions panel ----------
async function refreshSessions() {
  const list = el("session-list");
  try {
    const { sessions } = await api("/sessions");
    if (!sessions.length) {
      list.innerHTML = `<li class="muted">None yet. Click 📋 Handoff to save one.</li>`;
      return;
    }
    list.innerHTML = "";
    for (const s of [...sessions].reverse().slice(0, 8)) {
      const li = document.createElement("li");
      li.className = "session-item";
      const firstLine = s.summary.split("\n").find((l) => l.trim() && !l.includes("Pickup Where You Left Off")) || "Session summary";
      li.innerHTML = `<div class="date"></div><div class="preview"></div>`;
      li.querySelector(".date").textContent = new Date(s.createdAt).toLocaleString();
      li.querySelector(".preview").textContent = firstLine.slice(0, 90);
      li.title = "Click to load this handoff into the chat";
      li.addEventListener("click", () => addMessage("nib2", s.summary));
      list.appendChild(li);
    }
  } catch (err) {
    list.innerHTML = `<li class="muted">Sessions unavailable: ${err.message}</li>`;
  }
}

// ---------- Live Vernon BC weather (Environment Canada via the server) ----------
async function refreshWeather() {
  const panel = el("weather-panel");
  try {
    const w = await api("/weather");
    panel.classList.remove("muted");
    const wind = w.windSpeed !== null && w.windSpeed !== undefined
      ? `${w.windSpeed} km/h${w.windDirection ? " " + w.windDirection : ""}${w.windGust ? ` (gusts ${w.windGust})` : ""}`
      : "—";
    panel.innerHTML = `
      <div class="weather-main">
        <span class="weather-temp">${w.temperature !== null ? Math.round(w.temperature * 10) / 10 + "°C" : "—"}</span>
        <span class="weather-cond">${esc(w.condition || (w.forecast?.summary ? w.forecast.summary.split(".")[0] : ""))}</span>
      </div>
      <div class="weather-stats">
        <span class="wstat"><b>Humidity</b> ${w.humidity ?? "—"}%</span>
        <span class="wstat"><b>Wind</b> ${esc(wind)}</span>
        ${w.dewpoint !== null && w.dewpoint !== undefined ? `<span class="wstat"><b>Dew pt</b> ${w.dewpoint}°C</span>` : ""}
        ${w.pressure !== null && w.pressure !== undefined ? `<span class="wstat"><b>Pressure</b> ${w.pressure} kPa</span>` : ""}
      </div>
      <div class="weather-meta">Environment Canada · updated ${new Date(w.fetchedAt).toLocaleTimeString()}</div>`;
  } catch (err) {
    panel.classList.add("muted");
    panel.textContent = `Weather unavailable: ${err.message}`;
  }
}
setInterval(refreshWeather, 10 * 60 * 1000); // matches the server's 10-min cache

// ---------- API status ----------
async function checkStatus() {
  const dot = el("api-dot");
  const text = el("api-status-text");
  try {
    const s = await api("/status");
    if (s.hasApiKey) {
      dot.className = "dot dot-ok";
      text.textContent = `Online · ${s.model}`;
    } else {
      dot.className = "dot dot-warn";
      text.textContent = "No API key — see .env.local";
      addSystemNote("The server is up but has no Anthropic API key. Copy .env.example to .env.local, add your key, restart the server. Then we can talk properly.");
    }

    // Voice engine indicator + which TTS the frontend will use.
    elevenLabsReady = Boolean(s.voice?.elevenLabs);
    const engine = el("voice-engine");
    if (engine) {
      engine.textContent = elevenLabsReady
        ? "Voice engine: ElevenLabs (human voice)"
        : "Voice engine: browser fallback (add ElevenLabs keys in .env.local for a human voice)";
      engine.classList.toggle("engine-on", elevenLabsReady);
    }

    // Gmail status pill.
    const gDot = el("gmail-dot");
    const gText = el("gmail-status-text");
    if (gDot && gText) {
      if (s.gmail?.connected) {
        gDot.className = "dot dot-ok"; gText.textContent = "Gmail on";
      } else if (s.gmail?.reason === "not_authorized") {
        gDot.className = "dot dot-warn"; gText.textContent = "Gmail: authorize";
        el("gmail-status").title = "Gmail is set up but not authorized. Visit /api/gmail/auth on the server computer.";
      } else {
        gDot.className = "dot dot-unknown"; gText.textContent = "Gmail off";
        el("gmail-status").title = "Gmail not configured — see README.";
      }
    }
  } catch (err) {
    dot.className = "dot dot-bad";
    text.textContent = "Server unreachable";
    addSystemNote(`⚠ Cannot reach the NIB2 server: ${err.message}`);
  }
}

// ---------- Boot ----------
addSystemNote("NIB2 online. State your business — or just type something and I'll cope.");
checkStatus();
refreshTasks();
refreshMemory();
refreshSessions();
refreshWeather();
chatInput.focus();
