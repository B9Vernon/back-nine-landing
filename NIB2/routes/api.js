// NIB2 API routes. Mounted at /api by server.js.
import express from "express";
import { readMemory, getRelevantContext, savePreference } from "../lib/memory.js";
import { listTasks, addTask, updateTask, completeTask } from "../lib/tasks.js";
import { listSessions, createSessionSummary } from "../lib/sessions.js";
import { hasApiKey, makeClient, runChat, runHandoff, describeApiError, MODEL } from "../lib/claude.js";
import { synthesize, hasElevenLabs, elevenLabsStatus } from "../lib/voice.js";
import { getVernonWeather } from "../lib/weather.js";
import * as gmail from "../lib/gmail.js";

// deps.makeClient / deps.synthesize / deps.getWeather can be overridden in tests.
export function createApiRouter(deps = {}) {
  const clientFactory = deps.makeClient || makeClient;
  const speak = deps.synthesize || synthesize;
  const weather = deps.getWeather || getVernonWeather;
  const router = express.Router();

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
      voice: { elevenLabs: hasElevenLabs(), status: elevenLabsStatus() },
      gmail: gmail.gmailStatus(),
    });
  });

  // --- Voice: ElevenLabs TTS. Returns audio/mpeg, or a JSON error the frontend
  //     uses to fall back to browser speech synthesis. Key stays server-side. ---
  router.post("/speak", async (req, res) => {
    const { text } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "No text to speak." });
    }
    if (!hasElevenLabs()) {
      return res.status(503).json({ error: "ElevenLabs not configured.", fallback: true });
    }
    try {
      const audio = await speak(String(text));
      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "no-store");
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
      res.json(result);
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
