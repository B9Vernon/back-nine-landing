/* NIB2 dashboard logic: chat, voice in/out, tasks, memory, session handoffs. */
"use strict";

// ---------- State ----------
const conversation = []; // [{role: "user"|"assistant", content: string}]
let muted = false;
let listening = false;
let recognition = null;
let voices = [];
const voiceSettings = loadVoiceSettings();

// ---------- Element handles ----------
const el = (id) => document.getElementById(id);
const chatLog = el("chat-log");
const chatInput = el("chat-input");
const btnSend = el("btn-send");
const btnPtt = el("btn-ptt");
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

// ---------- Sending ----------
async function sendMessage(text) {
  const clean = String(text || "").trim();
  if (!clean) return;

  chatInput.value = "";
  addMessage("user", clean);
  conversation.push({ role: "user", content: clean });

  btnSend.disabled = true;
  const thinkingEl = addMessage("nib2", "…processing. Try to look busy.", {});
  thinkingEl.classList.add("thinking");

  try {
    const { reply, actions } = await api("/chat", {
      method: "POST",
      body: JSON.stringify({ messages: conversation }),
    });
    thinkingEl.remove();
    conversation.push({ role: "assistant", content: reply });
    addMessage("nib2", reply, { actions });
    speak(reply);
    if (actions?.length) {
      refreshTasks();
      refreshMemory();
    }
  } catch (err) {
    thinkingEl.remove();
    addSystemNote(`⚠ ${err.message}`);
  } finally {
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

if (voiceInputAvailable()) {
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
    if (e.error === "not-allowed") {
      addSystemNote("Microphone access denied. Allow the mic in your browser settings if you want to talk to me.");
    } else if (e.error !== "aborted" && e.error !== "no-speech") {
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
  voiceStatus.textContent = on ? "● Listening…" : "Voice idle";
  voiceStatus.classList.toggle("listening", on);
  if (!on) liveTranscript.hidden = true;
}

btnPtt.addEventListener("click", () => {
  if (!recognition) return;
  if (listening) recognition.stop();
  else {
    window.speechSynthesis?.cancel(); // don't transcribe NIB2's own voice
    try { recognition.start(); } catch { /* already started */ }
  }
});

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

function refreshVoices() {
  if (!window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  const select = el("voice-select");
  select.innerHTML = "";
  for (const v of voices) {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  }

  let chosen = voices.find((v) => v.name === voiceSettings.voiceName);
  if (!chosen) {
    chosen = pickDefaultVoice(voices);
    const note = el("voice-note");
    if (chosen && !chosen.lang?.toLowerCase().startsWith("en-ca")) {
      note.textContent = "Canadian English voice unavailable on this machine. Using the best available English voice. Civilization continues.";
    } else {
      note.textContent = "";
    }
  }
  if (chosen) {
    select.value = chosen.name;
    voiceSettings.voiceName = chosen.name;
  }
}

if (window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
} else {
  el("voice-note").textContent = "This browser has no speech synthesis. NIB2 will remain eloquently silent.";
  btnMute.disabled = true;
}

function speak(text) {
  if (muted || !window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  // Strip markdown noise so the voice doesn't read asterisks aloud.
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
  window.speechSynthesis.speak(utter);
}

btnMute.addEventListener("click", () => {
  muted = !muted;
  if (muted) window.speechSynthesis?.cancel();
  btnMute.textContent = muted ? "🔇 Voice off" : "🔊 Voice on";
  btnMute.classList.toggle("active", muted);
});

el("voice-select").addEventListener("change", (e) => {
  voiceSettings.voiceName = e.target.value;
  saveVoiceSettings();
  speak("Voice updated. Naturally, I sound excellent.");
});
for (const [id, key, labelId] of [
  ["voice-rate", "rate", "rate-val"],
  ["voice-pitch", "pitch", "pitch-val"],
  ["voice-volume", "volume", "volume-val"],
]) {
  const input = el(id);
  input.value = voiceSettings[key];
  el(labelId).textContent = Number(voiceSettings[key]).toFixed(2);
  input.addEventListener("input", (e) => {
    voiceSettings[key] = Number(e.target.value);
    el(labelId).textContent = Number(e.target.value).toFixed(2);
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
chatInput.focus();
