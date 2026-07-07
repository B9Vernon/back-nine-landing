// NIB2 API routes. Mounted at /api by server.js.
import express from "express";
import { readMemory, getRelevantContext, savePreference } from "../lib/memory.js";
import { listTasks, addTask, updateTask, completeTask } from "../lib/tasks.js";
import { listSessions, createSessionSummary } from "../lib/sessions.js";
import { hasApiKey, makeClient, runChat, runHandoff, describeApiError, MODEL } from "../lib/claude.js";
import { synthesize, hasElevenLabs, elevenLabsStatus, voiceSettingsForClient, contentTypeForOutput } from "../lib/voice.js";
import { prepareTextForTTS } from "../lib/speech-director.js";
import { getVernonWeather } from "../lib/weather.js";
import { readCentre, gatherIntel, generateBrief } from "../lib/command-centre.js";
import { getAllFeeds } from "../lib/feeds.js";
import { getIndices } from "../lib/markets.js";
import { readBookings, writeBookings } from "../lib/bookings.js";
import { isN8nConfigured, fetchUnreadViaN8n, testN8nConnection, createGmailDraftViaN8n, weeklyBriefViaN8n } from "../lib/n8n.js";
import * as gmail from "../lib/gmail.js";

// deps.makeClient / deps.synthesize / deps.getWeather / deps.gatherIntel /
// deps.generateBrief can be overridden in tests.
export function createApiRouter(deps = {}) {
  const clientFactory = deps.makeClient || makeClient;
  const speak = deps.synthesize || synthesize;
  const weather = deps.getWeather || getVernonWeather;
  const intelFn = deps.gatherIntel || gatherIntel;
  const briefFn = deps.generateBrief || generateBrief;
  const feedsFn = deps.getAllFeeds || getAllFeeds;
  const marketsFn = deps.getIndices || getIndices;
  const unreadFn = deps.listUnread || gmail.listUnread;
  const n8nUnreadFn = deps.n8nUnread || fetchUnreadViaN8n;
  const n8nTestFn = deps.n8nTest || testN8nConnection;
  const n8nDraftFn = deps.n8nDraft || createGmailDraftViaN8n;
  const n8nBriefFn = deps.n8nBrief || weeklyBriefViaN8n;
  const router = express.Router();

  // Gmail can be connected two ways; n8n wins when both exist.
  function gmailState() {
    if (isN8nConfigured()) return { connected: true, via: "n8n" };
    const s = gmail.gmailStatus();
    return s.connected ? { ...s, via: "oauth" } : s;
  }

  // Optional password gate. Exempt: /status (health check) and the Gmail OAuth
  // redirect endpoints, which are browser navigations from Google without our header.
  const OPEN_PATHS = new Set(["/status", "/gmail/auth", "/gmail/callback"]);
  router.use((req, res, next) => {
    const password = process.env.NIB2_PASSWORD;
    if (!password || OPEN_PATHS.has(req.path)) return next();
    if (req.get("x-nib2-auth") === password) return next();
    res.status(401).json({ error: "NIB2 password required.", authRequired: true });
  });

  router.get("/status", (req, res) => {
    res.json({
      ok: true,
      model: MODEL,
      hasApiKey: hasApiKey(),
      authRequired: Boolean(process.env.NIB2_PASSWORD),
      openTasks: listTasks().filter((t) => t.status !== "complete").length,
      sessions: listSessions().length,
      voice: { elevenLabs: hasElevenLabs(), status: elevenLabsStatus(), settings: voiceSettingsForClient() },
      gmail: gmailState(),
    });
  });

  // --- Voice: ElevenLabs TTS. Returns audio/mpeg, or a JSON error the frontend
  //     uses to fall back to browser speech synthesis. Key stays server-side. ---
  router.post("/speak", async (req, res) => {
    const { text, previousText, nextText } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "No text to speak." });
    }
    if (!hasElevenLabs()) {
      return res.status(503).json({ error: "ElevenLabs not configured.", fallback: true });
    }
    try {
      const audio = await speak(String(text), { previousText, nextText });
      res.set("Content-Type", contentTypeForOutput(voiceSettingsForClient().outputFormat));
      res.set("Cache-Control", "no-store");
      res.set("X-NIB2-Speech-Director", "on");
      res.send(audio);
    } catch (err) {
      res.status(502).json({ error: err.message || "Voice synthesis failed.", fallback: true });
    }
  });

  // --- Live Vernon BC weather (Environment Canada, cached 10 min) ---
  router.get("/weather", async (req, res) => {
    try {
      res.json(await weather());
    } catch (err) {
      res.status(503).json({ error: `Weather unavailable: ${err.message}` });
    }
  });

  // --- B9 Command Centre: weekly operating intelligence ---
  router.get("/command-centre", (req, res) => res.json(readCentre()));

  // Refresh live signals only (weather + Vernon Matters). Fast, no AI call.
  router.post("/command-centre/intel", async (req, res) => {
    try {
      res.json(await intelFn());
    } catch (err) {
      res.status(503).json({ error: `Intel refresh failed: ${err.message}` });
    }
  });

  // Generate the full weekly brief (uses the Anthropic API).
  router.post("/command-centre/brief", async (req, res) => {
    if (!hasApiKey()) {
      return res.status(503).json({ error: "No Anthropic API key configured — cannot generate the brief." });
    }
    try {
      res.json(await briefFn({ client: clientFactory() }));
    } catch (err) {
      res.status(502).json({ error: `Brief generation failed: ${err.message}` });
    }
  });

  // --- News feeds: CBC Sports, Financial Post, CNBC Markets (real RSS) ---
  router.get("/feeds", async (req, res) => {
    try {
      res.json(await feedsFn());
    } catch (err) {
      res.status(503).json({ error: `Feeds unavailable: ${err.message}` });
    }
  });

  // --- Live index tickers: Dow, S&P 500, Nasdaq, TSX (Yahoo Finance) ---
  router.get("/markets", async (req, res) => {
    try {
      res.json(await marketsFn());
    } catch (err) {
      res.status(503).json({ error: `Markets unavailable: ${err.message}` });
    }
  });

  // --- Unread Gmail for the Command Centre card (n8n webhook preferred) ---
  router.get("/gmail/unread", async (req, res) => {
    if (isN8nConfigured()) {
      try {
        return res.json({ connected: true, via: "n8n", emails: await n8nUnreadFn() });
      } catch (err) {
        return res.status(502).json({ error: `n8n Gmail read failed: ${err.message}`, via: "n8n" });
      }
    }
    if (!gmail.isConnected()) {
      return res.json({ connected: false, reason: gmail.gmailStatus().reason, emails: [] });
    }
    try {
      res.json({ connected: true, via: "oauth", emails: await unreadFn(10) });
    } catch (err) {
      res.status(502).json({ error: `Gmail read failed: ${err.message}` });
    }
  });

  // --- n8n Command Router: quick actions from the Command Centre panel ---
  router.get("/n8n/status", (req, res) => res.json({ configured: isN8nConfigured() }));

  router.post("/n8n/command", async (req, res) => {
    if (!isN8nConfigured()) {
      return res.status(503).json({ error: "n8n is not configured. Set N8N_WEBHOOK_URL in .env.local, then restart NIB2." });
    }
    const { command, to, subject, body } = req.body || {};
    try {
      let result;
      if (command === "connection_test") result = await n8nTestFn();
      else if (command === "gmail_summary") result = { emails: await n8nUnreadFn({ force: true }) };
      else if (command === "gmail_draft") {
        if (!to || !subject) return res.status(400).json({ error: "Draft needs at least a recipient and subject." });
        result = await n8nDraftFn({ to, subject, body: body || "" });
      } else if (command === "weekly_b9_brief") result = await n8nBriefFn();
      else return res.status(400).json({ error: `Unknown command: ${command}` });
      res.json({ ok: true, command, result });
    } catch (err) {
      res.status(502).json({ error: err.message, code: err.code });
    }
  });

  // --- Today's bookings (manual sync until B9 corporate provides an API) ---
  router.get("/bookings", (req, res) => res.json(readBookings()));
  router.post("/bookings", (req, res) => {
    const { bookings, source } = req.body || {};
    try {
      res.json(writeBookings(bookings, source || "manual"));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Gmail OAuth (browser redirects) ---
  router.get("/gmail/auth", async (req, res) => {
    try {
      const url = await gmail.getAuthUrl();
      res.redirect(url);
    } catch (err) {
      res.status(503).send(`Gmail not ready: ${err.message}`);
    }
  });
  router.get("/gmail/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing authorization code.");
    try {
      await gmail.handleCallback(String(code));
      res.send("<h2>NIB2: Gmail connected.</h2><p>You can close this tab and return to NIB2.</p>");
    } catch (err) {
      res.status(502).send(`Gmail authorization failed: ${err.message}`);
    }
  });
  router.get("/gmail/status", (req, res) => res.json(gmail.gmailStatus()));

  router.post("/chat", async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Send at least one message. Silence is not a prompt." });
    }
    const last = messages[messages.length - 1];
    if (!last || last.role !== "user" || !String(last.content || "").trim()) {
      return res.status(400).json({ error: "The last message must be a non-empty user message." });
    }
    if (!hasApiKey()) {
      return res.status(503).json({
        error:
          "No Anthropic API key configured. Copy .env.example to .env.local, add your ANTHROPIC_API_KEY, and restart the server.",
      });
    }
    try {
      const result = await runChat({
        client: clientFactory(),
        messages,
        context: getRelevantContext(),
      });
      const settings = voiceSettingsForClient();
      const speech = prepareTextForTTS(result.reply, {
        modelId: settings.model,
        pauseMode: settings.pauseMode,
        maxChunkChars: settings.maxChunkChars,
      });
      res.json({ ...result, displayText: speech.displayText, spokenText: speech.spokenText, speech });
    } catch (err) {
      const { status, message } = describeApiError(err);
      res.status(status).json({ error: message });
    }
  });

  // --- Tasks ---
  router.get("/tasks", (req, res) => res.json({ tasks: listTasks() }));

  router.post("/tasks", (req, res) => {
    try {
      res.status(201).json({ task: addTask(req.body || {}) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.patch("/tasks/:id", (req, res) => {
    try {
      res.json({ task: updateTask(req.params.id, req.body || {}) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post("/tasks/:id/complete", (req, res) => {
    try {
      res.json({ task: completeTask(req.params.id) });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Memory ---
  router.get("/memory", (req, res) => res.json({ memory: readMemory() }));

  router.post("/memory/preference", (req, res) => {
    const { key, value } = req.body || {};
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Both 'key' and 'value' are required." });
    }
    res.json({ memory: savePreference(String(key), String(value)) });
  });

  // --- Sessions / handoff ---
  router.get("/sessions", (req, res) => res.json({ sessions: listSessions() }));

  router.post("/sessions/handoff", async (req, res) => {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Nothing to summarize — the conversation is empty." });
    }
    if (!hasApiKey()) {
      return res.status(503).json({ error: "No Anthropic API key configured, so I cannot write the summary." });
    }
    try {
      const summary = await runHandoff({ client: clientFactory(), messages });
      const entry = createSessionSummary(summary, { messageCount: messages.length });
      res.json({ session: entry });
    } catch (err) {
      const { status, message } = describeApiError(err);
      res.status(status).json({ error: message });
    }
  });

  return router;
}
