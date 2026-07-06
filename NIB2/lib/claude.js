// NIB2's connection to the Anthropic API, including the tool loop that lets
// NIB2 create tasks and save memories itself.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { addTask, updateTask, completeTask, PRIORITIES, STATUSES } from "./tasks.js";
import { savePreference, saveEntry } from "./memory.js";
import { getVernonWeather } from "./weather.js";
import * as gmail from "./gmail.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const MODEL = process.env.NIB2_MODEL || "claude-opus-4-8";

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getSystemPrompt() {
  return fs.readFileSync(path.join(__dirname, "..", "prompts", "nib2-system-prompt.md"), "utf8");
}

export function makeClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const TOOLS = [
  {
    name: "add_task",
    description:
      "Create a task on the user's task list. Call this when the user mentions something they need to do, track, build, or follow up on.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short, clear task title" },
        priority: { type: "string", enum: PRIORITIES, description: "Task priority" },
        notes: { type: "string", description: "Optional extra detail" },
      },
      required: ["title"],
    },
  },
  {
    name: "update_task",
    description:
      "Update an existing task's status, priority, title, or notes. Task ids are listed in your context under 'Open tasks'.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The task id" },
        status: { type: "string", enum: STATUSES },
        priority: { type: "string", enum: PRIORITIES },
        title: { type: "string" },
        notes: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "complete_task",
    description: "Mark a task as complete. Call this when the user says something is done.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "The task id" } },
      required: ["id"],
    },
  },
  {
    name: "save_memory",
    description:
      "Store durable information across sessions: a user preference, an important fact, an active project, or a decision. Do not save conversation trivia.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["preference", "fact", "project", "decision"] },
        key: { type: "string", description: "For preferences: a short key like 'editor' or 'tone'" },
        value: { type: "string", description: "The information to remember" },
      },
      required: ["kind", "value"],
    },
  },
  {
    name: "get_command_centre",
    description:
      "Read the B9 Command Centre: this week's live Vernon signals (real headlines + weather) and the latest generated weekly brief (top actions, revenue opportunities, positioning, activation queue). Use whenever NIB asks what B9 should do next, what's happening in Vernon, or for strategy/marketing/planning help. Check briefGeneratedAt — if it's old or null, tell NIB to hit 'Generate Weekly Brief' in the Command Centre.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_news",
    description:
      "Live news headlines from the Command Centre feeds. topic 'sports' = CBC Sports (North America), 'business' = Financial Post (Canada), 'markets' = CNBC (US stock market), 'vernon' = Vernon Matters (local), or 'all'. Use whenever NIB asks about sports, business, market, or local news — read him the top stories.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: ["sports", "business", "markets", "vernon", "all"] },
      },
      required: ["topic"],
    },
  },
  {
    name: "get_markets",
    description:
      "Live index quotes: Dow Jones, S&P 500, Nasdaq, and the TSX (Toronto). Use whenever NIB asks how the markets/stocks are doing — give him the numbers and % changes.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_bookings",
    description:
      "Today's synced B9 bookings (manual sync until the booking platform provides an API). Use when NIB asks about today's bookings or schedule. If empty, tell him nothing is synced and how to sync.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "sync_bookings",
    description:
      "Save today's bookings when NIB dictates them (e.g. 'sync today's bookings: 10am bay 1 Smith, 2pm bay 3 corporate demo'). Replaces the day's list. Parse his message into structured entries.",
    input_schema: {
      type: "object",
      properties: {
        bookings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string" },
              bay: { type: "string" },
              name: { type: "string" },
              note: { type: "string" },
            },
            required: ["time"],
          },
        },
      },
      required: ["bookings"],
    },
  },
  {
    name: "get_weather",
    description:
      "Get live current weather for Vernon, BC (Environment Canada): temperature, humidity, wind, and today's forecast. Use whenever NIB asks about weather, conditions, or wants weather context for business questions (e.g. why bays are empty).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "gmail_summarize",
    description:
      "Summarize NIB's recent Gmail inbox (read-only). Only works when Gmail is connected. Returns sender, subject, snippet, and unread flag for recent messages.",
    input_schema: {
      type: "object",
      properties: { max: { type: "integer", description: "How many recent emails (default 8)" } },
    },
  },
  {
    name: "gmail_search",
    description:
      "Search NIB's Gmail with a Gmail query string like 'from:someone', 'is:unread', 'subject:invoice' (read-only). Only works when Gmail is connected.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Gmail search query" },
        max: { type: "integer", description: "Max results (default 8)" },
      },
      required: ["query"],
    },
  },
  {
    name: "gmail_draft",
    description:
      "Create a DRAFT email in NIB's Gmail for him to review and send himself. NIB2 never sends email. Only works when Gmail is connected.",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body (plain text)" },
      },
      required: ["to", "subject", "body"],
    },
  },
];

