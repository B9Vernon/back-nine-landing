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

// Only start listening when run directly (tests import createApp instead).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.NIB2_PORT) || 3900;
  const app = createApp();
  app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("  NIB2 online.");
    console.log(`  This computer:  http://localhost:${PORT}`);
    for (const ip of lanAddresses()) {
      console.log(`  Other computer: http://${ip}:${PORT}`);
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("");
      console.log("  WARNING: No ANTHROPIC_API_KEY found. Copy .env.example to .env.local,");
      console.log("  add your key, and restart. The dashboard will load but chat is offline.");
    }
    console.log("");
  });
}
