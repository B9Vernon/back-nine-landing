// NIB2 API routes. Mounted at /api by server.js.
import express from "express";
import { readMemory, getRelevantContext, savePreference } from "../lib/memory.js";
import { listTasks, addTask, updateTask, completeTask } from "../lib/tasks.js";
import { listSessions, createSessionSummary } from "../lib/sessions.js";
import { hasApiKey, makeClient, runChat, runHandoff, describeApiError, MODEL } from "../lib/claude.js";

// deps.makeClient can be overridden in tests to avoid real API calls.
export function createApiRouter(deps = {}) {
  const clientFactory = deps.makeClient || makeClient;
  const router = express.Router();

  // Optional password gate for everything except /status.
  router.use((req, res, next) => {
    const password = process.env.NIB2_PASSWORD;
    if (!password || req.path === "/status") return next();
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
    });
  });

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
