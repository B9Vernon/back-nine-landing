import { test } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";
import { createApp, startServer, startupPort, formatPortInUseMessage } from "../server.js";

test("startupPort uses process.env.NIB2_PORT or defaults to 3900", () => {
  const saved = process.env.NIB2_PORT;
  try {
    delete process.env.NIB2_PORT;
    assert.equal(startupPort(), 3900);
    process.env.NIB2_PORT = "4199";
    assert.equal(startupPort(), 4199);
  } finally {
    if (saved === undefined) delete process.env.NIB2_PORT; else process.env.NIB2_PORT = saved;
  }
});

test("port already in use handling is beginner-friendly, not a crash", async () => {
  const blocker = net.createServer();
  await new Promise((resolve) => blocker.listen(0, "127.0.0.1", resolve));
  const port = blocker.address().port;
  let message = "";
  const server = startServer({
    app: createApp(),
    port,
    host: "127.0.0.1",
    log: () => {},
    error: (text) => { message += String(text); },
    exitOnError: false,
  });

  await new Promise((resolve) => server.once("error", resolve));
  blocker.close();

  assert.match(message, new RegExp(`port ${port} is already in use`));
  assert.match(message, new RegExp(`http://localhost:${port}`));
  assert.match(message, /did not stop anything automatically/i);
});

test("formatPortInUseMessage points NIB to localhost 3900", () => {
  const message = formatPortInUseMessage(3900);
  assert.match(message, /http:\/\/localhost:3900/);
  assert.match(message, /already be running/i);
});
