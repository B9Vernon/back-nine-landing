// NIB2 server. Run with: npm start
// Serves the dashboard and API on your local network so both computers can use it.
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import express from "express";
import dotenv from "dotenv";
import { createApiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local (preferred) then .env, relative to this file — works no
// matter which folder you launch from.
dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

export function createApp(deps = {}) {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.use("/api", createApiRouter(deps));
  app.use(express.static(path.join(__dirname, "public")));

  // JSON parse errors and anything else uncaught: readable, not a stack vomit.
  app.use((err, req, res, next) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ error: "That request body was not valid JSON." });
    }
    console.error("NIB2 unhandled error:", err);
    res.status(500).json({ error: "Internal server error. Check the server terminal for details." });
  });

  return app;
}

function lanAddresses() {
  const addrs = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces || []) {
      if (iface.family === "IPv4" && !iface.internal) addrs.push(iface.address);
    }
  }
  return addrs;
}

export function startupPort() {
  return Number(process.env.NIB2_PORT || 3900);
}

export function formatPortInUseMessage(port) {
  return [
    "",
    `  NIB2 could not start because port ${port} is already in use.`,
    "",
    `  NIB2 may already be running here: http://localhost:${port}`,
    "  Open that address in your browser first.",
    "",
    "  If it does not load, close the other NIB2 terminal/window and run npm start again.",
    "  I did not stop anything automatically, just in case another app is using that port.",
    "",
  ].join("\n");
}

export function startServer({
  app = createApp(),
  port = startupPort(),
  host = "0.0.0.0",
  log = console.log,
  error = console.error,
  exitOnError = true,
} = {}) {
  const server = app.listen(port, host, () => {
    log("");
    log("  NIB2 online.");
    log(`  This computer:  http://localhost:${port}`);
    for (const ip of lanAddresses()) {
      log(`  Other computer: http://${ip}:${port}`);
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      log("");
      log("  WARNING: No ANTHROPIC_API_KEY found. Copy .env.example to .env.local,");
      log("  add your key, and restart. The dashboard will load but chat is offline.");
    }
    log("");
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      error(formatPortInUseMessage(port));
    } else {
      error("  NIB2 could not start.");
      error(err);
    }
    if (exitOnError) process.exitCode = 1;
  });

  return server;
}

// Only start listening when run directly (tests import createApp instead).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer();
}
