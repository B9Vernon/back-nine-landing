// NIB2 task tracking. Stored in data/tasks.json.
import crypto from "node:crypto";
import { readJson, writeJson } from "./store.js";

const FILE = "tasks.json";
const EMPTY = { tasks: [] };

export const STATUSES = ["pending", "in_progress", "blocked", "complete"];
export const PRIORITIES = ["low", "medium", "high", "critical"];

function load() {
  const data = readJson(FILE, EMPTY);
  if (!Array.isArray(data.tasks)) data.tasks = [];
  return data;
}

export function listTasks() {
  return load().tasks;
}

export function getOpenTasks() {
  return listTasks().filter((t) => t.status !== "complete");
}

export function addTask({ title, priority = "medium", notes = "" }) {
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("A task needs a title. Even chaos gets labelled.");
  }
  if (!PRIORITIES.includes(priority)) {
    throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  const now = new Date().toISOString();
  const task = {
    id: crypto.randomUUID().slice(0, 8),
    title: title.trim(),
    status: "pending",
    priority,
    notes: String(notes || ""),
    createdAt: now,
    updatedAt: now,
  };
  const data = load();
  data.tasks.push(task);
  writeJson(FILE, data);
  return task;
}

export function updateTask(id, patch = {}) {
  const data = load();
  const task = data.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`No task with id "${id}".`);
  if (patch.status !== undefined && !STATUSES.includes(patch.status)) {
    throw new Error(`Status must be one of: ${STATUSES.join(", ")}`);
  }
  if (patch.priority !== undefined && !PRIORITIES.includes(patch.priority)) {
    throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}`);
  }
  if (patch.title !== undefined) {
    if (!String(patch.title).trim()) throw new Error("Task title cannot be empty.");
    task.title = String(patch.title).trim();
  }
  if (patch.status !== undefined) task.status = patch.status;
  if (patch.priority !== undefined) task.priority = patch.priority;
  if (patch.notes !== undefined) task.notes = String(patch.notes);
  task.updatedAt = new Date().toISOString();
  writeJson(FILE, data);
  return task;
}

export function completeTask(id) {
  return updateTask(id, { status: "complete" });
}
