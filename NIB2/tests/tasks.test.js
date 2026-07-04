import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.NIB2_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "nib2-tasks-"));
const { addTask, updateTask, completeTask, listTasks } = await import("../lib/tasks.js");

test("addTask creates a task with defaults", () => {
  const t = addTask({ title: "Test the tests" });
  assert.equal(t.status, "pending");
  assert.equal(t.priority, "medium");
  assert.ok(t.id && t.createdAt && t.updatedAt);
  assert.equal(listTasks().length, 1);
});

test("addTask rejects empty titles", () => {
  assert.throws(() => addTask({ title: "   " }));
  assert.throws(() => addTask({}));
});

test("addTask rejects bogus priority", () => {
  assert.throws(() => addTask({ title: "x", priority: "apocalyptic" }));
});

test("updateTask changes status and validates values", () => {
  const t = addTask({ title: "Update me", priority: "high" });
  const updated = updateTask(t.id, { status: "in_progress", notes: "going well" });
  assert.equal(updated.status, "in_progress");
  assert.equal(updated.notes, "going well");
  assert.throws(() => updateTask(t.id, { status: "vibing" }));
  assert.throws(() => updateTask("nope-not-real", { status: "pending" }));
});

test("completeTask marks a task complete", () => {
  const t = addTask({ title: "Finish me" });
  const done = completeTask(t.id);
  assert.equal(done.status, "complete");
});