async function executeTool(name, input) {
  switch (name) {
    case "add_task": {
      const t = addTask(input);
      return { action: "task_added", detail: t };
    }
    case "update_task": {
      const { id, ...patch } = input;
      const t = updateTask(id, patch);
      return { action: "task_updated", detail: t };
    }
    case "complete_task": {
      const t = completeTask(input.id);
      return { action: "task_completed", detail: t };
    }
    case "save_memory": {
      if (input.kind === "preference") {
        savePreference(input.key || input.value.slice(0, 30), input.value);
      } else {
        saveEntry(input.kind, input.value);
      }
      return { action: "memory_saved", detail: { kind: input.kind, value: input.value } };
    }
    case "get_command_centre": {
      const { readCentre } = await import("./command-centre.js");
      const centre = readCentre();
      if (!centre.brief && !centre.intel) {
        return { action: "command_centre_read", detail: { available: false, note: "Command Centre is empty. NIB should open the Command Centre page and hit 'Generate Weekly Brief'." } };
      }
      return { action: "command_centre_read", detail: centre };
    }
    case "get_news": {
      const topic = input.topic || "all";
      try {
        if (topic === "vernon") {
          const { getVernonNews } = await import("./vernon-intel.js");
          return { action: "news_read", detail: { source: "Vernon Matters", items: await getVernonNews() } };
        }
        const feeds = await import("./feeds.js");
        if (topic === "all") return { action: "news_read", detail: await feeds.getAllFeeds() };
        const fn = { sports: feeds.getSportsNews, business: feeds.getBusinessNews, markets: feeds.getMarketsNews }[topic];
        return { action: "news_read", detail: await fn() };
      } catch (err) {
        return { action: "news_read", detail: { available: false, note: `News feed unavailable right now: ${err.message}` } };
      }
    }
    case "get_markets": {
      try {
        const { getIndices } = await import("./markets.js");
        return { action: "markets_read", detail: await getIndices() };
      } catch (err) {
        return { action: "markets_read", detail: { available: false, note: `Market quotes unavailable right now: ${err.message}` } };
      }
    }
    case "get_bookings": {
      const { readBookings } = await import("./bookings.js");
      const b = readBookings();
      if (!b.bookings.length) {
        return { action: "bookings_read", detail: { synced: false, note: "No bookings synced today. NIB can say 'sync today's bookings: ...' in chat or check the admin page — live API still needs B9 corporate." } };
      }
      return { action: "bookings_read", detail: b };
    }
    case "sync_bookings": {
      const { writeBookings } = await import("./bookings.js");
      const saved = writeBookings(input.bookings, "chat");
      return { action: "bookings_synced", detail: { count: saved.bookings.length, updatedAt: saved.updatedAt } };
    }
    case "get_weather": {
      try {
        const w = await getVernonWeather();
        return { action: "weather_read", detail: w };
      } catch (err) {
        return { action: "weather_read", detail: { available: false, note: `Live weather unavailable right now: ${err.message}` } };
      }
    }
    case "gmail_summarize": {
      // Prefer the n8n webhook (NIB's n8n workflow owns the Google login);
      // fall back to direct OAuth if that's what's configured instead.
      const { isN8nConfigured, fetchUnreadViaN8n } = await import("./gmail-n8n.js");
      if (isN8nConfigured()) {
        try {
          const emails = await fetchUnreadViaN8n();
          return { action: "gmail_read", detail: { connected: true, via: "n8n", unreadOnly: true, emails } };
        } catch (err) {
          return { action: "gmail_read", detail: { connected: false, note: `n8n Gmail webhook failed: ${err.message}` } };
        }
      }
      if (!gmail.isConnected()) {
        return { action: "gmail_read", detail: { connected: false, note: "Gmail is not connected. NIB must set up Gmail (see README) and authorize it." } };
      }
      const emails = await gmail.summarizeInbox(input.max || 8);
      return { action: "gmail_read", detail: { connected: true, via: "oauth", emails } };
    }
    case "gmail_search": {
      if (!gmail.isConnected()) {
        return { action: "gmail_read", detail: { connected: false, note: "Gmail is not connected. NIB must set up Gmail (see README) and authorize it." } };
      }
      const emails = await gmail.searchEmails(input.query, input.max || 8);
      return { action: "gmail_read", detail: { connected: true, emails } };
    }
    case "gmail_draft": {
      if (!gmail.isConnected()) {
        return { action: "gmail_draft", detail: { connected: false, note: "Gmail is not connected — cannot draft." } };
      }
      const draft = await gmail.createDraft(input);
      return { action: "gmail_draft", detail: { connected: true, ...draft, note: "Draft created in Gmail. NIB must review and send it — NIB2 does not send." } };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Runs the chat with a manual tool loop: Claude may call tools (add_task,
// save_memory, ...); we execute them locally, feed results back, and repeat
// until Claude produces its final text answer.
export async function runChat({ client, messages, context, maxIterations = 5 }) {
  const system = [
    { type: "text", text: getSystemPrompt() },
    { type: "text", text: `## Current memory and state\n\n${context}` },
  ];

  const convo = messages.map((m) => ({ role: m.role, content: m.content }));
  const actions = [];

  for (let i = 0; i < maxIterations; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system,
      tools: TOOLS,
      messages: convo,
    });

    if (response.stop_reason !== "tool_use") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply: text || "(NIB2 returned an empty response. Suspicious, but recoverable — try again.)", actions };
    }

    // Execute every tool call, echo the assistant turn + results back.
    convo.push({ role: "assistant", content: response.content });
    const results = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      try {
        const result = await executeTool(block.name, block.input);
        actions.push(result);
        results.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
      } catch (err) {
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${err.message}`,
          is_error: true,
        });
      }
    }
    convo.push({ role: "user", content: results });
  }

  return {
    reply: "I hit my tool-use limit for a single turn. The actions I did complete are saved — ask me to continue.",
    actions,
  };
}

// One-shot summarization for session handoffs (no tools needed).
export async function runHandoff({ client, messages }) {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "NIB2"}: ${typeof m.content === "string" ? m.content : JSON.stringify(m.content)}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: getSystemPrompt(),
    messages: [
      {
        role: "user",
        content:
          `Summarize this work session for handoff. Start with the exact heading **Pickup Where You Left Off** and cover: completed work, current state, files changed, open issues, important decisions, recommended next action.\n\nSession transcript:\n\n${transcript}`,
      },
    ],
  });

  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

// Translate SDK errors into human-readable messages for the UI.
export function describeApiError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 401, message: "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env.local." };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "Rate limited by the Anthropic API. Wait a minute and try again." };
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return { status: 502, message: "Could not reach the Anthropic API. Check the internet connection on the server computer." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, message: `Anthropic API error (${err.status}): ${err.message}` };
  }
  return { status: 500, message: `Unexpected server error: ${err.message}` };
}
