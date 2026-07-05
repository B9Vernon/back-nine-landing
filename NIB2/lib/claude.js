// NIB2's connection to the Anthropic API, including the tool loop that lets
// NIB2 create tasks and save memories itself.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { addTask, updateTask, completeTask, PRIORITIES, STATUSES } from "./tasks.js";
import { savePreference, saveEntry } from "./memory.js";
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
    case "gmail_summarize": {
      if (!gmail.isConnected()) {
        return { action: "gmail_read", detail: { connected: false, note: "Gmail is not connected. NIB must set up Gmail (see README) and authorize it." } };
      }
      const emails = await gmail.summarizeInbox(input.max || 8);
      return { action: "gmail_read", detail: { connected: true, emails } };
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
